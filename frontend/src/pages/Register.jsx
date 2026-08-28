import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const next = {}
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters.'
    if (!form.email.includes('@')) next.email = 'Enter a valid email.'
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    setErrors(next)
    if (Object.keys(next).length) return
    try {
      setLoading(true)
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) { setErrors(err.response?.data?.errors || {general:'Registration failed.'}) }
    finally { setLoading(false) }
  }

  return <div className="auth-page"><form className="auth-card" onSubmit={submit}>
    <span className="eyebrow">CREATE ACCOUNT</span><h2>Start tracking smarter</h2><p className="muted">Your requests, updates and conversations in one place.</p>
    {errors.general && <div className="alert error">{errors.general}</div>}
    <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />{errors.name && <small className="field-error">{errors.name}</small>}</label>
    <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />{errors.email && <small className="field-error">{errors.email}</small>}</label>
    <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />{errors.password && <small className="field-error">{errors.password}</small>}</label>
    <button className="btn btn-primary full" disabled={loading}>{loading?'Creating account...':'Create account'}</button>
    <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
  </form></div>
}
