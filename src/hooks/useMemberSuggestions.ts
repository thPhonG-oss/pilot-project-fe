import { useEffect, useState } from 'react'
import { isCancelledRequest } from '../services/apiError'
import { getEmployeeSuggestions } from '../services/employees'
import type { EmployeeSuggestion } from '../types/project'
import {
  MAX_MEMBER_SEARCH_KEYWORD_LENGTH,
  MEMBER_SEARCH_DEBOUNCE_MS,
} from '../utils/memberUtils'

export function useMemberSuggestions(keyword: string) {
  const [suggestions, setSuggestions] = useState<EmployeeSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const trimmedKeyword = keyword.trim().slice(0, MAX_MEMBER_SEARCH_KEYWORD_LENGTH)

  useEffect(() => {
    if (!trimmedKeyword) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsSearching(true)

      try {
        const results = await getEmployeeSuggestions(
          trimmedKeyword,
          controller.signal,
        )

        if (!controller.signal.aborted) {
          setSuggestions(results)
        }
      } catch (error) {
        if (!isCancelledRequest(error) && !controller.signal.aborted) {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, MEMBER_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmedKeyword])

  return {
    suggestions: trimmedKeyword ? suggestions : [],
    isSearching: Boolean(trimmedKeyword) && isSearching,
  }
}
