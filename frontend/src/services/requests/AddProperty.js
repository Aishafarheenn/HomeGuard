import api from "../api";
import { endpoint } from "../endpoints";

export const AddPropertyApi = {
    createProperty: async (data) => {
        const payload = {
           latitude: Number (data.latitude) || 0.0,
           longitude: Number (data.longitude) || 0.0,
        }
        const response = await api.post(endpoint.Property.create, payload )
        return response.data
    }
}