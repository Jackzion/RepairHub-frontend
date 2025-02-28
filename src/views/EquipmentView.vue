<template>
  <div class="equipment-container">
    <el-card class="equipment-card">
      <template #header>
        <div class="card-header">
          <h2>设备管理</h2>
          <el-button type="primary" @click="dialogVisible = true">
            <el-icon><Plus /></el-icon>添加设备类型
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="设备类型" name="types">
          <el-table :data="equipmentTypes" style="width: 100%">
            <el-table-column prop="name" label="设备类型" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="count" label="设备数量" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="editType(row)">编辑</el-button>
                <el-button link type="danger" @click="deleteType(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="维修指南" name="guides">
          <el-table :data="maintenanceGuides" style="width: 100%">
            <el-table-column prop="equipmentType" label="设备类型" />
            <el-table-column prop="title" label="指南标题" />
            <el-table-column prop="updateTime" label="更新时间" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="viewGuide(row)">查看</el-button>
                <el-button link type="primary" @click="editGuide(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加/编辑设备类型对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingType ? '编辑设备类型' : '添加设备类型'"
      width="500px"
    >
      <el-form :model="typeForm" label-width="100px">
        <el-form-item label="设备类型名称" required>
          <el-input v-model="typeForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="typeForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveType">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('types')
const dialogVisible = ref(false)
const editingType = ref(null)

// Mock数据
const equipmentTypes = ref([
  { id: 1, name: '空调', description: '中央空调及分体空调', count: 150 },
  { id: 2, name: '照明', description: '教室、办公室照明设备', count: 300 },
  { id: 3, name: '电梯', description: '各教学楼电梯', count: 20 },
  { id: 4, name: '饮水机', description: '饮用水设备', count: 80 }
])

const maintenanceGuides = ref([
  {
    id: 1,
    equipmentType: '空调',
    title: '空调日常维护指南',
    updateTime: '2023-08-15'
  },
  {
    id: 2,
    equipmentType: '电梯',
    title: '电梯故障应急处理',
    updateTime: '2023-08-10'
  },
  {
    id: 3,
    equipmentType: '饮水机',
    title: '饮水机清洗消毒指南',
    updateTime: '2023-08-05'
  }
])

const typeForm = ref({
  name: '',
  description: ''
})

const editType = (row) => {
  editingType.value = row
  typeForm.value = { ...row }
  dialogVisible.value = true
}

const deleteType = (row) => {
  ElMessage.success('删除成功')
  equipmentTypes.value = equipmentTypes.value.filter(item => item.id !== row.id)
}

const saveType = () => {
  if (!typeForm.value.name) {
    ElMessage.warning('请输入设备类型名称')
    return
  }

  if (editingType.value) {
    const index = equipmentTypes.value.findIndex(item => item.id === editingType.value.id)
    equipmentTypes.value[index] = { ...editingType.value, ...typeForm.value }
    ElMessage.success('更新成功')
  } else {
    equipmentTypes.value.push({
      id: Date.now(),
      ...typeForm.value,
      count: 0
    })
    ElMessage.success('添加成功')
  }

  dialogVisible.value = false
  editingType.value = null
  typeForm.value = { name: '', description: '' }
}

const viewGuide = (row) => {
  ElMessage.info('查看维修指南：' + row.title)
}

const editGuide = (row) => {
  ElMessage.info('编辑维修指南：' + row.title)
}
</script>

<style scoped lang="scss">
.equipment-container {
  padding: 20px;

  .equipment-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>