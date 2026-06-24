import type { EmployeeSuggestion } from '../types/project'

export const MAX_MEMBER_SEARCH_KEYWORD_LENGTH = 50
export const MEMBER_SEARCH_DEBOUNCE_MS = 300

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
