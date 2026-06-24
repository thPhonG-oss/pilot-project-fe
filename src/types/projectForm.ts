import type { EmployeeSuggestion, ProjectStatus } from './project'

export type ProjectFormValue = {
  projectNumber: string
  name: string
  customer: string
  status: ProjectStatus
  startDate: string
  endDate: string
  members: EmployeeSuggestion[]
  groupId: string
}

export type ProjectFormField = keyof ProjectFormValue

export type ProjectFormErrors = Partial<Record<ProjectFormField | 'visas', string>> & {
  form?: string
}
