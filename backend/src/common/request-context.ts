import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

export const RequestContext = new AsyncLocalStorage<RequestContextData>();
