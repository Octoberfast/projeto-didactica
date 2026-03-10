import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import ChooseContentType from './pages/ChooseContentType'
import ElementosAprendizagem from './pages/ElementosAprendizagem'
import FerramentasPlanejamento from './pages/FerramentasPlanejamento'
import FerramentasRevisao from './pages/FerramentasRevisao'
import GuiaManual from './pages/GuiaManual'
import ProtectedRoute from './components/ProtectedRoute'
import Transcricao from './pages/Transcricao'
import Sumario from './pages/Sumario'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import Users from './pages/admin/Users'
import AdminHub from './pages/admin/AdminHub'
import Tokens from './pages/admin/Tokens'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Routes>
        <Route path="/admin" element={
          <AdminRoute>
            <AdminHub />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } />
        <Route path="/admin/tokens" element={
          <AdminRoute>
            <Tokens />
          </AdminRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        } />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <ChooseContentType />
          </ProtectedRoute>
        } />
      <Route 
        path="/elementos-aprendizagem" 
        element={
          <ProtectedRoute>
            <ElementosAprendizagem />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ferramentas-planejamento" 
        element={
          <ProtectedRoute>
            <FerramentasPlanejamento />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ferramentas-revisao" 
        element={
          <ProtectedRoute>
            <FerramentasRevisao />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/guia-manual" 
        element={
          <ProtectedRoute>
            <GuiaManual />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transcricao" 
        element={
          <ProtectedRoute>
            <Transcricao />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sumario" 
        element={
          <ProtectedRoute>
            <Sumario />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App
