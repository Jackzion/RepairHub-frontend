export interface User {
  id: string;
  username: string;
  role: 'student' | 'staff' | 'maintainer' | 'admin';
  department?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface LoginForm {
  username: string;
  password: string;
  role: string;
  captcha: string;
}

export interface RegisterForm extends LoginForm {
  name: string;
  department: string;
  phone: string;
  email: string;
}