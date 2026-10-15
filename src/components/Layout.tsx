import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Header from './Header'
import './Layout.css'

const NAV = [
  { to: '/',                label: 'Dashboard',          icon: 'dashboard',              end: true },
  { to: '/companies',       label: 'Empresas',            icon: 'apartment',              end: false },
  { to: '/business-types',  label: 'Giros',               icon: 'store',                  end: false },
  { to: '/users',           label: 'Usuarios',            icon: 'group',                  end: false },
  { to: '/modules/pricing', label: 'Precios de módulos',  icon: 'sell',                   end: false },
  { to: '/limits/pricing',  label: 'Precios de límites',  icon: 'tune',                   end: false },
  { to: '/licenses',        label: 'Licencias',             icon: 'key',                    end: false },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="layout">
      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">A</span>
          <div className="sidebar__brand-text">
            <strong>astra-admin</strong>
            <small>Panel del sistema</small>
          </div>
        </div>

        <button
          type="button"
          className="sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.00979 2.72L10.3565 7.06667C10.8698 7.58 10.8698 8.42 10.3565 8.93333L6.00979 13.28"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <nav className="sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="msr sidebar__icon" style={{ fontSize: 20 }}>{item.icon}</span>
              <span className="sidebar__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__dot" />
          <span className="sidebar__label">Sistema en línea</span>
        </div>
      </aside>

      <main className="content">
        <Header />
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
