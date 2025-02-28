<template>
  <el-container class="main-layout">
    <el-header height="60px">
      <div class="header-content">
        <div class="logo">
          <h1>设备维修管理系统</h1>
        </div>
        <el-menu
          mode="horizontal"
          :router="true"
          class="main-menu"
          :default-active="activeRoute"
        >
          <el-menu-item index="/">
            <el-icon><DataLine /></el-icon>工作台
          </el-menu-item>
          <el-menu-item index="/repair/new">
            <el-icon><Plus /></el-icon>新建报修
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><Reading /></el-icon>知识库
          </el-menu-item>
          <el-menu-item index="/notifications">
            <el-icon><Bell /></el-icon>消息中心
          </el-menu-item>
          <el-menu-item index="/equipment">
            <el-icon><Setting /></el-icon>设备管理
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><TrendCharts /></el-icon>统计分析
          </el-menu-item>
          <el-menu-item index="/ratings">
            <el-icon><Star /></el-icon>维修评价
          </el-menu-item>
          <el-menu-item index="/admin">
            <el-icon><User /></el-icon>系统管理
          </el-menu-item>
        </el-menu>
        <div class="user-actions">
          <el-dropdown>
            <span class="user-profile">
              <el-avatar :size="32" :src="userAvatar" />
              {{ userName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人信息</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  DataLine,
  Plus,
  Reading,
  Bell,
  Setting,
  TrendCharts,
  User,
  ArrowDown,
  Star
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeRoute = computed(() => route.path)
const userName = computed(() => authStore.currentUser?.name || '用户')
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const handleProfile = () => {
  // TODO: 实现个人信息页面
  console.log('查看个人信息')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.main-layout {
  min-height: 100vh;

  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    padding: 0;

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        h1 {
          margin: 0;
          font-size: 20px;
          color: #409eff;
        }
      }

      .main-menu {
        flex: 1;
        justify-content: center;
        border-bottom: none;

        .el-menu-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .user-actions {
        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          .el-avatar {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .el-main {
    background-color: #f5f7fa;
    padding: 20px;

    :deep(.el-card) {
      margin-bottom: 20px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>