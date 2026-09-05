import { fetch } from "expo/fetch";

import { DEFAULT_HEADERS } from "./constants";

export interface HttpResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  body?: string;
  setCookie: string[];
}

function extractSetCookies(response: Response): string[] {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }

  const cookie = headers.get("set-cookie");
  return cookie ? [cookie] : [];
}

export class PortalHttpClient {
  private cookies = new Map<string, string>();

  private buildCookieHeader(): string | undefined {
    if (this.cookies.size === 0) {
      return undefined;
    }

    return [...this.cookies.entries()]
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  private storeCookies(setCookies: string[]): void {
    for (const setCookie of setCookies) {
      const firstPart = setCookie.split(";", 1)[0];
      const separator = firstPart.indexOf("=");

      if (separator === -1) {
        continue;
      }

      const name = firstPart.slice(0, separator).trim();
      const value = firstPart.slice(separator + 1).trim();

      if (name) {
        this.cookies.set(name, value);
        console.log("[PortalHttpClient] Stored cookie:", name);
      }
    }
  }

  async get<T>(url: string, options: { cookies?: string; useHmac?: boolean; timeout?: number } = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, "GET", options);
  }

  async post<T>(
    url: string,
    data: Record<string, unknown>,
    options: {
      referer?: string;
      origin?: string;
      cookies?: string;
      useHmac?: boolean;
      timeout?: number;
    } = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "POST", {
      body: JSON.stringify(data),
      cookies: options.cookies,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        ...(options.referer
          ? {
              Referer: options.referer,
            }
          : {}),
        ...(options.origin
          ? {
              Origin: options.origin,
            }
          : {}),
      },
      useHmac: options.useHmac,
      timeout: options.timeout,
    });
  }

  async postForm<T>(
    url: string,
    data: Record<string, string>,
    options: {
      referer?: string;
      origin?: string;
      cookies?: string;
      headers?: Record<string, string>;
      useHmac?: boolean;
      timeout?: number;
    } = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "POST", {
      body: new URLSearchParams(data).toString(),
      cookies: options.cookies,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        ...(options.referer
          ? {
              Referer: options.referer,
            }
          : {}),
        ...(options.origin
          ? {
              Origin: options.origin,
            }
          : {}),
        ...(options.headers ?? {}),
      },
      useHmac: options.useHmac,
      timeout: options.timeout,
    });
  }

  private async request<T>(
    url: string,
    method: "GET" | "POST",
    options: {
      body?: string;
      headers?: Record<string, string>;
      cookies?: string;
      useHmac?: boolean;
      timeout?: number;
    } = {},
  ): Promise<HttpResponse<T>> {
    const cookieHeader = this.buildCookieHeader();

    const headers: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...options.headers,
    };

    const finalCookieHeader = options.cookies ?? cookieHeader;

    if (finalCookieHeader) {
      headers.Cookie = finalCookieHeader;
      console.log("[PortalHttpClient] Sending cookie:", finalCookieHeader);
    }

    const controller = new AbortController();
    const timeoutMs = options.timeout ?? 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body,
        redirect: "manual",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const setCookies = extractSetCookies(response);

      if (setCookies.length > 0) {
        console.log("[PortalHttpClient] Received Set-Cookie:", setCookies);
      }

      this.storeCookies(setCookies);

      const responseText = await response.text();
      let data: T;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText as unknown as T;
      }

      return {
        status: response.status,
        ok: response.ok,
        data,
        body: responseText,
        setCookie: setCookies,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  clearCookies(): void {
    this.cookies.clear();
  }

  getCookieNames(): string[] {
    return [...this.cookies.keys()];
  }
}