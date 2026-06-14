import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return api.post('/api/users/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  register: (data) => api.post('/api/users/', data),
  me: () => api.get('/api/users/me'),
}

export const usersAPI = {
  getUser: (id) => api.get(`/api/users/${id}`),
}

export const clipsAPI = {
  create: (data) => api.post('/api/clips', data),
  getClip: (id) => api.get(`/api/clips/${id}`),
  getUserClips: (userId) => api.get(`/api/clips/user/clips/${userId}`),
  update: (id, data) => api.patch(`/api/clips/update/clip/${id}`, data),
  delete: (id) => api.delete(`/api/clips/delete/clip/${id}`),
}

export default api
