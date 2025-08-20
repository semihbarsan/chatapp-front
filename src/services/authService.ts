import axios from 'axios';

const API_URL = 'https://localhost:7027/api/Auth/'; 

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

const register = (data: RegisterData) => {
  return axios.post(API_URL + 'register', data);
};

const login = (data: LoginData) => {
  return axios.post(API_URL + 'login', data);
};

const authService = {
  register,
  login,
};

export default authService;