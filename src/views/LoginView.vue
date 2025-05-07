<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2> RepairHub </h2>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入学号/工号"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="loginForm.role" placeholder="请选择角色" class="w-full">
            <el-option label="学生/教职工" :value="USER_ROLE_ENUM.USER" />
            <el-option label="维修人员" :value="USER_ROLE_ENUM.MAINTAINER" />
            <el-option label="管理员" :value="USER_ROLE_ENUM.ADMIN" />
          </el-select>
        </el-form-item>

        <div class="login-actions">
          <el-button type="primary" :loading="loading" @click="handleLogin" class="w-full">
            登录
          </el-button>
        </div>

        <div class="register-link">
          <router-link to="/register">还没有账号？立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import type { LoginForm } from '../types/user';
import USER_ROLE_ENUM from '../enums/USER_ROLE_ENUM';
import { useLoginUserStore } from '../stores/user';
import { getLoginUser, userLogin } from '../api/userController';

const router = useRouter();
const userStore= useLoginUserStore();
const loginFormRef = ref();
const loading = ref(false);

onMounted(async () => {
  try {
    const res = await getLoginUser();
    if (res.data.code === 0 && res.data.data) {
      userStore.setLoginStore(res.data.data);
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Failed to get login user:', error);
  }
});

const loginForm = reactive<API.UserLoginRequest>({
  username: '',
  password: '',
  role: '',
});

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await userLogin(loginForm)
        if (res.data.code === 0 && res.data.data) {
          userStore.setLoginStore(res.data.data);
          router.push('/dashboard');
        }
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;

  .login-card {
    width: 400px;

    :deep(.el-card__header) {
      text-align: center;
      h2 {
        margin: 0;
        color: #303133;
      }
    }
  }

  .captcha-container {
    display: flex;
    gap: 12px;

    .captcha-input {
      flex: 1;
    }

    .captcha-image {
      width: 100px;
      height: 40px;
      cursor: pointer;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .login-actions {
    margin-top: 24px;
  }

  .register-link {
    margin-top: 16px;
    text-align: center;
    
    a {
      color: #409eff;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .w-full {
    width: 100%;
  }
}
</style>