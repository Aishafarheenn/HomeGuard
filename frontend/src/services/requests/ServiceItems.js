import api from "../api";
import { endpoint } from "../endpoints";

export const serviceitemServices = {

  
  createServiceItem: async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: data.price,
      };

      const response = await api.post(
        endpoint.serviceitem.create,
        payload
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || "Service item creation failed";
    }
  },

  
};
