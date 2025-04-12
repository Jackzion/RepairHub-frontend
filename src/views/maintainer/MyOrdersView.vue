<template>
  <div class="my-orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>我的工单</h2>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索工单"
              :prefix-icon="Search"
              class="search-input"
            />
            <el-select v-model="statusFilter" placeholder="工单状态" clearable>
              <el-option label="处理中" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filteredOrders" style="width: 100%">
        <el-table-column prop="id" label="工单编号" width="120" />
        <el-table-column prop="type" label="报修类型" width="100" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="description" label="问题描述" show-overflow-tooltip />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="acceptedAt" label="接单时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="viewDetail(row.id)">
                查看
              </el-button>
              <el-button 
                type="success" 
                link 
                @click="handleUpdateStatus(row)"
                v-if="row.status === 'processing'"
              >
                更新进度
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalOrders"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 进度更新对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新维修进度"
      width="500px"
    >
      <el-form :model="updateForm" label-width="100px">
        <el-form-item label="维修进度">
          <el-select v-model="updateForm.status" placeholder="请选择维修进度">
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="updateForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpdate" :loading="updating">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

// 搜索和筛选
const searchKeyword = ref('')
const statusFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(100)

// Mock数据
const orders = ref([
  {
    id: 'R2023080001',
    type: '空调',
    location: '教学楼A-203',
    description: '空调制冷效果差',
    priority: 'high',
    status: 'processing',
    acceptedAt: '2023-08-01 10:35:00'
  },
  {
    id: 'R2023080002',
    type: '水管',
    location: '宿舍楼3-521',
    description: '水管漏水',
    priority: 'normal',
    status: 'completed',
    acceptedAt: '2023-08-01 14:25:00'
  }
])

// 过滤工单列表
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesKeyword = searchKeyword.value
      ? Object.values(order).some(value =>
          String(value).toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
      : true
    const matchesStatus = statusFilter.value
      ? order.status === statusFilter.value
      : true
    return matchesKeyword && matchesStatus
  })
})

// 优先级标签
const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    high: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    high: '高',
    normal: '中',
    low: '低'
  }
  return labels[priority] || '未知'
}

// 状态标签
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    processing: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    processing: '处理中',
    completed: '已完成'
  }
  return labels[status] || '未知'
}

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
}

// 更新进度相关
const updateDialogVisible = ref(false)
const updating = ref(false)
const currentOrder = ref<any>(null)
const updateForm = ref({
  status: '',
  description: ''
})

const handleUpdateStatus = (order: any) => {
  currentOrder.value = order
  updateForm.value.status = order.status
  updateForm.value.description = ''
  updateDialogVisible.value = true
}

const submitUpdate = async () => {
  if (!updateForm.value.description) {
    ElMessage.warning('请输入处理说明')
    return
  }

  updating.value = true
  try {
    // TODO: 调用更新API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('更新成功')
    updateDialogVisible.value = false
    // TODO: 重新加载数据
  } catch (error) {
    ElMessage.error('更新失败')
  } finally {
    updating.value = false
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped lang="scss">
.my-orders-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 18px;
    }

    .header-actions {
      display: flex;
      gap: 16px;

      .search-input {
        width: 200px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>