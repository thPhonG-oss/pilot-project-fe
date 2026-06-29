import type { ProjectFormValue } from '../types/projectForm'
import i18n from '../i18n'
import { parseApiError } from '../services/apiError'
import type { ProjectFormErrors, ProjectFormField } from '../types/projectForm'

/** Business codes whose field message already restates the top-level message; skip the redundant banner. */
const SUPPRESS_BANNER_CODES = new Set(['1002', '1003', '1004'])

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

const TRACKED_FORM_FIELDS: (keyof ProjectFormValue)[] = [
  'projectNumber',
  'name',
  'customer',
  'groupId',
  'status',
  'startDate',
  'endDate',
  'members',
]

export function clearErrorsOnChange(
  previous: ProjectFormValue,
  next: ProjectFormValue,
  errors: ProjectFormErrors,
): ProjectFormErrors {
  if (!hasFormErrors(errors)) {
    return errors
  }

  let changed = false
  const nextErrors = { ...errors }

  for (const field of TRACKED_FORM_FIELDS) {
    if (field === 'members') {
      if (previous.members !== next.members && 'visas' in nextErrors) {
        delete nextErrors.visas
        changed = true
      }
      continue
    }

    if (previous[field] !== next[field] && field in nextErrors) {
      delete nextErrors[field]
      changed = true
    }
  }

  if (!changed) {
    return errors
  }

  const hasFieldErrors = Object.keys(nextErrors).some((key) => key !== 'form')
  if (!hasFieldErrors && nextErrors.form) {
    delete nextErrors.form
  }

  return nextErrors
}

export function mapApiErrorToFormErrors(error: unknown): {
  errors: ProjectFormErrors
  isUnexpected: boolean
  unexpectedDetail?: string
} {
  const parsed = parseApiError(error)

  if (parsed.isUnexpected) {
    return { errors: {}, isUnexpected: true, unexpectedDetail: parsed.unexpectedDetail }
  }

  const fieldErrors: ProjectFormErrors = {}
  for (const [backendField, message] of Object.entries(parsed.fieldErrors)) {
    const field = mapBackendFieldName(backendField)

    if (field) {
      fieldErrors[field] = message
    }
  }

  if (Object.keys(fieldErrors).length === 0) {
    return { errors: { form: parsed.message }, isUnexpected: false }
  }

  if (!parsed.code || !SUPPRESS_BANNER_CODES.has(parsed.code)) {
    fieldErrors.form = parsed.message
  }

  return { errors: fieldErrors, isUnexpected: false }
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
