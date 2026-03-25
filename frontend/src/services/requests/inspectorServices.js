import api from '../api'
import { endpoint } from '../endpoints'

export const inspectorServices = {
  /** Public: register as inspector (status will be "pending" until admin approves) */
  registerInspector: async (data) => {
    const payload = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
    }
    const response = await api.post(endpoint.inspector.create, payload)
    return response.data
  },

  /** Requires auth: list all inspectors */
  getInspectors: async () => {
    const response = await api.get(endpoint.inspector.list)
    return response.data
  },

  /** Admin only: profile with job summary and ratings */
  getInspectorProfile: async (inspectorId) => {
    const response = await api.get(endpoint.inspector.profile(inspectorId))
    return response.data
  },

  /** Admin only: approve inspector */
  approveInspector: async (inspectorId) => {
    const response = await api.patch(endpoint.inspector.approve(inspectorId))
    return response.data
  },

  /** Admin only: reject inspector */
  rejectInspector: async (inspectorId) => {
    const response = await api.patch(endpoint.inspector.reject(inspectorId))
    return response.data
  },
}
