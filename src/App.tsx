import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import CompanyModules from './pages/CompanyModules'
import Users from './pages/Users'
import UserDetail from './pages/UserDetail'
import ModulePricing from './pages/ModulePricing'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id/modules" element={<CompanyModules />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="modules/pricing" element={<ModulePricing />} />
      </Route>
    </Routes>
  )
}

export default App
