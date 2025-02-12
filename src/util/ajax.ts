import axios from 'axios'
import { stringify } from 'query-string'
import { Config } from './config'
import fetch from 'node-fetch'
import FormData from 'form-data'

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'

export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream'

interface AjaxConfig {
  url: string
  method?: Method
  data?: any
  headers?: object
  responseType?: ResponseType
}

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

type FlipOptional<T> = Required<Pick<T, OptionalKeys<T>>> &
  Partial<Omit<T, OptionalKeys<T>>> extends infer O
  ? { [K in keyof O]: O[K] }
  : never

const defaultConfig: FlipOptional<AjaxConfig> = {
  method: 'get',
  data: undefined,
  headers: {},
  responseType: 'json',
}

export class Ajax {
  constructor(public readonly config: Config) {}

  /**
   * 封装 ajax 请求
   * @param config
   */
  async request<R>(config: AjaxConfig) {
    const mergeConfig = { ...defaultConfig, ...this.config }
    return (
      await axios.request({
        url: mergeConfig.url,
        method: mergeConfig.method,
        data: mergeConfig.data,
        headers: mergeConfig.headers,
        responseType: mergeConfig.responseType,
      })
    ).data as R
  }

  baseUrl(url: string, param?: object) {
    const query = stringify(
      {
        ...param,
        ...this.config,
      },
      {
        arrayFormat: 'comma',
      },
    )
    return `http://localhost:${this.config.port}${url}?${query}`
  }

  get<R>(
    url: string,
    data?: any,
    config?: Omit<AjaxConfig, 'url' | 'data' | 'method'>,
  ) {
    return this.request<R>({
      url: this.baseUrl(url, data),
      ...config,
      method: 'get',
    })
  }

  post<R>(
    url: string,
    data?: any,
    config?: Omit<AjaxConfig, 'url' | 'data' | 'method'>,
  ) {
    return this.request<R>({
      url: this.baseUrl(url),
      data,
      ...config,
      method: 'post',
    })
  }

  put<R>(
    url: string,
    data?: any,
    config?: Omit<AjaxConfig, 'url' | 'data' | 'method'>,
  ) {
    return this.request<R>({
      url: this.baseUrl(url),
      data,
      ...config,
      method: 'put',
    })
  }

  delete<R>(
    url: string,
    data?: any,
    config?: Omit<AjaxConfig, 'url' | 'data' | 'method'>,
  ) {
    return this.request<R>({
      url: this.baseUrl(url),
      data,
      ...config,
      method: 'delete',
    })
  }

  async postFormData(url: string, data: object) {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v))
    const resp = await fetch(this.baseUrl(url), {
      method: 'post',
      body: fd,
    })
    return await resp.json()
  }
}
