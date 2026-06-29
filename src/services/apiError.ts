import axios from 'axios'
import i18n from '../i18n'
import type { ApiErrorResponse } from '../types/project'

export function isCancelledRequest(error: unknown) {
  return axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && error.response === undefined
}

export function isServerError(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status ?? 0) >= 500
}

export function isUnexpectedApiError(error: unknown) {
  if (isCancelledRequest(error)) {
    return false
  }

  if (!axios.isAxiosError(error)) {
    return true
  }

  return isNetworkError(error) || isServerError(error)
}

/** Short bracket detail for /error — never the full unexpected sentence (avoids double wrapping). */
export function resolveUnexpectedErrorDetail(error: unknown): string | null {
  if (!isUnexpectedApiError(error)) {
    return null
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return null
  }

  if (isNetworkError(error)) {
    return i18n.t('error.network')
  }

  const serverMessage = error.response?.data?.message?.trim()
  if (serverMessage) {
    return serverMessage
  }

  if (isServerError(error)) {
    return i18n.t('error.network')
  }

  return null
}

const DELETE_NOT_ALLOWED_CODE = '1007'

export function isDeleteNotAllowedError(
  error: unknown,
): error is import('axios').AxiosError<ApiErrorResponse> {
  return (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    error.response?.data?.code === DELETE_NOT_ALLOWED_CODE
  )
}

/**
 * Single source of truth for turning any error thrown by an API call into a normalized shape.
 * Every page-level error handler (banner, toast, inline form fields) builds on top of this
 * instead of re-deriving "is this unexpected" / "what are the field errors" itself.
 */
export type ParsedApiError = {
  isUnexpected: boolean
  /** Only set when isUnexpected is true; short detail suitable for the /error page. */
  unexpectedDetail?: string
  code?: string
  message: string
  /** Backend field name -> message, built from response.details. Empty when backend sent none. */
  fieldErrors: Record<string, string>
}

export function parseApiError(error: unknown): ParsedApiError {
  if (isUnexpectedApiError(error)) {
    const unexpectedDetail = resolveUnexpectedErrorDetail(error) ?? undefined
    return {
      isUnexpected: true,
      unexpectedDetail,
      message: unexpectedDetail ?? i18n.t('error.unexpected'),
      fieldErrors: {},
    }
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return { isUnexpected: true, message: i18n.t('error.unexpected'), fieldErrors: {} }
  }

  const response = error.response?.data
  const fieldErrors: Record<string, string> = {}

  for (const detail of response?.details ?? []) {
    if (detail.field && detail.message) {
      fieldErrors[detail.field] = detail.message
    }
  }

  return {
    isUnexpected: false,
    code: response?.code,
    message: response?.message ?? i18n.t('error.unexpected'),
    fieldErrors,
  }
}

export function resolveDeleteErrorMessage(error: unknown): string {
  if (isCancelledRequest(error)) {
    return ''
  }

  const parsed = parseApiError(error)
  if (parsed.isUnexpected) {
    return parsed.message
  }

  if (parsed.code === DELETE_NOT_ALLOWED_CODE) {
    const rawMessage = axios.isAxiosError<ApiErrorResponse>(error)
      ? error.response?.data?.message
      : undefined
    return rawMessage ?? i18n.t('delete.notAllowed', { numbers: '' })
  }

  return resolveApiErrorMessage(error)
}

export function resolveApiErrorMessage(error: unknown): string {
  if (isCancelledRequest(error)) {
    return ''
  }

  const parsed = parseApiError(error)
  if (parsed.isUnexpected) {
    return parsed.message
  }

  const fieldMessages = Object.values(parsed.fieldErrors)
  return fieldMessages.length ? fieldMessages.join('\n') : parsed.message
}
