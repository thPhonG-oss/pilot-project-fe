import type { EmployeeSuggestion } from '../types/project'

export const MAX_MEMBER_SEARCH_KEYWORD_LENGTH = 50
export const MEMBER_SEARCH_DEBOUNCE_MS = 300
export const VISA_TOKEN_PATTERN = /^[A-Za-z]{1,3}$/

export function isValidVisaToken(token: string) {
  return VISA_TOKEN_PATTERN.test(token.trim())
}

export function createManualMember(visa: string): EmployeeSuggestion {
  const normalized = visa.trim().toUpperCase()
  return {
    id: 0,
    visa: normalized,
    firstName: '',
    lastName: '',
  }
}

export function addMembersFromManualInput(
  members: EmployeeSuggestion[],
  input: string,
): { members: EmployeeSuggestion[]; remainder: string } {
  if (!input.includes(',')) {
    return { members, remainder: input }
  }

  const parts = input.split(',')
  const remainder = parts.pop() ?? ''
  let nextMembers = members

  for (const part of parts) {
    const token = part.trim()
    if (!isValidVisaToken(token)) {
      continue
    }

    nextMembers = addMember(nextMembers, createManualMember(token))
  }

  return { members: nextMembers, remainder }
}

export function commitManualVisaToken(
  members: EmployeeSuggestion[],
  token: string,
): EmployeeSuggestion[] {
  const trimmed = token.trim()

  if (!isValidVisaToken(trimmed)) {
    return members
  }

  return addMember(members, createManualMember(trimmed))
}

export function formatEmployeeName(
  employee: Pick<EmployeeSuggestion, 'firstName' | 'lastName'>,
) {
  return `${employee.lastName} ${employee.firstName}`.trim()
}

export function formatMemberLabel(
  employee: Pick<EmployeeSuggestion, 'visa' | 'firstName' | 'lastName'>,
  options?: { uppercaseName?: boolean },
) {
  const name = formatEmployeeName(employee)

  if (!name) {
    return employee.visa
  }

  const displayName = options?.uppercaseName ? name.toUpperCase() : name
  return `${employee.visa}: ${displayName}`
}

export function membersToVisas(members: EmployeeSuggestion[]) {
  return members
    .map((member) => member.visa.trim().toUpperCase())
    .filter(Boolean)
}

export function addMember(
  members: EmployeeSuggestion[],
  employee: EmployeeSuggestion,
) {
  const visa = employee.visa.toUpperCase()

  if (members.some((member) => member.visa.toUpperCase() === visa)) {
    return members
  }

  return [...members, employee]
}

export function removeMember(members: EmployeeSuggestion[], visa: string) {
  const normalized = visa.toUpperCase()
  return members.filter((member) => member.visa.toUpperCase() !== normalized)
}

export function filterMemberSuggestions(
  suggestions: EmployeeSuggestion[],
  members: EmployeeSuggestion[],
) {
  const committed = new Set(members.map((member) => member.visa.toUpperCase()))

  return suggestions.filter(
    (suggestion) => !committed.has(suggestion.visa.toUpperCase()),
  )
}
