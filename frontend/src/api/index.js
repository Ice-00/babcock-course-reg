// Central API client — all calls go through here
// Base URL switches between local dev and deployed backend automatically

const BASE = import.meta.env.VITE_API_URL || 'https://babcock-backend.onrender.com'

function getToken() {
  return localStorage.getItem('bu_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const get    = (path)        => request('GET',    path)
const post   = (path, body)  => request('POST',   path, body)
const patch  = (path, body)  => request('PATCH',  path, body)
const del    = (path)        => request('DELETE', path)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => post('/auth/register', data),
  login:    (data) => post('/auth/login', data),
  me:       ()     => get('/auth/me'),
}

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesAPI = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return get(`/courses${qs ? '?' + qs : ''}`)
  },
  create: (data) => post('/courses', data),
  update: (id, data) => patch(`/courses/${id}`, data),
}

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationsAPI = {
  submit:  (data) => post('/registrations', data),
  list:    (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return get(`/registrations${qs ? '?' + qs : ''}`)
  },
  get:     (id)          => get(`/registrations/${id}`),
  approve: (id, comment) => post(`/registrations/${id}/approve`, { comment }),
  reject:  (id, comment) => post(`/registrations/${id}/reject`,  { comment }),
  stats:   ()            => get('/registrations/stats'),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:           ()         => get('/users'),
  pendingRole:    ()         => get('/users/pending-role'),
  assignRole:     (id, role) => patch(`/users/${id}/role`, { role }),
  update:         (id, data) => patch(`/users/${id}`, data),
  deactivate:     (id)       => del(`/users/${id}`),
}
