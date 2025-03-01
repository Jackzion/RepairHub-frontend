<template>
  <div class="notifications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>通知中心</h2>
          <div class="header-actions">
            <el-button type="primary" @click="markAllAsRead" :disabled="!unreadNotifications.length">
              全部标记为已读
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部通知" name="all">
          <div class="notifications-list" v-if="notifications.length">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
            >
              <el-card shadow="hover">
                <div class="notification-content">
                  <div class="notification-header">
                    <el-tag :type="getNotificationType(notification.type)" size="small">
                      {{ getNotificationLabel(notification.type) }}
                    </el-tag>
                    <span class="notification-time">{{ notification.createdAt }}</span>
                  </div>
                  <div class="notification-body">
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-message">{{ notification.message }}</p>
                  </div>
                  <div class="notification-actions">
                    <el-button
                      type="primary"
                      link
                      @click="viewDetail(notification.orderId)"
                      v-if="notification.orderId"
                    >
                      查看工单
                    </el-button>
                    <el-button
                      type="info"
                      link
                      @click="markAsRead(notification.id)"
                      v-if="!notification.read"
                    >
                      标记为已读
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <el-empty description="暂无通知" v-else />
        </el-tab-pane>
        <el-tab-pane label="未读通知" name="unread">
          <div class="notifications-list" v-if="unreadNotifications.length">
            <div
              v-for="notification in unreadNotifications"
              :key="notification.id"
              class="notification-item unread"
            >
              <el-card shadow="hover">
                <div class="notification-content">
                  <div class="notification-header">
                    <el-tag :type="getNotificationType(notification.type)" size="small">
                      {{ getNotificationLabel(notification.type) }}
                    </el-tag>
                    <span class="notification-time">{{ notification.createdAt }}</span>
                  </div>
                  <div class="notification-body">
                    <p class="notification-title">{{ notification.title }}</p>
                    <p class="notification-message">{{ notification.message }}</p>
                  </div>
                  <div class="notification-actions">
                    <el-button
                      type="primary"
                      link
                      @click="viewDetail(notification.orderId)"
                      v-if="notification.orderId"
                    >
                      查看工单
                    </el-button>
                    <el-button
                      type="info"
                      link
                      @click="markAsRead(notification.id)"
                    >
                      标记为已读
                    </el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <el-empty description="暂无未读通知" v-else />
        </el-tab-pane>
      </el-tabs>

      <div class="pagination-container" v-if="notifications.length">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalNotifications"
          :page-sizes="[10, 20, 50]"
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
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('all')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalNotifications = ref(23)

// Mock数据
const notifications = ref([
  {
    id: 1,
    type: 'new_order',
    title: '新工单提醒',
    message: '您有一个新的维修工单待处理',
    orderId: 'R2023080001',
    read: false,
    createdAt: '2023-08-01 10:30:00'
  },
  {
    id: 2,
    type: 'order_update',
    title: '工单状态更新',
    message: '工单 R2023080002 已被评价',
    orderId: 'R2023080002',
    read: false,
    createdAt: '2023-08-01 14:20:00'
  },
  {
    id: 3,
    type: 'system',
    title: '系统通知',
    message: '系统将于今晚22:00进行维护更新',
    read: true,
    createdAt: '2023-08-01 09:00:00'
  }
])

// 未读通知
const unreadNotifications = computed(() => {
  return notifications.value.filter(notification => !notification.read)
})

// 通知类型
const getNotificationType = (type: string) => {
  const types: Record<string, string> = {
    new_order: 'success',
    order_update: 'warning',
    system: 'info'
  }
  return types[type] || 'info'
}

const getNotificationLabel = (type: string) => {
  const labels: Record<string, string> = {
    new_order: '新工单',
    order_update: '工单更新',
    system: '系统通知'
  }
  return labels[type] || '其他'
}

// 查看工单详情
const viewDetail = (orderId: string) => {
  if (orderId) {
    router.push(`/repair/${orderId}`)
  }
}

// 标记为已读
const markAsRead = async (id: number) => {
  try {
    // TODO: 调用标记已读API
    await new Promise(resolve => setTimeout(resolve, 500))
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 全部标记为已读
const markAllAsRead = async () => {
  try {
    // TODO: 调用全部标记已读API
    await new Promise(resolve => setTimeout(resolve, 1000))
    notifications.value.forEach(notification => {
      notification.read = true
    })
    ElMessage.success('已全部标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
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
.notifications-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 18px;
    }
  }

  .notifications-list {
    .notification-item {
      margin-bottom: 16px;

      &.unread {
        :deep(.el-card) {
          border-left: 4px solid var(--el-color-primary);
        }
      }

      .notification-content {
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .notification-time {
            color: var(--el-text-color-secondary);
            font-size: 14px;
          }
        }

        .notification-body {
          .notification-title {
            font-weight: bold;
            margin: 0 0 8px;
          }

          .notification-message {
            color: var(--el-text-color-regular);
            margin: 0;
          }
        }

        .notification-actions {
          margin-top: 12px;
          display: flex;
          gap: 12px;
        }
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