import { Vendor, VendorResponse, AuthResponse, User, Trip } from '../types';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

const getHeaders = (contentType: string | null = 'application/json') => {
    const headers: Record<string, string> = {};
    if (contentType) {
        headers['Content-Type'] = contentType;
    }
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
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getById: async (id: string): Promise<Vendor> => {
            const response = await fetch(`${API_BASE_URL}/vendors/${id}`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        register: async (formData: FormData): Promise<Vendor> => {
            const response = await fetch(`${API_BASE_URL}/vendors/register`, {
                method: 'POST',
                headers: getHeaders(null),
                body: formData,
                credentials: 'include',
            });
            return handleResponse(response);
        },
        filter: async (params: string): Promise<VendorResponse> => {
            const response = await fetch(`${API_BASE_URL}/vendors/filter?${params}`, {
                headers: getHeaders(),
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
    payments: {
        createCheckoutSession: async (vendorId: string): Promise<{ url: string; sessionId: string }> => {
            const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ vendorId }),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        createTripCheckoutSession: async (): Promise<{ url: string; sessionId: string }> => {
            const userStr = localStorage.getItem('user');
            const parsed = userStr ? JSON.parse(userStr) : null;
            const userId = parsed?.id || parsed?._id || parsed?.user?.id || parsed?.user?._id;
            const response = await fetch(`${API_BASE_URL}/payments/create-trip-checkout-session`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ userId }),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getSuccessInfo: async (sessionId: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/payments/success?session_id=${encodeURIComponent(sessionId)}`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
    },
    trips: {
        create: async (data: any): Promise<{ trip: Trip }> => {
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
    },
    feedbacks: {
        create: async (formData: FormData): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/feedbacks`, {
                method: 'POST',
                headers: getHeaders(null),
                body: formData,
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getAll: async (): Promise<any[]> => {
            const response = await fetch(`${API_BASE_URL}/feedbacks`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        }
    },
    admin: {
        getVendors: async (): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/vendors`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getUsers: async (): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getCalculations: async (): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/calculations`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        deleteVendor: async (id: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        renewVendor: async (id: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/renew`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        rejectVendor: async (id: string, reason: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ reason }),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        deleteUser: async (id: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        renewUser: async (id: string): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/renew`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        },
        getSecurityLogs: async (): Promise<any> => {
            const response = await fetch(`${API_BASE_URL}/admin/security-logs`, {
                headers: getHeaders(),
                credentials: 'include',
            });
            return handleResponse(response);
        }
    }
};
