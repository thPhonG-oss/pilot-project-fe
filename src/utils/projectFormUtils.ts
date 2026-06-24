import axios from 'axios'
import type { ProjectFormValue } from '../types/projectForm'
import i18n from '../i18n'
import type { ApiErrorResponse } from '../types/project'
import type { ProjectFormErrors, ProjectFormField } from '../types/projectForm'

const CREATE_MANDATORY_FIELDS: ProjectFormField[] = [
  'projectNumber',
  'name',
  'customer',
  'groupId',
  'startDate',
]

const EDIT_MANDATORY_FIELDS: ProjectFormField[] = [
  'name',
  'customer',
  'groupId',
  'status',
  'startDate',
]

export function validateProjectForm(
  values: ProjectFormValue,
  mode: 'create' | 'edit',
): ProjectFormErrors {
  const fieldErrors: ProjectFormErrors = {}
  const mandatoryFields = mode === 'create' ? CREATE_MANDATORY_FIELDS : EDIT_MANDATORY_FIELDS
  let hasMissingMandatory = false

  for (const field of mandatoryFields) {
    const fieldValue = values[field]

    if (typeof fieldValue !== 'string' || !fieldValue.trim()) {
      fieldErrors[field] = ''
      hasMissingMandatory = true
    }
  }

  if (mode === 'create' && values.projectNumber.trim()) {
    const projectNumber = Number(values.projectNumber)

    if (!Number.isInteger(projectNumber) || projectNumber < 1 || projectNumber > 9999) {
      fieldErrors.projectNumber = i18n.t('validation.projectNumberInvalid')
      hasMissingMandatory = true
    }
  }

  if (values.endDate && values.startDate && values.endDate <= values.startDate) {
    fieldErrors.endDate = i18n.t('validation.endDateInvalid')
  }

  if (hasMissingMandatory) {
    fieldErrors.form = i18n.t('validation.mandatoryFields')
  }

  return fieldErrors
}

export function hasFormErrors(errors: ProjectFormErrors): boolean {
  return Boolean(errors.form) || Object.keys(errors).some((key) => key !== 'form')
}

export function mapApiErrorToFormErrors(error: unknown): {
  errors: ProjectFormErrors
  isUnexpected: boolean
  unexpectedDetail?: string
} {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      errors: { form: i18n.t('error.fallback') },
      isUnexpected: true,
      unexpectedDetail: i18n.t('error.fallback'),
    }
  }

  const status = error.response?.status
  const response = error.response?.data

  if (status !== undefined && status >= 500) {
    return {
      errors: {},
      isUnexpected: true,
      unexpectedDetail: response?.message ?? i18n.t('error.unexpected'),
    }
  }

  const fieldErrors: ProjectFormErrors = {}
  const code = response?.code
  const message = response?.message ?? i18n.t('error.fallback')

  if (code === '1002') {
    fieldErrors.projectNumber = message
    return { errors: fieldErrors, isUnexpected: false }
  }

  if (code === '1003') {
    fieldErrors.endDate = message
    return { errors: fieldErrors, isUnexpected: false }
  }

  if (code === '1004') {
    fieldErrors.visas = message
    return { errors: fieldErrors, isUnexpected: false }
  }

  if (response?.details?.length) {
    for (const detail of response.details) {
      const field = mapBackendFieldName(detail.field)

      if (field) {
        fieldErrors[field] = detail.message
      }
    }

    fieldErrors.form = message
    return { errors: fieldErrors, isUnexpected: false }
  }

  return {
    errors: { form: message },
    isUnexpected: false,
  }
}

function mapBackendFieldName(field: string): ProjectFormField | 'visas' | undefined {
  switch (field) {
    case 'projectNumber':
      return 'projectNumber'
    case 'name':
      return 'name'
    case 'customer':
      return 'customer'
    case 'groupId':
      return 'groupId'
    case 'visas':
      return 'visas'
    case 'status':
      return 'status'
    case 'startDate':
      return 'startDate'
    case 'endDate':
      return 'endDate'
    default:
      return undefined
  }
}
