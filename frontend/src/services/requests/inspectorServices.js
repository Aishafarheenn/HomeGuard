import api from "../api";
import { endpoint } from "../endpoints";

export const inspectorServices = {

  
  createInspector: async (data) => {
    try {
      const payload = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || "",
        country: data.country,
        password: data.password,
      };

      const response = await api.post(
        endpoint.inspector.create,
        payload
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || "Inspector creation failed";
    }
  
  }

};
