<template>
  <el-container class="main-layout">
    <el-header height="60px">
      <div class="header-content">
        <div class="logo" @click="router.push('/')" style="cursor: pointer">
          <h1>设备维修管理系统</h1>
        </div>
        <el-menu
          mode="horizontal"
          :router="true"
          class="main-menu"
          :default-active="activeRoute"
        >
          <el-menu-item index="/dashboard" v-if="loginUser?.role !== USER_ROLE_ENUM.NOT_LOGIN">
            <el-icon><DataLine /></el-icon>工作台
          </el-menu-item>
          <el-menu-item index="/repair/new" v-if="loginUser?.role === USER_ROLE_ENUM.USER">
            <el-icon><Plus /></el-icon>新建报修
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><Reading /></el-icon>知识库
          </el-menu-item>
          <el-menu-item index="/notifications" v-if="loginUser?.role !== USER_ROLE_ENUM.NOT_LOGIN">
            <el-icon><Bell /></el-icon>消息中心
          </el-menu-item>
          <el-menu-item index="/equipment" v-if="loginUser?.role === USER_ROLE_ENUM.ADMIN || loginUser?.role === USER_ROLE_ENUM.MAINTAINER">
            <el-icon><Setting /></el-icon>设备管理
          </el-menu-item>
          <el-menu-item index="/statistics" v-if="loginUser?.role === USER_ROLE_ENUM.ADMIN">
            <el-icon><TrendCharts /></el-icon>统计分析
          </el-menu-item>
          <el-menu-item index="/ratings" v-if="loginUser?.role === USER_ROLE_ENUM.ADMIN || loginUser?.role === USER_ROLE_ENUM.MAINTAINER">
            <el-icon><Star /></el-icon>评价统计
          </el-menu-item>
          <!-- <el-menu-item index="/ratings" v-if="loginUser?.role === USER_ROLE_ENUM.USER">
            <el-icon><Star /></el-icon>我的评价
          </el-menu-item> -->
          <el-menu-item index="/admin" v-if="loginUser?.role === USER_ROLE_ENUM.ADMIN">
            <el-icon><User /></el-icon>系统管理
          </el-menu-item>
        </el-menu>
        <div class="user-actions">
          <el-dropdown>
            <span class="user-profile">
              <el-avatar :size="32" :src="loginUser?.avatar|| 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              {{ loginUser?.username }}
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

    <!-- 个人信息弹窗 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="500px"
    >
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="profileForm.id" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="profileForm.role" disabled />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
          >
            <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="profileForm.name" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        <el-form-item label="所在部门">
          <el-input v-model="profileForm.department" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input v-model="profileForm.createdAt" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="profileForm.updatedAt" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateProfile">更新</el-button>
        </span>
      </template>
    </el-dialog>

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
import { ref, computed, onMounted } from 'vue'
import USER_ROLE_ENUM from '../enums/USER_ROLE_ENUM'
import { useRouter, useRoute } from 'vue-router'
import { useLoginUserStore } from '../stores/user'
import { getLoginUser, updateUser, userLogout } from '../api/userController'
import { ElMessage } from 'element-plus'
import { testUpload } from '../api/fileController'

const router = useRouter()
const route = useRoute()
const userStore = useLoginUserStore()

const activeRoute = computed(() => route.path)
const loginUser = ref({
  id: '',
  username: '',
  name: '',
  avatar: '',
  role: 1,
  phone: '',
  email: '',
  department: '',
  createdAt: '',
  updatedAt: ''
})

// 个人信息弹窗相关
const profileDialogVisible = ref(false)
const profileForm = ref({
  id: '',
  username: '',
  name: '',
  avatar: '',
  role: 1,
  phone: '',
  email: '',
  department: '',
  createdAt: '',
  updatedAt: ''
})

const handleProfile = () => {
  profileForm.value = { ...loginUser.value }
  profileDialogVisible.value = true
}

onMounted( async () => {
  // 初始化用户信息
  fetchLoginUser()
} )

const fetchLoginUser = async () => {
  const res = await getLoginUser()
  if(res.data.code === 0 && res.data.data){
      loginUser.value = res.data.data;
  }
}

const handleAvatarUpload = async (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }

  const formData = new FormData()
  formData.append('file', file)

  try {      
      const res = await testUpload(formData);
      if (res.data.code === 0 && res.data.data) {
        profileForm.value.avatar = res.data.data;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(res.data.message || '图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      ElMessage.error('图片上传失败，请重试');
    }
}

const handleUpdateProfile = async () => {
  try {
    // TODO: 调用更新用户信息的API
    const updateRequest : API.UpdateUserRequest = {
      id: profileForm.value.id,
      name: profileForm.value.name,
      avatar: profileForm.value.avatar,
      phone: profileForm.value.phone,
      email: profileForm.value.email,
      department: profileForm.value.department,
    }
    await updateUser(updateRequest)
    // 重新获取个人信息
    fetchLoginUser()
    ElMessage.success('个人信息更新成功')
    profileDialogVisible.value = false
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

const handleLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    userStore.clearLoginStore()
  } else {
    console.log('退出登录失败')
   }
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

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>