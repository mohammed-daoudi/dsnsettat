import { User, Professor, Module, Submission, IPUsageLog } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (name: string, email: string, password: string, role?: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (name: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email }),
    });
    return handleResponse(response);
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (userData: Partial<User> & { password: string }) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  update: async (id: string, userData: Partial<User>) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Professors API
export const professorsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/professors`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/professors/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (professorData: Partial<Professor>) => {
    const response = await fetch(`${API_BASE_URL}/professors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(professorData),
    });
    return handleResponse(response);
  },

  update: async (id: string, professorData: Partial<Professor>) => {
    const response = await fetch(`${API_BASE_URL}/professors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(professorData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/professors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Modules API
export const modulesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/modules`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (moduleData: Partial<Module>) => {
    const response = await fetch(`${API_BASE_URL}/modules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(response);
  },

  update: async (id: string, moduleData: Partial<Module>) => {
    const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/modules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Submissions API
export const submissionsAPI = {
  getAll: async (filters?: {
    status?: string;
    authorId?: string;
    supervisorId?: string;
    moduleId?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/submissions?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (submissionData: {
    title: string;
    description: string;
    supervisorId: string;
    moduleId: string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('title', submissionData.title);
    formData.append('description', submissionData.description);
    formData.append('supervisorId', submissionData.supervisorId);
    formData.append('moduleId', submissionData.moduleId);
    formData.append('file', submissionData.file);

    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeaders().Authorization!,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  update: async (id: string, submissionData: Partial<Submission>) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  download: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}/download`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Download failed');
    }
    
    // Get the filename from the response headers
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'download';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, filename };
  },
};

// IP Usage API
export const ipUsageAPI = {
  getAll: async (filters?: {
    submissionId?: string;
    userId?: string;
    accessType?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/ip-usage?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (logData: {
    submissionId: string;
    accessType: 'download' | 'view';
    purpose?: string;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/ip-usage`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(logData),
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/ip-usage/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  approve: async (id: string, approved: boolean) => {
    const response = await fetch(`${API_BASE_URL}/ip-usage/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved }),
    });
    return handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },
};

// Email verification
export const verifyEmail = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Email verification failed');
  }

  return response.json();
};

// Request password reset
export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Password reset request failed');
  }

  return response.json();
};

// Reset password
export const resetPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Password reset failed');
  }

  return response.json();
};

// Resend verification email
export const resendVerification = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resend verification email');
  }

  return response.json();
}; 