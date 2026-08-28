import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function TicketDetail(){
 const {id}=useParams(),navigate=useNavigate(),{user}=useAuth();const[ticket,setTicket]=useState(null),[error,setError]=useState(''),[body,setBody]=useState(''),[posting,setPosting]=useState(false)
 const load=()=>api.get(`/tickets/${id}`).then(r=>setTicket(r.data)).catch(()=>setError('Ticket not found or you do not have access.'))
 useEffect(load,[id])
 const del=async()=>{if(!window.confirm('Delete this ticket permanently?'))return;await api.delete(`/tickets/${id}`);navigate('/tickets')}
 const comment=async e=>{e.preventDefault();if(body.trim().length<2)return;try{setPosting(true);await api.post(`/tickets/${id}/comments`,{body});setBody('');load()}finally{setPosting(false)}}
 const removeComment=async cid=>{await api.delete(`/comments/${cid}`);load()}
 const setStatus=async status=>{await api.put(`/tickets/${id}`,{status});load()}
 if(error)return <div className="container page"><div className="alert error">{error}</div></div>
 if(!ticket)return <div className="page-center"><div className="spinner"/></div>
 return <div className="container page narrow-wide"><div className="detail-head"><div><div className="inline-tags"><StatusBadge status={ticket.status}/><span className={`priority priority-${ticket.priority}`}>{ticket.priority}</span></div><h1>{ticket.title}</h1><p className="muted">#{ticket.id} · {ticket.category} · opened by {ticket.owner_name}</p></div><div className="detail-actions"><Link className="btn btn-ghost" to={`/tickets/${id}/edit`}>Edit</Link><button className="btn btn-danger" onClick={del}>Delete</button></div></div>{user.role==='admin'&&<div className="admin-status panel"><span>Admin status control</span><div>{['open','in-progress','resolved'].map(s=><button key={s} className={`btn btn-small ${ticket.status===s?'btn-primary':'btn-ghost'}`} onClick={()=>setStatus(s)}>{s.replace('-',' ')}</button>)}</div></div>}<section className="panel detail-panel"><h3>Description</h3><p className="detail-text">{ticket.description}</p></section><section className="panel"><div className="panel-head"><h3>Conversation</h3><span className="muted">{ticket.comments?.length||0} comments</span></div>{ticket.comments?.length===0?<div className="empty">No comments yet.</div>:<div className="comments">{ticket.comments.map(c=><div className="comment" key={c.id}><div><strong>{c.author_name}</strong><span>{new Date(c.created_at).toLocaleString()}</span></div><p>{c.body}</p>{(c.user_id===user.id||user.role==='admin')&&<button className="link-danger" onClick={()=>removeComment(c.id)}>Delete</button>}</div>)}</div>}<form className="comment-form" onSubmit={comment}><textarea rows="3" value={body} onChange={e=>setBody(e.target.value)} placeholder="Add an update or ask a question..."/><button className="btn btn-primary" disabled={posting}>{posting?'Posting...':'Post comment'}</button></form></section></div>
}
