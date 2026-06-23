import type { ProjectStatus } from "../types/project";

export const PROJECT_PAGE_SIZE = 5

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
