/* eslint-disable @typescript-eslint/no-explicit-any */

type ErrorHandler = (error: { message: string; originalError: any }) => any;
interface FinalError {
  message: string;
  originalError: unknown;
}

interface RequestConfig extends RequestInit {
  /**
   * @description: The default timeout for the request in milliseconds.
   * @default: 30000
   */
  timeout?: number;
  /**
   * @description: The default number of retries for the request.
   * @default: 3
   */
  retries?: number;
  /**
   * @description: The default delay between retries in milliseconds.
   * @default: 1000
   */
  retryDelay?: number;
  /**
   * @description: The base URL for the request.
   * @default: ''
   */
  baseUrl?: string;
  /**
   * @description: The default headers.
   * @default: {}
   */
  headers?: Record<string, string>;
  /**
   * @description: The default parameters for the request.
   * @default: {}
   */
  params?: Record<string, string | string[] | number | boolean | undefined>;
  /**
   * @description: This function is used to modify the error object before it is thrown.
   * @param error.message: The error message.
   * @param error.error: The error object.
   * @returns: The modified error object.
   *
   * @example
   * ```ts
   * onError: ({ message, error }) => {
   *   console.log(message);
   *   if (error.status === 403) {
   *     return AppError.Forbidden('GitHub API rate limit exceeded or token is invalid');
   *   }
   *   return error;
   * };
   * ```
   */
  onError?: ErrorHandler;
  /**
   * @description: The default body of a POST, PUT, or PATCH request.
   * @default: {}
   */
  data?: Record<string, any> | FormData;
  /**
   * @description: Enable detailed logging
   * @default: false
   */
  verbose?: boolean;
  /**
   * @description: Raw request body to send as-is. Useful for pre-serialized form payloads.
   */
  rawBody?: string;
}

const defaultConfig: RequestConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
  },
  verbose: false,
};

/**
 * @description: A class that provides a simple interface for making HTTP requests.
 * @param config: The default configuration for the request.
 * @param config.baseUrl: The base URL for the request.
 * @param config.headers: The default headers for the request.
 * @param config.timeout: The default timeout for the request.
 * @param config.retries: The default number of retries for the request.
 * @param config.retryDelay: The default delay between retries in milliseconds.
 * @param config.params: The default parameters for the request.
 * @param config.data: The default body of a POST, PUT, or PATCH request.
 * @param config.onError: The default function to handle errors.
 * @returns: The HttpClient instance.
 */
export class HttpClient {
  private globalConfig: RequestConfig = defaultConfig;

  constructor(config: string | RequestConfig = {}) {
    const _config = typeof config === 'string' ? { baseUrl: config } : config;

    this.globalConfig = {
      ...this.globalConfig,
      ..._config,
      headers: this.normalizeHeaders({
        ...this.globalConfig.headers,
        ..._config.headers,
      }),
    };
  }

  private normalizeHeaders(
    headers: Record<string, any> = {}
  ): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const key in headers) {
      if (headers[key] != null) {
        normalized[key.toLowerCase()] = String(headers[key]);
      }
    }
    return normalized;
  }

  private getSearchParams(object: Record<string, any>) {
    const searchParams = new URLSearchParams();
    Object.entries(object).map(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            searchParams.append(key, String(item));
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return searchParams;
  }

  private buildUrl(url: string, config: RequestConfig): string {
    const { baseUrl = '', params } = config;

    const fullUrl = `${baseUrl}${url}`;

    if (!params) return fullUrl;

    const searchParams = this.getSearchParams(params);

    const queryString = searchParams.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig
  ): Promise<Response> {
    const {
      timeout,
      params,
      retries,
      retryDelay,
      baseUrl,
      onError,
      ...fetchConfig
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.buildUrl(url, config), {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private handleFinalError<T = Response>(
    finalError: FinalError,
    onError?: ErrorHandler,
    verbose?: boolean
  ): Promise<T> {
    if (verbose) {
      const fullErrorObject =
        finalError.originalError instanceof Error
          ? finalError.originalError
          : JSON.stringify(finalError.originalError, null, 2);
      const error = [
        '--- ERROR ---',
        `Message:            ${finalError.message}`,
        `Full Error Object:  ${fullErrorObject}`,
        '--------------------',
      ]
        .filter(Boolean)
        .join('\n');
      console.error(`\n${error}`);
    }

    if (onError) {
      const customError = onError(finalError);
      if (customError) {
        throw customError;
      }
    }

    throw finalError;
  }

  private async handleRequest(
    url: string,
    config: RequestConfig,
    attempt: number = 1
  ): Promise<Response> {
    const { onError, retries = 3, retryDelay = 1000 } = config;

    try {
      return await this.fetchWithTimeout(url, config);
    } catch (error) {
      if (attempt < retries) {
        await this.wait(retryDelay);
        return this.handleRequest(url, config, attempt + 1);
      }

      const finalError = {
        message:
          error instanceof Error ? error.message : `Request failed: ${error}`,
        originalError: error,
      };

      return this.handleFinalError(finalError, onError, config.verbose);
    }
  }

  private async handleResponse<T>(
    response: Response,
    onError?: (error: Error | any) => any,
    verbose?: boolean
  ): Promise<T> {
    if (!response.ok) {
      let error: string | { message?: string };

      try {
        error = await response.text();
        error = error?.slice(0, 5000);

        try {
          error = error ? JSON.parse(error) : {};
        } catch {
          // Do nothing
        }
      } catch {
        error = '';
      }

      // Check if there's an error.message, in most apis, the error always has a message property
      const finalError = {
        message:
          typeof error === 'string'
            ? `Request failed: ${error}`
            : error.message
            ? `Request failed: ${error.message}`
            : `Request failed: ${JSON.stringify(error)}`,
        originalError: error,
      };

      return this.handleFinalError(finalError, onError, verbose);
    }

    try {
      const rawData = await response.text();

      try {
        const data = JSON.parse(rawData);
        return data as T;
      } catch {
        // Do nothing
      }

      return rawData as T;
    } catch (error) {
      const finalError = {
        message: `Failed to parse response body: ${error}`,
        originalError: error,
      };
      return this.handleFinalError(finalError, onError, verbose);
    }
  }

  public setConfig(config: RequestConfig) {
    this.globalConfig = {
      ...this.globalConfig,
      ...config,
      headers: this.normalizeHeaders({
        ...this.globalConfig.headers,
        ...config.headers,
      }),
      data: {
        ...this.globalConfig.data,
        ...config.data,
      },
      params: {
        ...this.globalConfig.params,
        ...config.params,
      },
    };
  }

  public getRequestInfo(method: string, url: string, config: RequestConfig) {
    const headers = config.headers || {};

    let body = '';
    if (config.body) {
      try {
        body = JSON.stringify(JSON.parse(config.body as string), null, 2);
      } catch {
        body = String(config.body);
      }
    }

    let query = '';
    if (config.params) {
      try {
        query = JSON.stringify(config.params, null, 2);
      } catch {
        query = String(this.getSearchParams(config.params).toString());
      }
    }

    const info = [
      '--- HTTP REQUEST ---',
      `Method:   ${method.toUpperCase()}`,
      `URL:      ${this.buildUrl(url, config)}`,
      `Headers:  ${JSON.stringify(headers, null, 2)}`,
      body ? `Body:     ${body}` : undefined,
      query ? `Query:    ${query}` : undefined,
      '--------------------',
    ]
      .filter(Boolean)
      .join('\n');

    return info;
  }

  /**
   * Logs the full request information in a presentable, human-readable format if verbose is true.
   */
  private logRequestInfo(method: string, url: string, config: RequestConfig) {
    const info = this.getRequestInfo(method, url, config);
    console.info(`\n${info}`);
  }

  private parseQueryConfig(
    config: RequestConfig,
    params: Record<string, any> = {},
    method: 'GET' | 'DELETE'
  ): RequestConfig {
    const headers = this.normalizeHeaders({
      ...this.globalConfig.headers,
      ...config.headers,
    });

    return {
      ...this.globalConfig,
      ...config,
      headers,
      params: {
        ...this.globalConfig.params,
        ...params,
        ...config.params,
      },
      method,
    };
  }

  private parseBodyConfig(
    config: RequestConfig,
    data: Record<string, any> = {},
    method: 'POST' | 'PUT'
  ): RequestConfig {
    const headers = this.normalizeHeaders({
      ...this.globalConfig.headers,
      ...config.headers,
    });

    const bareLocalData: Record<string, any> = {
      ...this.globalConfig.data,
      ...data,
      ...config.data,
    };

    const body =
      config.rawBody !== undefined
        ? config.rawBody
        : headers['content-type'] === 'application/x-www-form-urlencoded'
        ? this.getSearchParams(bareLocalData).toString()
        : headers['content-type'] === 'multipart/form-data' ||
          data instanceof FormData
        ? (data as FormData)
        : JSON.stringify(bareLocalData);

    return {
      ...this.globalConfig,
      ...config,
      headers,
      body,
      method,
    };
  }

  public async get<T = any>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    config: RequestConfig = {}
  ): Promise<T> {
    const localConfig = this.parseQueryConfig(config, params, 'GET');

    if (localConfig.verbose) {
      this.logRequestInfo('GET', url, localConfig);
    }

    const response = await this.handleRequest(url, localConfig);
    return this.handleResponse<T>(
      response,
      localConfig.onError,
      localConfig.verbose
    );
  }

  public async post<T = any>(
    url: string,
    data?: Record<string, any>,
    config: RequestConfig = {}
  ): Promise<T> {
    const localConfig = this.parseBodyConfig(config, data, 'POST');

    if (localConfig.verbose) {
      this.logRequestInfo('POST', url, localConfig);
    }

    const response = await this.handleRequest(url, localConfig);
    return this.handleResponse<T>(response, localConfig.onError);
  }

  public async put<T = any>(
    url: string,
    data?: Record<string, any>,
    config: RequestConfig = {}
  ): Promise<T> {
    const localConfig = this.parseBodyConfig(config, data, 'PUT');

    if (localConfig.verbose) {
      this.logRequestInfo('PUT', url, localConfig);
    }

    const response = await this.handleRequest(url, localConfig);
    return this.handleResponse<T>(response, localConfig.onError);
  }

  public async delete<T = any>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    config: RequestConfig = {}
  ): Promise<T> {
    const localConfig = this.parseQueryConfig(config, params, 'DELETE');

    if (localConfig.verbose) {
      this.logRequestInfo('DELETE', url, localConfig);
    }

    const response = await this.handleRequest(url, localConfig);
    return this.handleResponse<T>(response, localConfig.onError);
  }
}
