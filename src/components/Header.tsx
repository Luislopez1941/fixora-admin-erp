import { useLocation } from 'react-router-dom'
import './Header.css'

const PAGE_TITLES: Record<string, string> = {
  '/':                'Dashboard',
  '/companies':       'Empresas',
  '/users':           'Usuarios',
  '/modules/pricing': 'Precios',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Panel'

  return (
    <header className="astra-header">
      <div className="astra-header__left">
        <span className="msr astra-header__icon-menu">menu</span>
        <span className="astra-header__title">{title}</span>
      </div>
      <div className="astra-header__right">
        <button className="astra-header__btn" title="Notificaciones">
          <span className="msr">notifications</span>
        </button>
        <button className="astra-header__btn" title="Usuario">
          <span className="msr">person</span>
        </button>
      </div>
    </header>
  )
}
