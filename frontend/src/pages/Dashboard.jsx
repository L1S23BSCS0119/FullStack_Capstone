import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get('/dashboard').then(r=>setData(r.data)).catch(()=>setError('Could not load dashboard.')) }, [])
  if (error) return <div className="container page"><div className="alert error">{error}</div></div>
  if (!data) return <div className="page-center"><div className="spinner" /></div>
  const chart = Object.entries(data.by_status).map(([name,value])=>({name,value}))

  return <div className="container page">
    <div className="page-head"><div><span className="eyebrow">OVERVIEW</span><h1>Hello, {user?.name?.split(' ')[0]} 👋</h1><p className="muted">Here is what is happening with {user?.role==='admin'?'all requests':'your requests'}.</p></div><Link className="btn btn-primary" to="/tickets/new">+ New ticket</Link></div>
    <div className="stats-grid">
      <div className="stat-card"><span>Total requests</span><strong>{data.total}</strong></div>
      <div className="stat-card"><span>Open</span><strong>{data.by_status.open}</strong></div>
      <div className="stat-card"><span>In progress</span><strong>{data.by_status['in-progress']}</strong></div>
      <div className="stat-card"><span>Resolved</span><strong>{data.by_status.resolved}</strong></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-head"><h3>Status breakdown</h3></div>{data.total===0?<div className="empty">No data yet. Create your first ticket.</div>:<div className="chart-wrap"><ResponsiveContainer width="100%" height={260}><PieChart><Pie data={chart} dataKey="value" nameKey="name" outerRadius={90} label>{chart.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>}</section>
      <section className="panel"><div className="panel-head"><h3>Recent tickets</h3><Link to="/tickets">View all</Link></div>{data.recent.length===0?<div className="empty">No recent tickets.</div>:<div className="list">{data.recent.map(t=><Link className="list-row" to={`/tickets/${t.id}`} key={t.id}><div><strong>{t.title}</strong><span>{t.category} · {t.priority} priority</span></div><StatusBadge status={t.status}/></Link>)}</div>}</section>
    </div>
  </div>
}
