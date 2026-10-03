/**
 * Central API Client for FinCred
 * Handles network failures, non-JSON responses (HTML 404/500), authentication headers,
 * and standardizes JSON responses.
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  } | string;
  [key: string]: any;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status = 500, code = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Configurable base URL: defaults to relative URL (/api/...) for same-origin or proxy setups
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export interface RequestOptions extends RequestInit {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Core request helper that safely handles non-JSON responses and network errors
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, params, headers: customHeaders, ...fetchOptions } = options;

  let url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(customHeaders);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Set Content-Type only if not FormData and not already set
  if (!(fetchOptions.body instanceof FormData) && !headers.has('Content-Type') && fetchOptions.method && fetchOptions.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if provided
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers
    });
  } catch (networkErr: any) {
    console.error(`[API Network Error] ${fetchOptions.method || 'GET'} ${url}:`, networkErr);
    throw new ApiError(
      'Unable to connect to the server. Please check your internet connection and try again.',
      0,
      'NETWORK_ERROR',
      networkErr
    );
  }

  // Safely check if response is JSON
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  let responseData: any;
  if (isJson) {
    try {
      responseData = await response.json();
    } catch (parseErr) {
      console.error(`[API JSON Parse Error] ${url}:`, parseErr);
      throw new ApiError(
        'Server returned invalid JSON response.',
        response.status,
        'INVALID_JSON'
      );
    }
  } else {
    // Non-JSON response (e.g., HTML 404 from static server or gateway error)
    const rawText = await response.text().catch(() => '');
    const isHtml = rawText.includes('<!DOCTYPE') || rawText.includes('<html');

    if (!response.ok) {
      const message = isHtml
        ? `Server error (${response.status} ${response.statusText}). Endpoint may be unavailable.`
        : (rawText.slice(0, 150) || `Request failed with status ${response.status}`);

      throw new ApiError(message, response.status, `HTTP_${response.status}`);
    }

    // If ok but not JSON, return text or empty object
    return (rawText as unknown) as T;
  }

  // Check HTTP response status
  if (!response.ok) {
    let errorMessage = 'Request failed';
    let errorCode = `HTTP_${response.status}`;

    if (responseData) {
      if (typeof responseData.error === 'string') {
        errorMessage = responseData.error;
      } else if (responseData.error && typeof responseData.error.message === 'string') {
        errorMessage = responseData.error.message;
        errorCode = responseData.error.code || errorCode;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      }
    }

    throw new ApiError(errorMessage, response.status, errorCode, responseData);
  }

  return responseData;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' })
};

/**
 * Safe fetch wrapper that intercepts non-JSON responses and network crashes.
 * Guarantees that response.json() will never crash with SyntaxError: Unexpected token '<'
 */
export async function safeFetch(endpoint: string, init?: RequestInit): Promise<Response> {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: any) {
    console.error(`[Network Error] ${init?.method || 'GET'} ${url}:`, err);
    throw new ApiError('Unable to connect to the server. Please check your network connection and try again.', 0, 'NETWORK_ERROR', err);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const originalJson = res.json.bind(res);
  const originalText = res.text.bind(res);

  res.json = async function () {
    if (!isJson) {
      const raw = await originalText().catch(() => '');
      const isHtml = raw.includes('<!DOCTYPE') || raw.includes('<html');
      const message = isHtml
        ? `Server returned an HTML response (${res.status} ${res.statusText}) instead of JSON. The API endpoint may be unavailable or misconfigured.`
        : (raw.slice(0, 150) || `Request failed with status ${res.status}`);
      const apiErr: any = new ApiError(message, res.status, `HTTP_${res.status}`);
      throw apiErr;
    }
    try {
      return await originalJson();
    } catch (parseErr: any) {
      console.error(`[JSON Parse Error] ${url}:`, parseErr);
      throw new ApiError('Server returned an invalid JSON response.', res.status, 'INVALID_JSON', parseErr);
    }
  };

  return res;
}

