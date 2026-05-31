import { NavLink, Outlet } from 'react-router-dom'
import Header from './Header'
import './Layout.css'

const NAV = [
  { to: '/',                label: 'Dashboard',          icon: 'dashboard',              end: true },
  { to: '/companies',       label: 'Empresas',            icon: 'apartment',              end: false },
  { to: '/users',           label: 'Usuarios',            icon: 'group',                  end: false },
  { to: '/modules/pricing', label: 'Precios de módulos',  icon: 'sell',                   end: false },
]

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo">A</span>
          <div>
            <strong>astra-admin</strong>
            <small>Panel del sistema</small>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar__link${isActive ? ' is-active' : ''}`
              }
            >
              <span className="msr sidebar__icon" style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__dot" /> Sistema en línea
        </div>
      </aside>

      <main className="content">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}
