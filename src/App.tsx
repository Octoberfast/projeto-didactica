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

function App() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
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
    </Routes>
  )
}

export default App
