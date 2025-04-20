<template>
  <div class="equipment-detail-container">
    <el-card class="equipment-detail-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="router.back()" link>
              <el-icon><ArrowLeft /></el-icon>返回
            </el-button>
            <h2>设备详情</h2>
          </div>
          <div class="header-buttons">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备名称">{{ equipment.name }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ equipment.type }}</el-descriptions-item>
        <el-descriptions-item label="型号">{{ equipment.model }}</el-descriptions-item>
        <el-descriptions-item label="位置">
          {{ formatLocation(equipment.location) }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(equipment.status)">{{ getStatusText(equipment.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">{{ equipment.description }}</el-descriptions-item>
      </el-descriptions>

      <!-- 维修历史 -->
      <div class="repair-history">
        <h3>维修历史</h3>
        <el-timeline>
          <el-timeline-item
            v-for="record in repairHistory"
            :key="record.id"
            :timestamp="record.createTime"
            :type="getTimelineItemType(record.status)"
          >
            <h4>{{ getStatusText(record.status) }}</h4>
            <p>{{ record.description }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <!-- 编辑设备对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑设备"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="型号">
          <el-input v-model="editForm.model" />
        </el-form-item>
        <el-form-item label="位置" required>
          <el-cascader
            v-model="editForm.location"
            :options="locationOptions"
            :props="{
              expandTrigger: 'hover',
              value: 'value',
              label: 'label',
              children: 'children'
            }"
            placeholder="请选择位置"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="故障" value="broken" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllLocations } from '../api/locationController'
import { updateEquipments } from '../api/equipmentController'

const router = useRouter()
const route = useRoute()

// 状态变量
const equipment = ref({
  id: '',
  name: '',
  type: '',
  model: '',
  location: '',
  status: 'normal',
  description: ''
})

const repairHistory = ref([])
const showEditDialog = ref(false)
const locationOptions = ref([])

// 编辑表单
const editForm = ref({
  id: '',
  model: '',
  location: [],
  status: 'normal',
  description: ''
})

// 获取位置信息
const fetchLocations = async () => {
  try {
    const res = await getAllLocations()
    if (res.data.code === 0) {
      const transformToTree = (items: any[]) => {
        const map = new Map()
        const roots = []

        items.forEach(item => {
          map.set(item.id, {
            value: item.name,
            label: item.name,
            children: []
          })
        })

        items.forEach(item => {
          const node = map.get(item.id)
          if (item.parentId === null) {
            roots.push(node)
          } else {
            const parent = map.get(item.parentId)
            if (parent) {
              parent.children.push(node)
            }
          }
        })

        return roots
      }

      locationOptions.value = transformToTree(res.data.data)
    }
  } catch (error) {
    console.error('获取位置信息失败:', error)
    ElMessage.error('获取位置信息失败')
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const types = {
    normal: 'success',
    broken: 'danger',
    maintenance: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    normal: '正常',
    maintenance: '维修中',
    broken: '故障'
  }
  return texts[status] || '未知'
}

const getTimelineItemType = (status: string) => {
  const types = {
    completed: 'success',
    processing: 'warning',
    pending: 'info'
  }
  return types[status] || 'info'
}

const formatLocation = (location: string | object) => {
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location
    return `${loc.area} - ${loc.building} - ${loc.floor}`
  } catch (e) {
    return '位置未知'
  }
}

// 事件处理函数
const handleEdit = () => {
  const location = typeof equipment.value.location === 'string'
    ? JSON.parse(equipment.value.location)
    : equipment.value.location

  editForm.value = {
    id: equipment.value.id,
    model: equipment.value.model,
    status: equipment.value.status,
    description: equipment.value.description,
    location: [location.area, location.building, location.floor]
  }
  showEditDialog.value = true
}

const handleUpdate = async () => {
  try {
    const locationPath = editForm.value.location
    const locationData = {
      area: locationPath[0],
      building: locationPath[1],
      floor: locationPath[2]
    }

    const data = {
      ...editForm.value,
      location: JSON.stringify(locationData)
    }

    await updateEquipments(data)
    ElMessage.success('更新成功')
    showEditDialog.value = false
    // 刷新设备信息
    fetchEquipmentDetail()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败')
  }
}

const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除这个设备吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // TODO: 调用删除API
      ElMessage.success('删除成功')
      router.back()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 获取设备详情
const fetchEquipmentDetail = async () => {
  // TODO: 调用获取设备详情API
  // 模拟数据
  equipment.value = {
    id: route.params.id as string,
    name: '测试设备',
    type: '打印机',
    model: 'HP-123',
    location: JSON.stringify({
      area: '主楼',
      building: 'A座',
      floor: '3层'
    }),
    status: 'normal',
    description: '这是一台测试设备'
  }
}

// 获取维修历史
const fetchRepairHistory = async () => {
  // TODO: 调用获取维修历史API
  // 模拟数据
  repairHistory.value = [
    {
      id: 1,
      status: 'completed',
      description: '例行维护',
      createTime: '2023-12-01 10:00:00'
    },
    {
      id: 2,
      status: 'completed',
      description: '更换零件',
      createTime: '2023-12-10 14:30:00'
    }
  ]
}

onMounted(async () => {
  await Promise.all([
    fetchLocations(),
    fetchEquipmentDetail(),
    fetchRepairHistory()
  ])
})
</script>

<style scoped lang="scss">
.equipment-detail-container {
  padding: 20px;

  .equipment-detail-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        h2 {
          margin: 0;
        }
      }

      .header-buttons {
        display: flex;
        gap: 12px;
      }
    }
  }

  .repair-history {
    margin-top: 24px;

    h3 {
      margin-bottom: 16px;
    }
  }

  :deep(.el-descriptions) {
    margin: 20px 0;
  }
}
</style>