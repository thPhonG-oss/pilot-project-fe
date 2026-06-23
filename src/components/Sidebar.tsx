import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

export function Sidebar() {
  const { t } = useTranslation()

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
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.project')}</span>
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.customer')}</span>
      <span className="block whitespace-nowrap text-sm text-slate-500 lg:mb-3">{t('nav.supplier')}</span>
    </aside>
  )
}
