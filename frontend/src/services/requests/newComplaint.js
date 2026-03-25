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

  respondComplaint: async (complaintId, admin_response) => {
    const response = await api.patch(endpoint.Complaint.respond(complaintId), {
      admin_response,
    })
    return response.data
  },
}