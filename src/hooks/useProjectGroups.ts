import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { isCancelledRequest } from '../services/apiError'
import { getGroups } from '../services/groups'
import type { GroupOption } from '../types/project'
import type { ProjectFormErrors } from '../types/projectForm'
import { mapApiErrorToFormErrors } from '../utils/projectFormUtils'

type UseProjectGroupsOptions = {
  setErrors: Dispatch<SetStateAction<ProjectFormErrors>>
}

export function useProjectGroups({ setErrors }: UseProjectGroupsOptions) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [isGroupsLoading, setIsGroupsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadGroups() {
      setIsGroupsLoading(true)

      try {
        const response = await getGroups(controller.signal)
        setGroups(response)
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

        setErrors((current) => ({
          ...current,
          form: mapped.errors.form ?? t('error.fallback'),
        }))
      } finally {
        if (!controller.signal.aborted) {
          setIsGroupsLoading(false)
        }
      }
    }

    void loadGroups()

    return () => {
      controller.abort()
    }
  }, [navigate, setErrors, t])

  return { groups, isGroupsLoading }
}
