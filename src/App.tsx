import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import CompanyModules from './pages/CompanyModules'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import ClientUserOverview from './pages/ClientUserOverview'
import ModulePricing from './pages/ModulePricing'
import LimitPricing from './pages/LimitPricing'
import BusinessTypes from './pages/BusinessTypes'
import Licenses from './pages/Licenses'

function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/:id/modules" element={<CompanyModules />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<ClientUserOverview />} />
          <Route path="users/:clientUserId/:userId" element={<UserDetail />} />
          <Route path="modules/pricing" element={<ModulePricing />} />
          <Route path="limits/pricing" element={<LimitPricing />} />
          <Route path="business-types" element={<BusinessTypes />} />
          <Route path="licenses" element={<Licenses />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
