import api from '../api'
import { endpoint } from '../endpoints'

export const propertyServices = {
  getProperties: async () => {
    const response = await api.get(endpoint.property.list)
    return response.data
  },

  getPropertyById: async (id) => {
    const response = await api.get(endpoint.property.one(id))
    return response.data
  },

  createProperty: async (data) => {
    const payload = {
      address: data.address,
      latitude: data.latitude != null && data.latitude !== '' ? Number(data.latitude) : null,
      longitude: data.longitude != null && data.longitude !== '' ? Number(data.longitude) : null,
      owner_id: data.owner_id,
    }
    const response = await api.post(endpoint.property.list, payload)
    return response.data
  },

  updateProperty: async (id, data) => {
    const payload = {}
    if (data.address !== undefined) payload.address = data.address
    if (data.owner_id !== undefined) payload.owner_id = data.owner_id
    if (data.latitude !== undefined) payload.latitude = data.latitude === '' ? null : Number(data.latitude)
    if (data.longitude !== undefined) payload.longitude = data.longitude === '' ? null : Number(data.longitude)
    const response = await api.put(endpoint.property.one(id), payload)
    return response.data
  },

  deleteProperty: async (id) => {
    const response = await api.delete(endpoint.property.one(id))
    return response.data
  },
}
