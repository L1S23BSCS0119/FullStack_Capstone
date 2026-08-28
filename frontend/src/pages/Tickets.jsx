import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import StatusBadge from '../components/StatusBadge'

export default function Tickets() {
  const [tickets,setTickets]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState('')
  const [filters,setFilters]=useState({search:'',status:'',priority:''})

  const load = async () => {
    try { setLoading(true); const res=await api.get('/tickets',{params:filters}); setTickets(res.data); setError('') }
    catch { setError('Could not load tickets.') } finally { setLoading(false) }
  }
  useEffect(()=>{ const id=setTimeout(load,250); return()=>clearTimeout(id)},[filters.search,filters.status,filters.priority])

  return <div className="container page">
    <div className="page-head"><div><span className="eyebrow">REQUESTS</span><h1>Tickets</h1><p className="muted">Search, filter and manage service requests.</p></div><Link className="btn btn-primary" to="/tickets/new">+ New ticket</Link></div>
    <div className="filter-bar"><input placeholder="Search by title..." value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/><select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All statuses</option><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select><select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
    {error && <div className="alert error">{error}</div>}
    {loading?<div className="page-center small"><div className="spinner"/></div>:tickets.length===0?<div className="panel empty big">No tickets match your filters.</div>:<div className="ticket-grid">{tickets.map(t=><Link className="ticket-card" to={`/tickets/${t.id}`} key={t.id}><div className="ticket-top"><span className={`priority priority-${t.priority}`}>{t.priority}</span><StatusBadge status={t.status}/></div><h3>{t.title}</h3><p>{t.description}</p><div className="ticket-meta"><span>{t.category}</span><span>{new Date(t.created_at).toLocaleDateString()}</span></div></Link>)}</div>}
  </div>
}
