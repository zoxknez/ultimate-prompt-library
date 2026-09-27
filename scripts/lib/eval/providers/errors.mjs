// Provider-neutral error taxonomy. The harness decides retry/abort behavior from `kind` only, so a
// provider outage is never recorded as a model (task) failure.
//
//   auth              credentials rejected or missing           -> abort run, no retry
//   quota             billing / spend / insufficient quota       -> abort run, no retry
//   invalid_request   bad parameters, unknown model, too large   -> abort run, no retry
//   rate_limit        429 throttling                             -> bounded retry with backoff
//   transient         408, 409, 5xx                              -> bounded retry with backoff
//   timeout           client-side timeout                        -> bounded retry with backoff
//   network           DNS / TLS / connection failure             -> bounded retry with backoff
//   provider_failed   200 response whose status is "failed"     -> recorded, no retry
//   malformed_response non-JSON body, oversized body, no output  -> recorded, no retry

export const RETRYABLE_KINDS = Object.freeze(['rate_limit', 'transient', 'timeout', 'network']);
export const RUN_FATAL_KINDS = Object.freeze(['auth', 'quota', 'invalid_request']);

export class ProviderError extends Error {
  constructor(kind, message, { httpStatus = null, retryAfterMs = null, code = null } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.kind = kind;
    this.httpStatus = httpStatus;
    this.retryAfterMs = retryAfterMs;
    this.code = code;
  }
  get retryable() {
    return RETRYABLE_KINDS.includes(this.kind);
  }
  get fatalForRun() {
    return RUN_FATAL_KINDS.includes(this.kind);
  }
}

export function parseRetryAfter(value, now = Date.now()) {
  if (value == null || value === '') return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : null;
}

const QUOTA_CODES = new Set(['insufficient_quota', 'billing_hard_limit_reached', 'billing_not_active', 'quota_exceeded']);

export function classifyHttpError({ httpStatus, code = null, message = '', retryAfter = null }) {
  const options = { httpStatus, code, retryAfterMs: parseRetryAfter(retryAfter) };
  const text = 'HTTP ' + httpStatus + (code ? ' ' + code : '') + ': ' + message;
  if (httpStatus === 401 || httpStatus === 403) return new ProviderError('auth', text, options);
  if (httpStatus === 429) {
    const quota = QUOTA_CODES.has(code) || /quota|billing|spend limit|credit/i.test(message);
    return new ProviderError(quota ? 'quota' : 'rate_limit', text, options);
  }
  if (httpStatus === 408 || httpStatus === 409 || httpStatus >= 500) return new ProviderError('transient', text, options);
  return new ProviderError('invalid_request', text, options);
}
