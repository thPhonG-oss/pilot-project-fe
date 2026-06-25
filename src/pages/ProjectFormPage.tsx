import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ProjectForm } from '../components/ProjectForm'
import { useMemberSuggestions } from '../hooks/useMemberSuggestions'
import { useProjectGroups } from '../hooks/useProjectGroups'
import { useProjectLoader } from '../hooks/useProjectLoader'
import { isCancelledRequest } from '../services/apiError'
import { createProject, updateProject } from '../services/projects'
import type { ProjectFormErrors, ProjectFormValue } from '../types/projectForm'
import { resolveReturnTo } from '../utils/navigationUtils'
import {
  EMPTY_PROJECT_FORM,
  toCreateProjectRequest,
  toUpdateProjectRequest,
} from '../utils/projectFormMappers'
import {
  clearErrorsOnChange,
  hasFormErrors,
  mapApiErrorToFormErrors,
  validateProjectForm,
} from '../utils/projectFormUtils'

type ProjectFormPageProps = { mode: 'create' | 'edit' }

export function ProjectFormPage({ mode }: ProjectFormPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = resolveReturnTo(searchParams)

  const { projectId } = useParams()
  const numericProjectId = Number(projectId)

  const [form, setForm] = useState<ProjectFormValue>(EMPTY_PROJECT_FORM)
  const [errors, setErrors] = useState<ProjectFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [memberSearchKeyword, setMemberSearchKeyword] = useState('')

  const handleReset = useCallback(() => {
    setErrors({})
  }, [])

  const handleLoaded = useCallback((value: ProjectFormValue) => {
    setForm(value)
  }, [])

  const { isLoading, loadError } = useProjectLoader({
    mode,
    projectId: numericProjectId,
    onLoaded: handleLoaded,
    onReset: handleReset,
  })

  const { groups, isGroupsLoading } = useProjectGroups({ setErrors })
  const { suggestions, isSearching } = useMemberSuggestions(memberSearchKeyword)

  const handleChange = (nextForm: ProjectFormValue) => {
    setForm(nextForm)
    setErrors((current) => clearErrorsOnChange(form, nextForm, current))
  }

  const handleDismissGlobalError = () => {
    setErrors((current) => {
      const next = { ...current }
      delete next.form
      return next
    })
  }

  const handleSubmit = async () => {
    const validationErrors = validateProjectForm(form, mode)
    setErrors(validationErrors)

    if (hasFormErrors(validationErrors)) {
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        await createProject(toCreateProjectRequest(form))
      } else {
        await updateProject(numericProjectId, toUpdateProjectRequest(form))
      }

      navigate(returnTo)
    } catch (error) {
      if (isCancelledRequest(error)) {
        return
      }

      const mapped = mapApiErrorToFormErrors(error)

      if (mapped.isUnexpected) {
        navigate('/error', {
          state: { detail: mapped.unexpectedDetail },
        })
        return
      }

      setErrors(mapped.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-5 py-7 sm:max-w-[640px] md:max-w-[720px] lg:ml-10 lg:max-w-[880px] lg:px-0">
      <div className="mb-10 border-b border-slate-300">
        <h1 className="mb-4 text-lg font-semibold text-slate-500">
          {mode === 'create' ? t('project.newTitle') : t('project.editTitle')}
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t('project.loading')}</p>
      ) : loadError ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : (
        <ProjectForm
          mode={mode}
          value={form}
          errors={errors}
          groups={groups}
          isGroupsLoading={isGroupsLoading}
          isSubmitting={isSubmitting}
          memberSuggestions={suggestions}
          isSearchingMembers={isSearching}
          onMemberSearchKeywordChange={setMemberSearchKeyword}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onCancel={() => navigate(returnTo)}
          onDismissGlobalError={handleDismissGlobalError}
        />
      )}
    </main>
  )
}
