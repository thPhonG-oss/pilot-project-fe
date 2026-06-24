import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

type ErrorPageState = {
  detail?: string
}

export function ErrorPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const detail = (location.state as ErrorPageState | null)?.detail

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
      <div className="flex max-w-3xl items-start gap-6">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-orange-500 text-5xl font-bold text-white"
          aria-hidden="true"
        >
          ×
        </div>
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-slate-700">
            {t('error.unexpectedTitle')}
          </h1>
          <p className="mb-1 text-lg text-orange-600">
            {detail
              ? t('error.unexpectedWithDetail', { detail })
              : t('error.unexpectedContact')}
          </p>
          <p className="text-base text-slate-600">
            {t('error.or')}{' '}
            <Link className="text-sky-600 hover:underline" to="/projects">
              {t('error.backToSearch')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
