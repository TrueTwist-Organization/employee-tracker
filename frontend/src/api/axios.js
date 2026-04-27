import axios from 'axios';
import { apiBaseURL } from '../config';

const API = axios.create({
  baseURL: apiBaseURL,
});

// Add Interceptor for Token
API.interceptors.request.use((req) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user && user.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;
