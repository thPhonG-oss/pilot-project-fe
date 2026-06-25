import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { isCancelledRequest } from '../services/apiError'
import { getProjectById } from '../services/projects'
import type { ProjectFormValue } from '../types/projectForm'
import { EMPTY_PROJECT_FORM, mapProjectToFormValue } from '../utils/projectFormMappers'
import { mapApiErrorToFormErrors } from '../utils/projectFormUtils'

type UseProjectLoaderOptions = {
  mode: 'create' | 'edit'
  projectId: number
  onLoaded: (value: ProjectFormValue) => void
  onReset?: () => void
}

export function useProjectLoader({
  mode,
  projectId,
  onLoaded,
  onReset,
}: UseProjectLoaderOptions) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (mode === 'create') {
      onLoaded(EMPTY_PROJECT_FORM)
      setLoadError('')
      setIsLoading(false)
      onReset?.()
      return
    }

    if (!Number.isFinite(projectId) || projectId < 1) {
      setLoadError(t('error.projectNotFound'))
      setIsLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadProject() {
      setIsLoading(true)
      setLoadError('')

      try {
        const project = await getProjectById(projectId, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        onLoaded(mapProjectToFormValue(project))
      } catch (error) {
        if (isCancelledRequest(error)) {
          return
        }

        const mapped = mapApiErrorToFormErrors(error)

        if (mapped.isUnexpected) {
          navigate('/error', {
            replace: true,
            state: { detail: mapped.unexpectedDetail },
          })
          return
        }

        setLoadError(mapped.errors.form ?? t('error.projectNotFound'))
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProject()

    return () => {
      controller.abort()
    }
  }, [mode, navigate, onLoaded, onReset, projectId, t])

  return { isLoading, loadError }
}
