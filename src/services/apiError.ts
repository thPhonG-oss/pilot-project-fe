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

export function isDeleteNotAllowedError(
  error: unknown,
): error is import('axios').AxiosError<ApiErrorResponse> {
  return (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    error.response?.data?.code === '1007'
  )
}

export function resolveDeleteErrorMessage(error: unknown) {
  if (isCancelledRequest(error)) {
    return ''
  }

  const unexpectedDetail = resolveUnexpectedErrorDetail(error)
  if (unexpectedDetail !== null) {
    return unexpectedDetail
  }

  if (isDeleteNotAllowedError(error)) {
    return error.response?.data?.message ?? i18n.t('delete.notAllowed', { numbers: '' })
  }

  return resolveApiErrorMessage(error)
}

export function resolveApiErrorMessage(error: unknown) {
  if (isCancelledRequest(error)) {
    return ''
  }

  const unexpectedDetail = resolveUnexpectedErrorDetail(error)
  if (unexpectedDetail !== null) {
    return unexpectedDetail
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return i18n.t('error.unexpected')
  }

  const response = error.response?.data
  const fieldMessages = response?.details?.map((detail) => detail.message).filter(Boolean)

  if (fieldMessages?.length) {
    return fieldMessages.join('\n')
  }

  return response?.message ?? i18n.t('error.unexpected')
}
