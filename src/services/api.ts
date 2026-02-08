import { Vendor, VendorResponse, AuthResponse, User, Trip } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (contentType = 'application/json') => {
    const headers: HeadersInit = {
        'Content-Type': contentType,
    };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
};

export const api = {
    auth: {
        register: async (data: any): Promise<AuthResponse> => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        login: async (data: any): Promise<AuthResponse> => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        me: async (): Promise<User> => {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        logout: async () => {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
            });
            localStorage.removeItem('token');
        },
    },
    vendors: {
        getAll: async (): Promise<VendorResponse> => {
            const response = await fetch(`${API_BASE_URL}/vendors`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getById: async (id: string): Promise<Vendor> => {
            const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return handleResponse(response);
        },
        register: async (formData: FormData): Promise<Vendor> => {
            // Note: For file uploads, don't set Content-Type header manually, let browser set it with boundary
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE_URL}/vendors/register`, {
                method: 'POST',
                headers: headers,
                body: formData,
                credentials: 'include',
            });
            return handleResponse(response);
        },
        filter: async (params: string): Promise<VendorResponse> => {
            const response = await fetch(`${API_BASE_URL}/vendors/filter?${params}`, {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return handleResponse(response);
        },
        delete: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        }
    },
    trips: {
        create: async (data: any): Promise<Trip> => {
            const response = await fetch(`${API_BASE_URL}/trips`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getAll: async (): Promise<Trip[]> => {
            const response = await fetch(`${API_BASE_URL}/trips`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getById: async (id: string): Promise<Trip> => {
            const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        update: async (id: string, data: any): Promise<Trip> => {
            const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        delete: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        }
    }
};
