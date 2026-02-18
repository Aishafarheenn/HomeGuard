import api from '../api'
import { endpoint } from '../endpoints'

/** Create inspection package only. Backend: POST /inspection/packages */
export const serviceItemsApi = {
  createPackage: async (data) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price) || 0,
    }
    const response = await api.post(endpoint.Package.create, payload)
    return response.data
  },
}
