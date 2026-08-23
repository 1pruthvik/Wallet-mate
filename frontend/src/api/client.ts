import axios from "axios";

const apiClient = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("wallet_mate_auth_token") ||
            sessionStorage.getItem("wallet_mate_auth_token");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401 unauthorized
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Optional: Handle session expiry
            console.warn("Session expired or unauthorized request:", error.response.data?.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;