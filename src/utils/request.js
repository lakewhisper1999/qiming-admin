import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '',   // 留空，由拦截器统一补 /api 前缀
  timeout: 15000
})

// 请求拦截器：自动带 Token + 统一补 /api 前缀
request.interceptors.request.use(
  config => {
    // 1. 追加 JWT Token
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // 2. 若 URL 不以 /api 开头，自动补上
    if (config.url && !config.url.startsWith('/api')) {
      config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url)
    }

    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg))
    }
    return res
  },
  error => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      } else if (status === 403) {
        ElMessage.error('无操作权限')
      } else {
        ElMessage.error('服务器异常')
      }
    } else {
      ElMessage.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
