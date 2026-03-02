import api from "../api";
import { endpoint } from "../endpoints";

export const newComplaint = {
    createComplaint: async (data) => {
        const payload = {
           name: data.name,
           email: data.email,
           message: data.message,
        }
        const response = await api.post(endpoint.Complaint.create, payload )
        return response.data
       },

    getComplaint: async () => {
        const response = await api.get(endpoint.Complaint.create)
        return response.data
    }
}