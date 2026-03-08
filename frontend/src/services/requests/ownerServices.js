import api from '../api'
import { endpoint } from '../endpoints'

export const ownerServices = {
  getOwners: async () => {
    const response = await api.get(endpoint.owner.get)
    return response.data
  },

  getOwnerById: async (id) => {
    const response = await api.get(endpoint.owner.getOne(id))
    return response.data
  },

  createOwner: async (data) => {
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

  updateOwner: async (id, data) => {
    const payload = {}
    if (data.full_name !== undefined) payload.full_name = data.full_name
    if (data.email !== undefined) payload.email = data.email
    if (data.phone !== undefined) payload.phone = data.phone
    if (data.country !== undefined) payload.country = data.country
    const response = await api.put(endpoint.owner.getOne(id), payload)
    return response.data
  },

  deleteOwner: async (id) => {
    const response = await api.delete(endpoint.owner.getOne(id))
    return response.data
  },
}
