<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>高校报修信息管理系统</h2>
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
            <el-option label="学生/教职工" value="user" />
            <el-option label="维修人员" value="maintainer" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              class="captcha-input"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码" />
            </div>
          </div>
        </el-form-item> -->

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
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../stores/auth';
import type { LoginForm } from '../types/user';

const router = useRouter();
const authStore = useAuthStore();
const loginFormRef = ref();
const loading = ref(false);

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  role: '',
  captcha: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
};

// 模拟验证码URL
const captchaUrl = ref('https://via.placeholder.com/100x40?text=1234');

const refreshCaptcha = () => {
  // 这里后续实现刷新验证码的逻辑
  captchaUrl.value = `https://via.placeholder.com/100x40?text=${Math.floor(Math.random() * 9000 + 1000)}`;
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        const success = await authStore.login(loginForm);
        if (success) {
          router.push('/');
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