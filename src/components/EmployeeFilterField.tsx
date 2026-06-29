import { useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { EmployeeSuggestion } from '../types/project'
import { formatMemberLabel, isValidVisaToken } from '../utils/memberUtils'

type EmployeeFilterFieldProps = {
  value: string
  placeholder: string
  ariaLabel: string
  suggestions: EmployeeSuggestion[]
  isSearching: boolean
  disabled?: boolean
  onSearchKeywordChange: (keyword: string) => void
  onChange: (visa: string) => void
}

export function EmployeeFilterField({
  value,
  placeholder,
  ariaLabel,
  suggestions,
  isSearching,
  disabled = false,
  onSearchKeywordChange,
  onChange,
}: EmployeeFilterFieldProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selected, setSelected] = useState<EmployeeSuggestion | null>(null)

  // `selected` is only meaningful while it still matches the controlled `value` (set by a prior
  // pick in this field); once `value` changes externally (reset, URL load) without going through
  // `commitVisa`, fall back to displaying the plain visa instead of resyncing state in an effect.
  const effectiveSelected =
    selected && value && selected.visa.toUpperCase() === value.toUpperCase()
      ? selected
      : null

  const trimmedSearch = searchText.trim()
  const showDropdown = isFocused && trimmedSearch.length > 0
  const displayValue = isFocused
    ? searchText
    : value
      ? effectiveSelected
        ? formatMemberLabel(effectiveSelected)
        : value
      : ''

  const updateSearchText = (text: string) => {
    setSearchText(text)
    onSearchKeywordChange(text.trim())
  }

  const commitVisa = (visa: string, suggestion: EmployeeSuggestion | null) => {
    setSelected(suggestion)
    onChange(visa.toUpperCase())
    updateSearchText('')
  }

  const handleSelect = (suggestion: EmployeeSuggestion) => {
    commitVisa(suggestion.visa, suggestion)
    inputRef.current?.blur()
  }

  const handleBlur = () => {
    if (trimmedSearch && isValidVisaToken(trimmedSearch)) {
      commitVisa(trimmedSearch, null)
    } else {
      updateSearchText('')
    }
    setIsFocused(false)
  }

  const handleClear = () => {
    setSelected(null)
    onChange('')
    updateSearchText('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    if (suggestions.length === 1) {
      handleSelect(suggestions[0])
      return
    }

    if (isValidVisaToken(trimmedSearch)) {
      commitVisa(trimmedSearch, null)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative w-full">
      <div className={containerClass(isFocused)}>
        <input
          ref={inputRef}
          type="text"
          className="h-7 w-full min-w-0 flex-1 border-0 bg-transparent px-3 text-xs text-slate-700 outline-none disabled:bg-slate-100"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={displayValue}
          disabled={disabled}
          onChange={(event) => updateSearchText(event.target.value)}
          onFocus={() => {
            setIsFocused(true)
            setSearchText('')
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {value && !isFocused && (
          <button
            type="button"
            className="shrink-0 px-2 text-sm text-slate-400 hover:text-slate-600"
            aria-label={t('filters.clear')}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          className="absolute z-10 mt-0 max-h-40 w-full overflow-y-auto border border-sky-500 bg-white py-1"
          role="listbox"
        >
          {isSearching && suggestions.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-slate-500">
              {t('members.searching')}
            </li>
          )}

          {!isSearching && suggestions.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-slate-500">
              {t('members.noResults')}
            </li>
          )}

          {suggestions.map((suggestion) => (
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

function containerClass(isFocused: boolean) {
  return [
    'flex h-7 w-full items-center rounded border bg-white shadow-inner',
    isFocused ? 'border-sky-500' : 'border-slate-300',
  ].join(' ')
}
