import axios from 'axios';
import { endpoint } from './endpoints';

const api = axios.create({
  baseURL: endpoint.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
