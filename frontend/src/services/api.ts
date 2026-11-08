import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Security constraint: Never store access tokens in localStorage!
// Tokens are maintained in-memory in module closure, synced with sessionStorage for page refreshes.
let memoryToken: string | null = null;

// Initialize from sessionStorage on load (NOT localStorage)
try {
  memoryToken = window.sessionStorage.getItem('edusphere_access_token');
} catch {
  memoryToken = null;
}

export const setAuthToken = (token: string | null): void => {
  memoryToken = token;
  try {
    if (token) {
      window.sessionStorage.setItem('edusphere_access_token', token);
    } else {
      window.sessionStorage.removeItem('edusphere_access_token');
    }
  } catch {
    // ignore sessionStorage errors if restricted
  }
};

export const getAuthToken = (): string | null => {
  return memoryToken;
};

export const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: injects in-memory token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

export interface ApiParsedError {
  message: string;
  fieldErrors: Record<string, string>;
  errorList: string[];
}

export const parseApiError = (
  err: any,
  defaultMessage = 'An unexpected error occurred. Please try again.'
): ApiParsedError => {
  const fieldErrors: Record<string, string> = {};
  const errorList: string[] = [];

  if (!err) {
    return { message: defaultMessage, fieldErrors, errorList };
  }

  // Network or timeout errors
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return {
        message: 'The server request timed out. Please check your connection and try again.',
        fieldErrors,
        errorList: ['Request timed out.'],
      };
    }
    if (err.message === 'Network Error') {
      return {
        message: 'Network error. Could not connect to the EduSphere server.',
        fieldErrors,
        errorList: ['Server unreachable.'],
      };
    }
    return {
      message: err.message || defaultMessage,
      fieldErrors,
      errorList: [err.message || defaultMessage],
    };
  }

  const data = err.response.data;
  if (!data) {
    return {
      message: `Server returned an error status (${err.response.status}).`,
      fieldErrors,
      errorList: [`Status ${err.response.status}`],
    };
  }

  // 1. Array of error strings: { errors: ["msg1", "msg2"] }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    data.errors.forEach((e: any) => {
      if (typeof e === 'string' && e.trim()) {
        const trimmed = e.trim();
        errorList.push(trimmed);
        const lower = trimmed.toLowerCase();
        if (lower.includes('email') || lower.includes('account with this email')) {
          fieldErrors['email'] = trimmed;
        } else if (lower.includes('password')) {
          fieldErrors['password'] = trimmed;
        } else if (lower.includes('firstname') || lower.includes('first name')) {
          fieldErrors['firstname'] = trimmed;
        } else if (lower.includes('lastname') || lower.includes('last name')) {
          fieldErrors['lastname'] = trimmed;
        }
      }
    });
  }
  // 2. Dictionary of field errors (ASP.NET Core ValidationProblemDetails: { errors: { Email: ["..."] } })
  else if (data.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([field, val]) => {
      const fieldKey = field.toLowerCase();
      if (Array.isArray(val) && val.length > 0) {
        const msg = String(val[0]);
        fieldErrors[fieldKey] = msg;
        val.forEach((m) => errorList.push(String(m)));
      } else if (typeof val === 'string' && val.trim()) {
        fieldErrors[fieldKey] = val.trim();
        errorList.push(val.trim());
      }
    });
  }

  // Determine top-level message
  let message = '';
  if (typeof data.message === 'string' && data.message.trim()) {
    message = data.message.trim();
  } else if (errorList.length > 0) {
    message = errorList[0];
  } else if (
    typeof data.title === 'string' &&
    data.title.trim() &&
    data.title !== 'One or more validation errors occurred.'
  ) {
    message = data.title.trim();
  } else {
    message = defaultMessage;
  }

  return { message, fieldErrors, errorList };
};

export default api;
