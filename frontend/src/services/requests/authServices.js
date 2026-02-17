import api from '../api'
import { endpoint } from '../endpoints'

export const authServices = {
  login: async (email, password) => {
    const response = await api.post(endpoint.auth.login, { email, password })
    return response.data
  },

  registerOwner: async (data) => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      country: data.country,
      password: data.password,
    }
    const response = await api.post(endpoint.owner.create, payload)
    return response.data
  },
}
