import axios from "axios";
import type {AxiosRequestConfig} from "axios";

/**
 * 由于响应拦截器已经把 response 转成了 response.data，
 * 这里用自定义类型让调用方可以直接拿到业务数据（res.code / res.data）。
 */
interface MyAxios {
  defaults: any;
  interceptors: any;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const instance = axios.create({
  baseURL: '/api'
});

//允许携带 cookie
instance.defaults.withCredentials = true;

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 直接返回业务数据
    return response.data;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
});

const myAxios = instance as unknown as MyAxios;

export default myAxios;
