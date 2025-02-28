<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2>用户注册</h2>
      </template>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入学号/工号"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入真实姓名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="联系方式" prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号码"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-input
            v-model="registerForm.department"
            placeholder="请输入所属部门/院系"
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="registerForm.role" placeholder="请选择角色" class="w-full">
            <el-option label="学生/教职工" value="user" />
            <el-option label="维修人员" value="maintainer" />
          </el-select>
        </el-form-item>

        <div class="register-actions">
          <el-button type="primary" :loading="loading" @click="handleRegister" class="w-full">
            注册
          </el-button>
        </div>

        <div class="login-link">
          <router-link to="/login">已有账号？立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Phone } from '@element-plus/icons-vue';

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  department: string;
  role: string;
}

const router = useRouter();
const registerFormRef = ref();
const loading = ref(false);

const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  department: '',
  role: ''
});

const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6位'));
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value?.validateField('confirmPassword');
    }
    callback();
  }
};

const validateConfirmPass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const validatePhone = (rule: any, value: string, callback: Function) => {
  const phoneReg = /^1[3-9]\d{9}$/;
  if (value === '') {
    callback(new Error('请输入手机号码'));
  } else if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号码'));
  } else {
    callback();
  }
};

const registerRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  department: [{ required: true, message: '请输入部门', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // TODO: 实现注册API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        ElMessage.success('注册成功');
        router.push('/login');
      } catch (error) {
        ElMessage.error('注册失败，请重试');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss">
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;

  .register-card {
    width: 400px;

    :deep(.el-card__header) {
      text-align: center;
      h2 {
        margin: 0;
        color: #303133;
      }
    }
  }

  .register-actions {
    margin-top: 24px;
  }

  .login-link {
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