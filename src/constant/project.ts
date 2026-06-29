import type { ProjectStatus } from "../types/project";

export const PROJECT_PAGE_SIZE = 5

export const PROJECT_SORTABLE_FIELDS = [
  'projectNumber',
  'name',
  'status',
  'customer',
  'startDate',
] as const

export type ProjectSortField = (typeof PROJECT_SORTABLE_FIELDS)[number]

export type ProjectSort = {
  sortBy: ProjectSortField
  asc: boolean
}

export const DEFAULT_PROJECT_SORT: ProjectSort = {
  sortBy: 'projectNumber',
  asc: true,
}

export function isProjectSortField(value: string | null): value is ProjectSortField {
  return PROJECT_SORTABLE_FIELDS.includes(value as ProjectSortField)
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  NEW: 'New',
  PLA: 'Planned',
  INP: 'In progress',
  FIN: 'Finished',
}

export const PROJECT_STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'NEW', label: 'New' },
  { value: 'PLA', label: 'Planned' },
  { value: 'INP', label: 'In progress' },
  { value: 'FIN', label: 'Finished' },
]
