import api from "../api";
import { endpoint } from "../endpoints";

export const getSchedules = async () => {
  const response = await api.get(endpoint.inspection.schedules);
  return response.data;
};

export const createSchedule = async (data) => {
  const response = await api.post(endpoint.inspection.schedules, data);
  return response.data;
};

export const createJobticketApi = {
  createJobticket: async (data) => {
    const payload = {
      schedule_id: data.schedule_id,
      inspector_id: data.inspector_id,
      status: data.status ?? "assigned",
    };
    const response = await api.post(endpoint.JobTicket.create, payload);
    return response.data;
  },

  getJobtickets: async () => {
    const response = await api.get(endpoint.JobTicket.get);
    return response.data;
  },

  getJobticket: async (id) => {
    const response = await api.get(endpoint.inspection.jobticketOne(id));
    return response.data;
  },
};