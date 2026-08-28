import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.includes('@') || form.password.length < 8) return setError('Enter a valid email and password.')
    try {
      setLoading(true)
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <span className="eyebrow">WELCOME BACK</span><h2>Log in to IssueFlow</h2><p className="muted">Continue managing your requests and updates.</p>
    {error && <div className="alert error">{error}</div>}
    <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" /></label>
    <label>Password<input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="Minimum 8 characters" /></label>
    <button className="btn btn-primary full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
    <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
  </form></div>
}
