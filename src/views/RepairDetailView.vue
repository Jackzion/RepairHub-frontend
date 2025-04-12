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
          {{ repair.type }}
        </el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag :type="getPriorityType(repair.priority)">
            {{ getPriorityText(repair.priority) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="位置信息" :span="2">
          {{ typeof repair.location === 'string' ? JSON.parse(repair.location).area + ' - ' + JSON.parse(repair.location).building + ' - ' + JSON.parse(repair.location).floor : repair.location?.area + ' - ' + repair.location?.building + ' - ' + repair.location?.floor }} {{ repair.locationDetail }}
        </el-descriptions-item>
        <el-descriptions-item label="问题描述" :span="2">
          {{ repair.description }}
        </el-descriptions-item>
        <el-descriptions-item label="报修时间">
          {{ formatDateTime(repair.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="报修人">
          {{ repair.creatorId }}
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
            v-for="record in records"
            :key="record.id"
            :timestamp="formatDateTime(record.createdAt)"
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
      <div class="status-update" v-if="isMaintenanceStaff">
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
      <!-- 评价按钮和弹窗 -->
      <div class="rating-section" v-if="repair.status === 'completed' && !isMaintenanceStaff">
        <el-button type="primary" @click="openRatingDialog" v-if="!hasRated">
          评价维修服务
        </el-button>
        <div class="rated-watermark" v-else>已评价</div>
      </div>

      <el-dialog
        v-model="showRatingDialog"
        title="维修服务评价"
        width="500px"
        class="rating-dialog"
        :close-on-click-modal="false"
      >
        <el-form :model="ratingForm" :rules="ratingRules" ref="ratingFormRef" label-width="80px">
          <el-form-item label="服务评分" prop="score" class="rating-score">
            <el-rate
              v-model="ratingForm.score"
              :texts="['很差', '较差', '一般', '较好', '很好']"
              show-text
            />
          </el-form-item>
          <el-form-item label="评价内容" prop="comment">
            <el-input
              v-model="ratingForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入您的评价内容（选填）"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showRatingDialog = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitRating">提交评价</el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useLoginUserStore } from '../stores/user'
import { getRepairsById , updateRepairStatus} from '../api/repairsController'
import { getRepairRecords, addRecord } from '../api/repairRecordsController'
import { addRating, isExistRating } from '../api/ratingController'
import USER_ROLE_ENUM from '../enums/USER_ROLE_ENUM'

const route = useRoute()
const router = useRouter()
const loginUser = useLoginUserStore()

// 判断是否为维修人员
const isMaintenanceStaff = loginUser.loginUser?.role === USER_ROLE_ENUM.MAINTAINER

// 报修信息
const repair = ref<API.Repairs>({})
// 报修记录
const records = ref<API.RepairRecords[]>([])

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
const fetchRepairDetail = async () => {
  try {
    const repairId = route.params.id as string
    const [repairRes, recordsRes] = await Promise.all([
      getRepairsById({ repairId }),
      getRepairRecords({ repairId })
    ])

    if (repairRes.data.code === 0 && repairRes.data.data) {
      repair.value = repairRes.data.data
      // 解析图片数组
      if (typeof repair.value.images === 'string') {
        repair.value.images = JSON.parse(repair.value.images)
      }
    }
    if (recordsRes.data.code === 0 && recordsRes.data.data) {
      records.value = recordsRes.data.data.records || []
    }
    // 判断是否已经评论
    const ratingRes = await isExistRating({ repairId: repair.value.id })
    hasRated.value = ratingRes.data.code === 0 && ratingRes.data.data
  } catch (error) {
    console.error('获取报修详情失败:', error)
    ElMessage.error('获取报修详情失败')
  }
}

// 更新状态
const handleUpdateStatus = async () => {
  if (!updateFormRef.value) return
  
  await updateFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      updating.value = true
      try {
        const repairId = repair.value.id
        // 更新工单状态
        const updateRes = await updateRepairStatus({
          repairId,
          status: updateForm.value.status
        })

        if (updateRes.data.code === 0) {
          // 添加处理记录
          await addRecord({
            repairId: repairId,
            content: updateForm.value.content,
            type: updateForm.value.status
          })

          ElMessage.success('状态更新成功')
          // 重新加载数据
          await fetchRepairDetail()
          // 清空表单
          updateForm.value.status = ''
          updateForm.value.content = ''
        } else {
          ElMessage.error(updateRes.data.message || '状态更新失败')
        }
      } catch (error) {
        console.error('状态更新失败:', error)
        ElMessage.error('状态更新失败')
      } finally {
        updating.value = false
      }
    }
  })
}

// 初始化加载
onMounted(fetchRepairDetail)

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
    low: '普通',
    medium: '紧急',
    high: '特急'
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

// 工具函数
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 评价相关状态
const showRatingDialog = ref(false)
const ratingForm = ref({
  score: 0,
  comment: ''
})
const ratingRules = {
  score: [{ required: true, message: '请选择评分', trigger: 'change' }],
  comment: [{ required: false, message: '请输入评价内容', trigger: 'blur' }]
}
const ratingFormRef = ref<FormInstance>()
const hasRated = ref(false)

// 打开评价弹窗
const openRatingDialog = () => {
  showRatingDialog.value = true
}

// 提交评价
const handleSubmitRating = async () => {
  if (!ratingFormRef.value) return
  
  await ratingFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // TODO: 调用评价接口
        const res = await addRating({
          repairId: repair.value.id,
          score: ratingForm.value.score,
          comment: ratingForm.value.comment,
          userId: loginUser.loginUser?.id
        })
        console.log('提交评价:', ratingForm.value)
        hasRated.value = true
        showRatingDialog.value = false
        ElMessage.success('评价成功')
      } catch (error) {
        console.error('评价失败:', error)
        ElMessage.error('评价失败')
      }
    }
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

.rating-section {
  position: relative;
  margin-top: 24px;
  text-align: center;
  min-height: 40px;

  .rated-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 48px;
    color: rgba(#909399, 0.2);
    font-weight: bold;
    pointer-events: none;
    user-select: none;
  }
}

.rating-dialog {
  :deep(.el-dialog__body) {
    padding-top: 20px;
  }

  .rating-score {
    :deep(.el-rate) {
      margin-top: 8px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.rating-section {
  position: relative;
  margin-top: 24px;
  text-align: center;
  min-height: 40px;

  .rated-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 48px;
    color: rgba(#909399, 0.2);
    font-weight: bold;
    pointer-events: none;
    user-select: none;
  }
}

.rating-dialog {
  :deep(.el-dialog__body) {
    padding-top: 20px;
  }

  .rating-score {
    :deep(.el-rate) {
      margin-top: 8px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>