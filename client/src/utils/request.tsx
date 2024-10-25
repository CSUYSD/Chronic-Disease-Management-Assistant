import axios from "axios";
import { getToken, removeToken } from "./token";

const request = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://3.106.177.60/api',
    timeout: 100000,
});

// 添加错误处理
if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('NEXT_PUBLIC_API_URL is not defined');
}


request.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor
request.interceptors.response.use((response) => {
    // 2xx range status codes trigger this function
    return response;
}, (error) => {
    // Status codes outside 2xx range trigger this function
    console.error("API Error:", error);

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        removeToken();
        // We can't use useRouter here because it's not a React component
        // Instead, we'll redirect on the client side
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return Promise.reject(error);
});

export { request };

