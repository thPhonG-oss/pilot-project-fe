import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeSuggestion } from '../types/project'
import {
  addMember,
  addMembersFromManualInput,
  commitManualVisaToken,
  filterMemberSuggestions,
  formatMemberLabel,
  isValidVisaToken,
  removeMember,
} from '../utils/memberUtils'

type MembersFieldProps = {
  members: EmployeeSuggestion[]
  hasError?: boolean
  suggestions: EmployeeSuggestion[]
  isSearching: boolean
  onChange: (members: EmployeeSuggestion[]) => void
  onSearchKeywordChange: (keyword: string) => void
}

export function MembersField({
  members,
  hasError = false,
  suggestions,
  isSearching,
  onChange,
  onSearchKeywordChange,
}: MembersFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchText, setSearchText] = useState('')

  const visibleSuggestions = useMemo(
    () => filterMemberSuggestions(suggestions, members),
    [members, suggestions],
  )

  const trimmedSearch = searchText.trim()
  const showDropdown = isFocused && trimmedSearch.length > 0

  const updateSearchText = (value: string) => {
    setSearchText(value)
    onSearchKeywordChange(value.trim())
  }

  const handleInputChange = (value: string) => {
    if (value.includes(',')) {
      const { members: nextMembers, remainder } = addMembersFromManualInput(
        members,
        value,
      )

      if (nextMembers !== members) {
        onChange(nextMembers)
      }

      updateSearchText(remainder)
      return
    }

    updateSearchText(value)
  }

  const commitPendingToken = () => {
    if (!trimmedSearch) {
      return
    }

    const nextMembers = commitManualVisaToken(members, trimmedSearch)

    if (nextMembers !== members) {
      onChange(nextMembers)
    }

    updateSearchText('')
  }

  const handleSelect = (employee: EmployeeSuggestion) => {
    onChange(addMember(members, employee))
    updateSearchText('')
    inputRef.current?.focus()
  }

  const handleRemove = (visa: string) => {
    onChange(removeMember(members, visa))
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      if (visibleSuggestions.length === 1) {
        handleSelect(visibleSuggestions[0])
        return
      }

      commitPendingToken()
      return
    }

    if (
      event.key === 'Backspace' &&
      searchText === '' &&
      members.length > 0
    ) {
      onChange(removeMember(members, members[members.length - 1].visa))
    }
  }

  const handleBlur = () => {
    if (trimmedSearch && isValidVisaToken(trimmedSearch)) {
      commitPendingToken()
    }

    setIsFocused(false)
  }

  return (
    <div className="relative w-full">
      <div
        className={containerClass(hasError, isFocused)}
        onClick={() => inputRef.current?.focus()}
      >
        {members.map((member) => (
          <span
            key={member.visa}
            className="inline-flex max-w-full items-center gap-1 rounded border border-slate-400 bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
          >
            <span className="truncate">
              {formatMemberLabel(member, { uppercaseName: true })}
            </span>
            <button
              type="button"
              className="shrink-0 text-sm leading-none text-slate-500 hover:text-slate-700"
              aria-label={t('members.remove', { visa: member.visa })}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleRemove(member.visa)}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="min-w-[80px] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-slate-700 outline-none"
          placeholder={members.length === 0 ? t('members.placeholder') : undefined}
          value={searchText}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
      </div>

      {showDropdown && (
        <ul
          className="absolute z-10 mt-0 max-h-40 w-full overflow-y-auto border border-sky-500 bg-white py-1"
          role="listbox"
        >
          {isSearching && visibleSuggestions.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-slate-500">
              {t('members.searching')}
            </li>
          )}

          {!isSearching && visibleSuggestions.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-slate-500">
              {t('members.noResults')}
            </li>
          )}

          {visibleSuggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-sky-50"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                {formatMemberLabel(suggestion)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function containerClass(hasError: boolean, isFocused: boolean) {
  return [
    'flex min-h-7 w-full flex-wrap items-center gap-1 rounded border bg-white px-1 py-0.5 shadow-inner',
    hasError
      ? 'border-red-500'
      : isFocused
        ? 'border-sky-500'
        : 'border-slate-300',
  ].join(' ')
}
