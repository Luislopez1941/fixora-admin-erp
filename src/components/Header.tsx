import { useLocation, useNavigate } from 'react-router-dom'
import APIs from '../services/APIs'
import './Header.css'

const PAGE_TITLES: Record<string, string> = {
  '/':                'Dashboard',
  '/companies':       'Empresas',
  '/business-types':  'Giros / Tipos de negocio',
  '/users':           'Usuarios',
  '/modules/pricing': 'Precios',
  '/limits/pricing':  'Precios de límites',
  '/licenses':        'Licencias',
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[pathname] ?? 'Panel'

  const handleLogout = () => {
    APIs.logout()
    navigate('/login', { replace: true })
  }

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
        <button className="astra-header__btn" title="Cerrar sesión" onClick={handleLogout}>
          <span className="msr">logout</span>
        </button>
      </div>
    </header>
  )
}
