export type ProjectStatus = 'NEW' | 'PLA' | 'INP' | 'FIN'

export type Project = {
  id: number
  projectNumber: number
  name: string
  customer: string
  status: ProjectStatus
  startDate: string
  endDate?: string | null
  groupId?: number | null
  group?: GroupOption | null
  groupDto?: GroupOption | null
  visas?: string[]
  employees?: EmployeeSuggestion[]
  employeeDtos?: EmployeeSuggestion[]
  version?: number | null
}

export type EmployeeSuggestion = {
  id: number
  visa: string
  firstName: string
  lastName: string
  displayName?: string | null
}

export type GroupOption = {
  id: number
  leaderVisa?: string | null
  leaderName?: string | null
}

export type PageResponse<T> = {
  pageNumber: number
  pageSize: number
  data: T[]
  totalPages: number
  totalElements: number
  last?: boolean
  isLast?: boolean
}

export type ProjectSearchParams = {
  keyword?: string
  status?: ProjectStatus
  page: number
  size: number
  sortBy: string
  asc: boolean
}

export type ProjectDeleteRequest = {
  ids: number[]
}

export type ProjectCreationRequest = {
  projectNumber: number
  name: string
  customer: string
  startDate: string
  endDate?: string | null
  visas: string[]
  groupId: number
}

export type ProjectUpdateRequest = {
  name: string
  customer: string
  status: ProjectStatus
  startDate: string
  endDate?: string | null
  visas: string[]
  groupId: number
  version: number
}

export type ProjectFilters = {
  keyword: string
  status: '' | ProjectStatus
}

export type ApiErrorResponse = {
  code?: string
  message?: string
  details?: Array<{
    field: string
    message: string
  }>
}
