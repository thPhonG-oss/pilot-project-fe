import axios from 'axios'
import i18n from '../i18n'
import type { ApiErrorResponse } from '../types/project'

export function resolveApiErrorMessage(error: unknown) {
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
