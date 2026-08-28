import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketForm from './pages/TicketForm'
import TicketDetail from './pages/TicketDetail'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('issueflow_theme') === 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('issueflow_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <Navbar dark={dark} toggleDark={() => setDark((v) => !v)} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><TicketForm /></ProtectedRoute>} />
          <Route path="/tickets/:id/edit" element={<ProtectedRoute><TicketForm /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}
