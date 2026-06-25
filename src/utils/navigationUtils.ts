import type { Location } from 'react-router-dom'

const PROJECT_LIST_PATH = '/projects'

function parseReturnToPathname(returnTo: string): string | null {
  try {
    return new URL(returnTo, 'http://local').pathname
  } catch {
    return null
  }
}

function isProjectListReturnTo(returnTo: string): boolean {
  return parseReturnToPathname(returnTo) === PROJECT_LIST_PATH
}

function extractNestedReturnTo(returnTo: string): string | null {
  try {
    return new URL(returnTo, 'http://local').searchParams.get('returnTo')
  } catch {
    return null
  }
}

export function resolveReturnTo(searchParams: URLSearchParams): string {
  let candidate = searchParams.get('returnTo')

  while (candidate) {
    if (isProjectListReturnTo(candidate)) {
      return candidate
    }

    const nested = extractNestedReturnTo(candidate)
    if (!nested || nested === candidate) {
      break
    }

    candidate = nested
  }

  return PROJECT_LIST_PATH
}

export function buildReturnTo(location: Location): string {
  if (location.pathname === PROJECT_LIST_PATH) {
    return `${location.pathname}${location.search}`
  }

  return resolveReturnTo(new URLSearchParams(location.search))
}
