import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useMatch } from 'react-router-dom'

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const isEditProject = Boolean(useMatch('/projects/:projectId/edit'))
  const returnTo = `${location.pathname}${location.search}`
  const createPath = `/projects/new?returnTo=${encodeURIComponent(returnTo)}`

  return (
    <aside
      className="flex gap-4 overflow-x-auto border-b border-slate-200 bg-white px-5 py-4 lg:block lg:border-b-0 lg:border-r lg:px-[86px] lg:py-8"
      aria-label={t('app.primaryNavigation')}
    >
      <NavLink
        className={({ isActive }) => `block whitespace-nowrap text-base font-semibold no-underline lg:mb-8 ${
          isActive ? 'text-sky-600' : 'text-slate-600'
        }`}
        to="/projects"
      >
        {t('nav.projectsList')}
      </NavLink>

      {isEditProject ? (
        <div className="block whitespace-nowrap text-base font-semibold text-sky-600 no-underline lg:mb-4">
          {t('nav.editProject')}
        </div>
      ) : (
        <Link
          className="block whitespace-nowrap text-base font-semibold text-sky-600 no-underline lg:mb-4"
          to={createPath}
        >
          {t('nav.new')}
        </Link>
      )}
      <NavLink
        className="block whitespace-nowrap text-sm text-slate-500 no-underline lg:mb-3"
        to={createPath}
      >
        {t('nav.project')}
      </NavLink>
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.customer')}</span>
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.supplier')}</span>
    </aside>
  )
}
