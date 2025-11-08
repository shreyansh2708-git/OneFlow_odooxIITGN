const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getToken = () => {
  return localStorage.getItem('oneflow_token');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email: string, password: string, name: string, role: string) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const data = await apiRequest('/projects');
    return data.projects;
  },

  getById: async (id: string) => {
    const data = await apiRequest(`/projects/${id}`);
    return data.project;
  },

  create: async (project: any) => {
    const data = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return data;
  },

  update: async (id: string, project: any) => {
    return apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/tasks${query}`);
    return data.tasks;
  },

  getById: async (id: string) => {
    const data = await apiRequest(`/tasks/${id}`);
    return data.task;
  },

  create: async (task: any) => {
    const data = await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return data.task;
  },

  update: async (id: string, task: any) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sales Orders API
export const salesOrdersAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/sales-orders${query}`);
    return data.salesOrders;
  },

  create: async (order: any) => {
    const data = await apiRequest('/sales-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return data.salesOrder;
  },

  update: async (id: string, order: any) => {
    return apiRequest(`/sales-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/sales-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Purchase Orders API
export const purchaseOrdersAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/purchase-orders${query}`);
    return data.purchaseOrders;
  },

  create: async (order: any) => {
    const data = await apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return data.purchaseOrder;
  },

  update: async (id: string, order: any) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Invoices API
export const invoicesAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/invoices${query}`);
    return data.customerInvoices;
  },

  create: async (invoice: any) => {
    const data = await apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
    return data.customerInvoice;
  },

  update: async (id: string, invoice: any) => {
    return apiRequest(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Vendor Bills API
export const vendorBillsAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/vendor-bills${query}`);
    return data.vendorBills;
  },

  create: async (bill: any) => {
    const data = await apiRequest('/vendor-bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    });
    return data.vendorBill;
  },

  update: async (id: string, bill: any) => {
    return apiRequest(`/vendor-bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bill),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/vendor-bills/${id}`, {
      method: 'DELETE',
    });
  },
};

// Expenses API
export const expensesAPI = {
  getAll: async (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : '';
    const data = await apiRequest(`/expenses${query}`);
    return data.expenses;
  },

  create: async (expense: any) => {
    const data = await apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    return data.expense;
  },

  update: async (id: string, expense: any) => {
    return apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Timesheets API
export const timesheetsAPI = {
  getAll: async (projectId?: string, taskId?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (taskId) params.append('taskId', taskId);
    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await apiRequest(`/timesheets${query}`);
    return data.timesheets;
  },

  create: async (timesheet: any) => {
    const data = await apiRequest('/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheet),
    });
    return data.timesheet;
  },

  update: async (id: string, timesheet: any) => {
    return apiRequest(`/timesheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(timesheet),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/timesheets/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async () => {
    const data = await apiRequest('/analytics');
    return data.analytics;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const data = await apiRequest('/users');
    return data.users;
  },

  getProfile: async () => {
    const data = await apiRequest('/users/profile');
    return data.user;
  },

  updateProfile: async (name: string) => {
    const data = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    return data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

