<template>
  <div class="my-orders-container">
    <!-- 工单统计 -->
    <OrderStatistics />

    <!-- 进行中的工单 -->
    <ProcessingOrders
      :orders="processingOrders"
      @update-status="handleUpdateStatus"
    />

    <!-- 已完成的工单 -->
    <CompletedOrders :orders="completedOrders" />

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
import { ElMessage } from 'element-plus'
import ProcessingOrders from './components/ProcessingOrders.vue'
import CompletedOrders from './components/CompletedOrders.vue'
import OrderStatistics from './components/OrderStatistics.vue'

// 更新对话框
const updateDialogVisible = ref(false)
const updating = ref(false)
const currentOrder = ref<any>(null)

const updateForm = ref({
  status: '',
  description: ''
})

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
    acceptedAt: '2023-08-01 14:25:00',
    completedAt: '2023-08-01 16:30:00'
  }
])

// 分类工单
const processingOrders = computed(() => {
  return orders.value.filter(order => order.status === 'processing')
})

const completedOrders = computed(() => {
  return orders.value.filter(order => order.status === 'completed')
})

// 处理状态更新
const handleUpdateStatus = (order: any) => {
  currentOrder.value = order
  updateForm.value.status = order.status
  updateForm.value.description = ''
  updateDialogVisible.value = true
}

// 提交更新
const submitUpdate = async () => {
  if (!currentOrder.value) return

  updating.value = true
  try {
    // TODO: 实现更新API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新本地数据
    const index = orders.value.findIndex(o => o.id === currentOrder.value.id)
    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index],
        status: updateForm.value.status,
        completedAt: updateForm.value.status === 'completed' ? new Date().toLocaleString() : undefined
      }
    }

    ElMessage.success('更新成功')
    updateDialogVisible.value = false
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  } finally {
    updating.value = false
  }
}
</script>

<style scoped lang="scss">
.my-orders-container {
  padding: 20px;
}
</style>