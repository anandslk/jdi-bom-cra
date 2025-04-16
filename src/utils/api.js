// utils/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:443', // Your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;