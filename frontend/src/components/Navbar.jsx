import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ dark, toggleDark }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="nav-wrap">
      <nav className="nav container">
        <NavLink to="/" className="brand">Issue<span>Flow</span></NavLink>
        <div className="nav-links">
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user && <NavLink to="/tickets">Tickets</NavLink>}
          {user && <NavLink to="/tickets/new">New Ticket</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          {user && <NavLink to="/profile">Profile</NavLink>}
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleDark} aria-label="Toggle dark mode">{dark ? '☀️' : '🌙'}</button>
          {!user ? (
            <>
              <NavLink className="btn btn-ghost" to="/login">Log in</NavLink>
              <NavLink className="btn btn-primary" to="/register">Get started</NavLink>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </nav>
    </header>
  )
}
