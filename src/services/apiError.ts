import axios from 'axios'
import i18n from '../i18n'
import type { ApiErrorResponse } from '../types/project'

export function isCancelledRequest(error: unknown) {
  return axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')
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

  if (isDeleteNotAllowedError(error)) {
    return error.response?.data?.message ?? i18n.t('delete.notAllowed', { numbers: '' })
  }

  return resolveApiErrorMessage(error)
}

export function resolveApiErrorMessage(error: unknown) {
  if (isCancelledRequest(error)) {
    return ''
  }

  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return i18n.t('error.fallback')
  }

  const response = error.response?.data
  const fieldMessages = response?.details?.map((detail) => detail.message).filter(Boolean)

  if (fieldMessages?.length) {
    return fieldMessages.join('\n')
  }

  return response?.message ?? i18n.t('error.fallback')
}
