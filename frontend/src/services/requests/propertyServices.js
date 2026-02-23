import api from "../api";
import { endpoint } from "../endpoints";

export const propertyServices = {
    createProperty: async (data) => {
        const payload = {
           address: data.address,
           latitude: Number (data.latitude) || 0.0,
           longitude: Number (data.longitude) || 0.0,
        }
        const response = await api.post(endpoint.Property.create, payload )
        return response.data
    },
    getProperty: async () => {
        const response = await api.get(endpoint.Property.get)
        return response.data
        
    }
}