<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>维修工单管理</h2>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索工单"
              :prefix-icon="Search"
              class="search-input"
            />
            <el-select v-model="statusFilter" placeholder="工单状态" clearable>
              <el-option label="待处理" value="pending" />
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
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="viewDetail(row.id)">
                查看
              </el-button>
              <el-button 
                type="success" 
                link 
                @click="handleAcceptOrder(row.id)"
                v-if="row.status === 'pending'"
              >
                接单
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
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
    status: 'pending',
    createdAt: '2023-08-01 10:30:00'
  },
  {
    id: 'R2023080002',
    type: '水管',
    location: '宿舍楼3-521',
    description: '水管漏水',
    priority: 'normal',
    status: 'processing',
    createdAt: '2023-08-01 14:20:00'
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
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }
  return labels[status] || '未知'
}

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
}

// 接单处理
const handleAcceptOrder = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认接单处理该维修工单？', '确认接单', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用接单API
    ElMessage.success('接单成功')
  } catch (error) {
    console.error('接单失败:', error)
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
.orders-container {
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
</style>