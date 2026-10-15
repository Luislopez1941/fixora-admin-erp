import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

export const AUTH_TOKEN_KEY = 'astra-admin-token';

class ApiService {
  private axiosInstance: AxiosInstance;

  // fixora-admin-erp le habla únicamente a back-end-admin-fixora. Ese backend
  // expone login, licencias propias, y reenvía (proxy) /platform/* y
  // /business-types/* hacia back-end-fixora-erp — ver back-end-admin-fixora/src/proxy.
  constructor(baseURL: string = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost:4001') {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          if (location.pathname !== '/login') {
            location.href = '/login';
          }
        }
        const message =
          error?.response?.data?.message || error?.message || 'Error de red';
        return Promise.reject({ message });
      },
    );
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.request({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  }

  public get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', `/${path}`, undefined, config);
  }

  public post<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', `/${path}`, data, config);
  }

  public put<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', `/${path}`, data, config);
  }

  public patch<T>(path: string, data: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', `/${path}`, data, config);
  }

  public delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', `/${path}`, undefined, config);
  }
}

export default new ApiService();
