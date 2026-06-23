import { useTranslation } from 'react-i18next'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <nav className="mt-4 flex justify-end" aria-label={t('pagination.label')}>
      <div className="inline-flex items-center text-sm text-slate-600">
        <button
          type="button"
          className="h-7 min-w-7 px-1 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label={t('pagination.first')}
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          &laquo;
        </button>

        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1]
          const showEllipsis = previousPage != null && page - previousPage > 1

          return (
            <span key={page} className="inline-flex items-center">
              {showEllipsis && <span className="px-1 text-slate-400">…</span>}
              <button
                type="button"
                className={`h-7 min-w-7 px-2 ${
                  page === currentPage
                    ? 'bg-slate-200 font-medium text-slate-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-label={t('pagination.page', { page })}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </span>
          )
        })}

        <button
          type="button"
          className="h-7 min-w-7 px-1 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          aria-label={t('pagination.last')}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          &raquo;
        </button>
      </div>
    </nav>
  )
}
