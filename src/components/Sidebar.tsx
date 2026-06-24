import { useTranslation } from 'react-i18next'
import { NavLink, useLocation, useMatch } from 'react-router-dom'

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const isNewProject = Boolean(useMatch('/projects/new'))
  const isEditProject = Boolean(useMatch('/projects/:projectId/edit'))
  const returnTo = `${location.pathname}${location.search}`
  const createPath = `/projects/new?returnTo=${encodeURIComponent(returnTo)}`

  const sectionLabel = isEditProject ? t('nav.edit') : t('nav.new')
  const isSectionActive = isNewProject || isEditProject

  return (
    <aside
      className="flex gap-4 overflow-x-auto border-b border-slate-200 bg-white px-5 py-4 lg:block lg:border-b-0 lg:border-r lg:px-[86px] lg:py-8"
      aria-label={t('app.primaryNavigation')}
    >
      <NavLink
        end
        className={({ isActive }) => `block whitespace-nowrap text-base font-semibold no-underline lg:mb-8 ${
          isActive ? 'text-sky-600' : 'text-slate-600'
        }`}
        to="/projects"
      >
        {t('nav.projectsList')}
      </NavLink>

      <span
        className={`block whitespace-nowrap text-base font-semibold no-underline lg:mb-4 ${
          isSectionActive ? 'font-semibold text-sky-600' : 'font-medium text-slate-500'
        }`}
      >
        {sectionLabel}
      </span>

      {isEditProject ? (
        <span className="block whitespace-nowrap text-sm font-semibold text-slate-600 lg:mb-3">
          {t('nav.project')}
        </span>
      ) : (
        <NavLink
          className={({ isActive }) => `block whitespace-nowrap text-sm no-underline lg:mb-3 ${
            isActive ? 'font-semibold text-slate-700' : 'font-normal text-slate-500'
          }`}
          to={createPath}
        >
          {t('nav.project')}
        </NavLink>
      )}

      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.customer')}</span>
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.supplier')}</span>
    </aside>
  )
}
