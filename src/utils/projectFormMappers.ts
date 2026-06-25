import type {
  EmployeeSuggestion,
  Project,
  ProjectCreationRequest,
  ProjectUpdateRequest,
} from '../types/project'
import type { ProjectFormValue } from '../types/projectForm'
import { membersToVisas } from './memberUtils'

export const EMPTY_PROJECT_FORM: ProjectFormValue = {
  projectNumber: '',
  name: '',
  customer: '',
  status: 'NEW',
  startDate: '',
  endDate: '',
  members: [],
  groupId: '',
}

export function mapProjectToFormValue(project: Project): ProjectFormValue {
  return {
    projectNumber: String(project.projectNumber ?? ''),
    name: project.name ?? '',
    customer: project.customer ?? '',
    status: project.status ?? 'NEW',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
    members: readProjectMembers(project),
    groupId: readProjectGroupId(project),
  }
}

export function toCreateProjectRequest(
  form: ProjectFormValue,
): ProjectCreationRequest {
  return {
    projectNumber: Number(form.projectNumber),
    name: form.name.trim(),
    customer: form.customer.trim(),
    startDate: form.startDate,
    endDate: form.endDate || null,
    visas: membersToVisas(form.members),
    groupId: Number(form.groupId),
  }
}

export function toUpdateProjectRequest(
  form: ProjectFormValue,
): ProjectUpdateRequest {
  return {
    name: form.name.trim(),
    customer: form.customer.trim(),
    status: form.status,
    startDate: form.startDate,
    endDate: form.endDate || null,
    visas: membersToVisas(form.members),
    groupId: Number(form.groupId),
  }
}

function readProjectGroupId(project: Project) {
  return String(
    project.groupId ?? project.groupDto?.id ?? project.group?.id ?? '',
  )
}

function readProjectMembers(project: Project): EmployeeSuggestion[] {
  const employees = project.employeeDtos ?? project.employees ?? []

  if (employees.length > 0) {
    return employees
  }

  return (project.visas ?? []).map((visa, index) => ({
    id: index,
    visa,
    firstName: '',
    lastName: '',
  }))
}
