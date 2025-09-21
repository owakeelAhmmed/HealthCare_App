import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export const apiService = {
  async getHeaders(includeAuth: boolean = true) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (includeAuth) {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `JWT ${token}`;
      }
    }
    
    return headers;
  },

  async get(url: string, includeAuth: boolean = true): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        headers: await this.getHeaders(includeAuth),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        status: 500,
        error: error.message || 'Network error'
      };
    }
  },

  async post(url: string, data: any, includeAuth: boolean = true): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: await this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        status: 500,
        error: error.message || 'Network error'
      };
    }
  },

  async put(url: string, data: any, includeAuth: boolean = true): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: await this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        status: 500,
        error: error.message || 'Network error'
      };
    }
  },

  async patch(url: string, data: any, includeAuth: boolean = true): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: await this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        status: 500,
        error: error.message || 'Network error'
      };
    }
  },

  async delete(url: string, includeAuth: boolean = true): Promise<ApiResponse> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: await this.getHeaders(includeAuth),
      });

      return await this.handleResponse(response);
    } catch (error: any) {
      return {
        status: 500,
        error: error.message || 'Network error'
      };
    }
  },

  async handleResponse(response: Response): Promise<ApiResponse> {
    try {
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        return {
          status: response.status,
          error: data.detail || data.error || data.message || 'Request failed',
          data
        };
      }

      return {
        status: response.status,
        data,
        message: data.message
      };
    } catch (error: any) {
      return {
        status: response.status,
        error: 'Failed to parse response'
      };
    }
  },

  // Helper method for handling errors
  handleError(error: any, defaultMessage: string = 'An error occurred'): string {
    if (error && typeof error === 'object') {
      return error.detail || error.error || error.message || defaultMessage;
    }
    return defaultMessage;
  }
};