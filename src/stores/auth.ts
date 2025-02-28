import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, LoginForm } from '../types/user';
import { ElMessage } from 'element-plus';

// Mock user data for testing
const mockUsers = [
  {
    id: 1,
    username: 'student',
    password: '123456',
    name: '张三',
    role: 'student',
    studentId: '2023001'
  },
  {
    id: 2,
    username: 'teacher',
    password: '123456',
    name: '李老师',
    role: 'teacher',
    staffId: 'T2023001'
  },
  {
    id: 3,
    username: 'maintainer',
    password: '123456',
    name: '王师傅',
    role: 'maintainer',
    staffId: 'M2023001'
  },
  {
    id: 4,
    username: 'admin',
    password: '123456',
    name: '管理员',
    role: 'admin',
    staffId: 'A2023001'
  }
];

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const token = ref<string | null>(null);

  const login = async (form: LoginForm) => {
    try {
      // Mock login logic
      const user = mockUsers.find(
        (u) => u.username === form.username && u.password === form.password && u.role === form.role
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      currentUser.value = user;
      token.value = `mock-token-${user.id}`;
      
      ElMessage.success('Login successful');
      return true;
    } catch (error) {
      ElMessage.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    currentUser.value = null;
    token.value = null;
  };

  return {
    currentUser,
    token,
    login,
    logout,
  };
});