<template>
  <div class="notifications-container">
    <el-card class="notification-card">
      <template #header>
        <div class="card-header">
          <h2>消息中心</h2>
          <div class="header-actions">
            <el-button type="primary" link @click="markAllRead">
              <el-icon><Check /></el-icon>全部标记为已读
            </el-button>
            <el-button type="danger" link @click="clearAll">
              <el-icon><Delete /></el-icon>清空消息
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部消息" name="all">
          <div class="notification-list" v-if="notifications.length > 0">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
            >
              <el-badge :is-dot="!notification.isRead" class="notification-badge">
                <div class="notification-content">
                  <div class="notification-icon">
                    <el-icon :size="24" :color="getIconColor(notification.type)">
                      <component :is="getIcon(notification.type)" />
                    </el-icon>
                  </div>
                  <div class="notification-info">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-content">{{ notification.content }}</div>
                    <div class="notification-time">{{ notification.createdAt }}</div>
                  </div>
                  <div class="notification-actions">
                    <el-button link type="primary" @click="viewDetail(notification)">
                      查看详情
                    </el-button>
                    <el-button link type="danger" @click="deleteNotification(notification.id)">
                      删除
                    </el-button>
                  </div>
                </div>
              </el-badge>
            </div>
          </div>
          <el-empty v-else description="暂无消息" />
        </el-tab-pane>

        <el-tab-pane label="未读消息" name="unread">
          <div class="notification-list" v-if="unreadNotifications.length > 0">
            <div
              v-for="notification in unreadNotifications"
              :key="notification.id"
              class="notification-item unread"
            >
              <el-badge is-dot class="notification-badge">
                <div class="notification-content">
                  <div class="notification-icon">
                    <el-icon :size="24" :color="getIconColor(notification.type)">
                      <component :is="getIcon(notification.type)" />
                    </el-icon>
                  </div>
                  <div class="notification-info">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-content">{{ notification.content }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                  <div class="notification-actions">
                    <el-button link type="primary" @click="viewDetail(notification)">
                      查看详情
                    </el-button>
                    <el-button link type="danger" @click="removeNotification(notification)">
                      删除
                    </el-button>
                  </div>
                </div>
              </el-badge>
            </div>
          </div>
          <el-empty v-else description="暂无未读消息" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell,
  Check,
  Delete,
  Tools,
  Warning,
  InfoFilled,
  SuccessFilled
} from '@element-plus/icons-vue'
import {getMyList, setRead , deleteNotification, setReadAll, deleteAll } from '../api/notificationController'

const router = useRouter()
const activeTab = ref('all')

// Mock数据
const notifications = ref<API.Notification[]>([])

onMounted( async  () => {
  fetchNotifications()
})

const fetchNotifications = async () => {
  const res = await getMyList()
  notifications.value = res.data.data
}

const unreadNotifications = computed(() => {
  return notifications.value.filter(item => !item.isRead)
})

const getIcon = (type: string) => {
  switch (type) {
    case 'repair':
      return Tools
    case 'message':
      return SuccessFilled
    case 'system':
      return InfoFilled
    default:
      return Bell
  }
}

const getIconColor = (type: string) => {
  switch (type) {
    case 'repair':
      return '#409EFF'
    case 'message':
      return '#67C23A'
    case 'system':
      return '#909399'
    default:
      return '#409EFF'
  }
}

const viewDetail = async (notification: any) => {
  // 提取工单号
  const repairId = notification.content.match(/\d+/)[0]
  router.push(`/repair/${repairId}`)
  // 标记为已读
  notification.isRead = true
  const res = await setRead({notificationId: notification.id})
}

const removeNotification = async (notification: any) => {
  notifications.value = notifications.value.filter(item => item.id !== notification.id)
  // 调用删除接口
  const res = await deleteNotification({notificationId: notification.id})
  ElMessage.success('删除成功')
}

const markAllRead = async () => {
  notifications.value.forEach(item => {
    item.isRead = true
  })
  const res = await setReadAll()
  ElMessage.success('已全部标记为已读')
}

const clearAll = async () => {
  notifications.value = []
  const res = await deleteAll()
  ElMessage.success('清空成功')
}
</script>

<style scoped lang="scss">
.notifications-container {
  padding: 20px;

  .notification-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .notification-list {
    .notification-item {
      padding: 16px;
      border-bottom: 1px solid #ebeef5;
      transition: background-color 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #ecf5ff;

        &:hover {
          background-color: #e5f1ff;
        }
      }

      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        .notification-icon {
          padding-top: 4px;
        }

        .notification-info {
          flex: 1;

          .notification-title {
            font-weight: bold;
            margin-bottom: 8px;
          }

          .notification-content {
            color: #606266;
            margin-bottom: 8px;
          }

          .notification-time {
            color: #909399;
            font-size: 12px;
          }
        }

        .notification-actions {
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}
</style>