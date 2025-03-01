<template>
  <el-card class="processing-orders-card">
    <template #header>
      <div class="card-header">
        <h3>进行中的工单</h3>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工单"
          :prefix-icon="Search"
          class="search-input"
        />
      </div>
    </template>

    <div class="orders-grid">
      <el-card
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
        shadow="hover"
      >
        <div class="order-header">
          <span class="order-id">{{ order.id }}</span>
          <el-tag :type="getPriorityType(order.priority)" effect="dark" size="small">
            {{ getPriorityLabel(order.priority) }}
          </el-tag>
        </div>

        <div class="order-content">
          <div class="order-info">
            <el-icon><Tools /></el-icon>
            <span>{{ order.type }}</span>
          </div>
          <div class="order-info">
            <el-icon><Location /></el-icon>
            <span>{{ order.location }}</span>
          </div>
          <div class="order-description">
            <el-icon><Document /></el-icon>
            <el-text class="mx-1" truncated>{{ order.description }}</el-text>
          </div>
        </div>

        <div class="order-footer">
          <span class="order-time">
            <el-icon><Timer /></el-icon>
            {{ order.acceptedAt }}
          </span>
          <div class="order-actions">
            <el-button type="primary" link @click="viewDetail(order.id)">
              查看详情
            </el-button>
            <el-button type="success" link @click="handleUpdateStatus(order)">
              更新进度
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalOrders"
        :page-sizes="[8, 16, 24, 32]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Tools, Location, Document, Timer } from '@element-plus/icons-vue'

const router = useRouter()
const emit = defineEmits(['update-status'])

// 搜索
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(8)
const totalOrders = ref(0)

// Props
const props = defineProps<{
  orders: Array<{
    id: string
    type: string
    location: string
    description: string
    priority: string
    status: string
    acceptedAt: string
  }>
}>()

// 过滤工单列表
const filteredOrders = computed(() => {
  const filtered = props.orders.filter(order =>
    searchKeyword.value
      ? Object.values(order).some(value =>
          String(value).toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
      : true
  )
  totalOrders.value = filtered.length
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.slice(start, start + pageSize.value)
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

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
}

// 更新状态
const handleUpdateStatus = (order: any) => {
  emit('update-status', order)
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
</script>

<style scoped lang="scss">
.processing-orders-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .search-input {
      width: 200px;
    }
  }

  .orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .order-card {
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .order-id {
        font-weight: 600;
        color: #606266;
      }
    }

    .order-content {
      .order-info {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        color: #606266;

        .el-icon {
          margin-right: 8px;
        }
      }

      .order-description {
        display: flex;
        align-items: flex-start;
        margin-top: 12px;
        color: #606266;

        .el-icon {
          margin-right: 8px;
          margin-top: 3px;
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      .order-time {
        display: flex;
        align-items: center;
        color: #909399;
        font-size: 13px;

        .el-icon {
          margin-right: 4px;
        }
      }

      .order-actions {
        display: flex;
        gap: 8px;
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