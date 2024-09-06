import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000' // Replace with your backend server URL
});

instance.interceptors.request.use(
  (config) => {
    config.headers.common['Content-Type'] = 'application/json'; // Set Content-Type
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;