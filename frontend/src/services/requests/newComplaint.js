import api from "../api";
import { endpoint } from "../endpoints";

export const newComplaint = {
  createComplaint: async (data) => {
    const payload = { message: data.message };
    const response = await api.post(endpoint.Complaint.create, payload);
    return response.data;
  },

  getComplaint: async () => {
    const response = await api.get(endpoint.Complaint.get)
    return response.data
  },
}