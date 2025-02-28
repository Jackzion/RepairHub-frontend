<template>
  <div class="repair-detail-container">
    <el-card class="repair-detail-card">
      <template #header>
        <div class="page-header">
          <el-page-header @back="router.back()" title="返回" content="报修详情" />
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="报修编号">
          {{ repair.id }}
        </el-descriptions-item>
        <el-descriptions-item label="报修状态">
          <el-tag :type="getStatusType(repair.status)">
            {{ getStatusText(repair.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ getDeviceTypeText(repair.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getPriorityType(repair.priority)">
            {{ getPriorityText(repair.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="位置信息" :span="2">
          {{ repair.location?.join(' - ') }} - {{ repair.locationDetail }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">
          {{ repair.description }}
        </el-descriptions-item>
        <el-descriptions-item label="报修时间">
          {{ formatDate(repair.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="报修人">
          {{ repair.creator?.name }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 图片展示区域 -->
      <div v-if="repair.images?.length" class="image-section">
        <h3>现场图片</h3>
        <el-image
          v-for="(url, index) in repair.images"
          :key="index"
          :src="url"
          :preview-src-list="repair.images"
          class="repair-image"
          fit="cover"
        />
      </div>

      <!-- 维修记录 -->
      <div class="repair-records">
        <h3>处理记录</h3>
        <el-timeline>
          <el-timeline-item
            v-for="record in repair.records"
            :key="record.id"
            :timestamp="formatDate(record.createdAt)"
            :type="getTimelineItemType(record.type)"
          >
            <h4>{{ getRecordTypeText(record.type) }}</h4>
            <p>{{ record.content }}</p>
            <p v-if="record.handler" class="handler-info">
              处理人：{{ record.handler.name }}
            </p>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 状态更新（仅维修人员可见） -->
      <div v-if="isMaintenanceStaff" class="status-update">
        <el-divider />
        <h3>更新状态</h3>
        <el-form :model="updateForm" :rules="updateRules" ref="updateFormRef" label-width="100px">
          <el-form-item label="处理状态" prop="status">
            <el-select v-model="updateForm.status" class="w-full">
              <el-option label="接单处理" value="processing" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理说明" prop="content">
            <el-input
              v-model="updateForm.content"
              type="textarea"
              :rows="3"
              placeholder="请输入处理说明"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="updating" @click="handleUpdateStatus">
              提交更新
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 判断是否为维修人员
const isMaintenanceStaff = authStore.user?.role === 'maintainer'

// 报修信息
const repair = ref({
  id: '',
  type: '',
  location: [],
  locationDetail: '',
  priority: '',
  description: '',
  status: 'pending',
  images: [],
  creator: null,
  createdAt: '',
  records: []
})

// 状态更新表单
const updateForm = ref({
  status: '',
  content: ''
})

const updateRules = {
  status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
  content: [{ required: true, message: '请输入处理说明', trigger: 'blur' }]
}

const updating = ref(false)
const updateFormRef = ref<FormInstance>()

// 获取报修详情
onMounted(async () => {
  try {
    // TODO: 调用API获取报修详情
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟数据
    repair.value = {
      id: route.params.id as string,
      type: 'air_conditioner',
      location: ['教学楼', 'A栋', '3层'],
      locationDetail: '3楼东侧走廊',
      priority: 'urgent',
      description: '空调不制冷，温度无法调节',
      status: 'pending',
      images: [],
      creator: { name: '张三', id: '1001' },
      createdAt: '2024-01-20 10:00:00',
      records: [
        {
          id: '1',
          type: 'create',
          content: '创建报修工单',
          createdAt: '2024-01-20 10:00:00',
          handler: { name: '张三', id: '1001' }
        }
      ]
    }
  } catch (error) {
    ElMessage.error('获取报修详情失败')
  }
})

// 更新状态
const handleUpdateStatus = async () => {
  if (!updateFormRef.value) return
  
  await updateFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      updating.value = true
      try {
        // TODO: 调用API更新状态
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('状态更新成功')
        // 重新加载数据
        // TODO: 重新获取报修详情
      } catch (error) {
        ElMessage.error('状态更新失败')
      } finally {
        updating.value = false
      }
    }
  })
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

const getTimelineItemType = (type: string) => {
  const types: Record<string, string> = {
    create: 'primary',
    process: 'warning',
    complete: 'success'
  }
  return types[type] || 'info'
}

const getRecordTypeText = (type: string) => {
  const texts: Record<string, string> = {
    create: '创建工单',
    process: '处理中',
    complete: '完成维修'
  }
  return texts[type] || '未知操作'
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
</script>

<style scoped lang="scss">
.repair-detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;

  .repair-detail-card {
    max-width: 1000px;
    margin: 0 auto;

    .page-header {
      margin: -8px 0;
    }
  }

  .image-section {
    margin-top: 24px;

    h3 {
      margin-bottom: 16px;
      font-weight: 500;
      color: #303133;
    }

    .repair-image {
      width: 120px;
      height: 120px;
      margin-right: 12px;
      margin-bottom: 12px;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .repair-records {
    margin-top: 24px;

    h3 {
      margin-bottom: 16px;
      font-weight: 500;
      color: #303133;
    }

    .handler-info {
      margin-top: 8px;
      color: #909399;
      font-size: 13px;
    }
  }

  .status-update {
    margin-top: 24px;

    h3 {
      margin-bottom: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .w-full {
    width: 100%;
  }
}
</style>