<template>
  <div class="admin-repair-container">
    <el-card class="admin-repair-card">
      <template #header>
        <div class="page-header">
          <h2>工单管理</h2>
          <el-button type="primary" @click="handleExport">
            导出报表
          </el-button>
        </div>
      </template>

      <div class="filter-section">
        <el-select v-model="filterStatus" placeholder="按状态筛选" clearable class="filter-item">
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
        <el-table-column prop="priority" label="优先级" width="120">
          <template #default="{ row }">
            <el-select 
              v-model="row.priority" 
              size="small"
              @change="(value) => handlePriorityChange(row, value)"
            >
              <el-option label="普通" value="normal" />
              <el-option label="紧急" value="urgent" />
              <el-option label="特急" value="very_urgent" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="维修人员" width="180">
          <template #default="{ row }">
            <el-select 
              v-if="row.status === 'pending'"
              v-model="row.maintainerId"
              size="small"
              placeholder="请选择维修人员"
              @change="(value) => handleAssign(row, value)"
            >
              <el-option 
                v-for="maintainer in maintainers" 
                :key="maintainer.id"
                :label="maintainer.name"
                :value="maintainer.id"
              />
            </el-select>
            <span v-else>{{ row.maintainer?.name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">
              查看
            </el-button>
            <el-button
              v-if="row.status !== 'completed'"
              link
              type="danger"
              @click="handleClose(row)"
            >
              关闭
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
import { getRepairList, assignRepair, updateRepairPriority, closeRepair } from '../api/repairsController'

const router = useRouter()

// 列表数据
const repairs = ref([])
const loading = ref(false)
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Mock维修人员数据
const maintainers = ref([
  { id: '1', name: '张工' },
  { id: '2', name: '李工' },
  { id: '3', name: '王工' }
])

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

// 分配维修人员
const handleAssign = async (repair: any, maintainerId: string) => {
  try {
    const res = await assignRepair({
      repairId: repair.id,
      maintainerId
    })
    if (res.data.code === 0) {
      ElMessage.success('分配成功')
      await fetchRepairs()
    } else {
      ElMessage.error(res.data.message || '分配失败')
    }
  } catch (error) {
    console.error('分配维修人员失败:', error)
    ElMessage.error('分配失败')
  }
}

// 修改优先级
const handlePriorityChange = async (repair: any, priority: string) => {
  try {
    const res = await updateRepairPriority({
      repairId: repair.id,
      priority
    })
    if (res.data.code === 0) {
      ElMessage.success('优先级更新成功')
      await fetchRepairs()
    } else {
      ElMessage.error(res.data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新优先级失败:', error)
    ElMessage.error('更新失败')
  }
}

// 强制关闭工单
const handleClose = async (repair: any) => {
  try {
    await ElMessageBox.confirm('确定要关闭该工单吗？', '提示', {
      type: 'warning'
    })
    
    const res = await closeRepair({ repairId: repair.id })
    if (res.data.code === 0) {
      ElMessage.success('工单已关闭')
      await fetchRepairs()
    } else {
      ElMessage.error(res.data.message || '关闭失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关闭工单失败:', error)
      ElMessage.error('关闭失败')
    }
  }
}

// 导出报表
const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中')
}

// 查看详情
const viewDetail = (id: string) => {
  router.push(`/repair/${id}`)
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
.admin-repair-container {
  padding: 20px;

  .admin-repair-card {
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
      
      .filter-item {
        margin-right: 12px;
        width: 200px;
      }
    }

    .pagination-section {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>