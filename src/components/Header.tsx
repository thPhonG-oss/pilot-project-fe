import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import logoUrl from '../assets/logo.webp'
import { LANGUAGE_STORAGE_KEY } from '../i18n'

function ElcaLogo() {
  return (
    <img
      src={logoUrl}
      alt="ELCA"
      className="h-9 w-auto shrink-0 object-contain"
    />
  )
}

export function Header() {
  const { i18n, t } = useTranslation()

  function changeLanguage(language: 'en' | 'vi') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    i18n.changeLanguage(language)
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-8 lg:px-[112px]">
      <div className="flex min-w-0 items-center gap-8">
        <Link to="/">
          <ElcaLogo />
        </Link>
        <strong className="truncate text-[22px] font-semibold text-slate-600">
          {t('app.title')}
        </strong>
      </div>

      <nav className="flex items-center gap-3 text-sm text-slate-400" aria-label={t('app.userActions')}>
        <div className="flex items-center gap-3 mr-16">
        <button
          className={i18n.language === 'en' ? 'font-semibold text-sky-600' : 'text-slate-600 font-semibold'}
          type="button"
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
        <span>|</span>
        <button
          className={i18n.language === 'vi' ? 'font-semibold text-sky-600' : 'text-slate-600 font-semibold'}
          type="button"
          onClick={() => changeLanguage('vi')}
        >
          VI
        </button>
        </div>
        <a className="text-sky-600 no-underline font-semibold" href="#help">{t('app.help')}</a>
        <button className="text-slate-400 font-semibold ml-6" type="button">{t('app.logout')}</button>
      </nav>
    </header>
  )
}
