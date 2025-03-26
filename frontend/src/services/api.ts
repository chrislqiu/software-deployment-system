import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface Client {
    id: number;
    hostname: string;
    ip_address: string;
    os_type: string;
    os_version: string;
    status: string;
    last_seen: string;
}

export interface Package {
    id: number;
    name: string;
    version: string;
    description: string;
    os_compatibility: string;
    created_at: string;
    size: number;
    is_active: boolean;
}

export interface Deployment {
    id: number;
    package: Package;
    clients: Client[];
    created_by: string;
    created_at: string;
    scheduled_for: string | null;
    description: string;
    deployment_statuses: DeploymentStatus[];
}

export interface DeploymentStatus {
    id: number;
    client: Client;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    error_message: string;
    log_output: string;
}

export const authService = {
    login: async (credentials: LoginCredentials) => {
        const response = await api.post('/token/', credentials);
        const { token } = response.data;
        localStorage.setItem('token', token);
        return token;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
};

export const clientService = {
    getClients: async () => {
        const response = await api.get('/clients/');
        return response.data;
    },
    getClientById: async (id: number) => {
        const response = await api.get(`/clients/${id}/`);
        return response.data;
    },
};

export const packageService = {
    getPackages: async () => {
        const response = await api.get('/packages/');
        return response.data;
    },
    getPackageById: async (id: number) => {
        const response = await api.get(`/packages/${id}/`);
        return response.data;
    },
    createPackage: async (packageData: FormData) => {
        const response = await api.post('/packages/', packageData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export const deploymentService = {
    getDeployments: async () => {
        const response = await api.get('/deployments/');
        return response.data;
    },
    getDeploymentById: async (id: number) => {
        const response = await api.get(`/deployments/${id}/`);
        return response.data;
    },
    createDeployment: async (data: {
        package: number;
        clients: number[];
        description: string;
        scheduled_for?: string;
    }) => {
        const response = await api.post('/deployments/', data);
        return response.data;
    },
    cancelDeployment: async (id: number) => {
        const response = await api.post(`/deployments/${id}/cancel/`);
        return response.data;
    },
    retryFailedDeployment: async (id: number) => {
        const response = await api.post(`/deployments/${id}/retry_failed/`);
        return response.data;
    },
}; 