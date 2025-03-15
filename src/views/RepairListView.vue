<template>
  <div class="repair-list-container">
    <el-card class="repair-list-card">
      <template #header>
        <div class="page-header">
          <h2>我的报修</h2>
          <el-button type="primary" @click="router.push('/repair/new')">
            新建报修
          </el-button>
        </div>
      </template>

      <div class="filter-section">
        <el-select v-model="filterStatus" placeholder="按状态筛选" clearable>
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </div>

      <el-table :data="filteredRepairs" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="工单编号" width="120" />
        <el-table-column prop="type" label="设备类型" width="120">
          <template #default="{ row }">
            {{ getDeviceTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="位置信息">
          <template #default="{ row }">
            {{ row.location?.join(' - ') }} - {{ row.locationDetail }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="danger"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRepairList, cancelRepair } from '../api/repairsController'

const router = useRouter()

// 列表数据
const repairs = ref([])
const loading = ref(false)
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 根据状态筛选
const filteredRepairs = computed(() => {
  if (!filterStatus.value) return repairs.value
  return repairs.value.filter((repair: any) => repair.status === filterStatus.value)
})

// 获取报修列表
const fetchRepairs = async () => {
  loading.value = true
  try {
    const res = await getRepairList({
      current: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.data.code === 0 && res.data.data) {
      repairs.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    }
  } catch (error) {
    console.error('获取报修列表失败:', error)
    ElMessage.error('获取报修列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
}

// 取消报修
const handleCancel = async (repair: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该报修工单吗？', '提示', {
      type: 'warning'
    })
    
    const res = await cancelRepair({ repairId: repair.id })
    if (res.data.code === 0) {
      ElMessage.success('工单已取消')
      await fetchRepairs()
    } else {
      ElMessage.error(res.data.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消报修失败:', error)
      ElMessage.error('取消失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRepairs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRepairs()
}

// 工具函数
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    completed: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  }
  return texts[status] || '未知状态'
}

const getDeviceTypeText = (type: string) => {
  const texts: Record<string, string> = {
    air_conditioner: '空调',
    plumbing: '水管',
    electrical: '电路',
    doors_windows: '门窗',
    others: '其他'
  }
  return texts[type] || '未知类型'
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    normal: 'info',
    urgent: 'warning',
    very_urgent: 'danger'
  }
  return types[priority] || 'info'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    normal: '普通',
    urgent: '紧急',
    very_urgent: '特急'
  }
  return texts[priority] || '未知'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化加载
onMounted(fetchRepairs)
</script>

<style scoped lang="scss">
.repair-list-container {
  padding: 20px;

  .repair-list-card {
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -8px 0;

      h2 {
        margin: 0;
      }
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .pagination-section {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>