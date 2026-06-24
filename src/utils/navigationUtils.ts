export function resolveReturnTo(searchParams: URLSearchParams): string {
  const returnTo = searchParams.get('returnTo')

  if (returnTo?.startsWith('/projects')) {
    return returnTo
  }

  return '/projects'
}
