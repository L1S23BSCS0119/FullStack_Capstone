import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Admin(){
 const{user}=useAuth();const[users,setUsers]=useState([]),[error,setError]=useState('')
 const load=()=>api.get('/admin/users').then(r=>setUsers(r.data)).catch(()=>setError('Could not load users.'))
 useEffect(load,[])
 const role=async(id,value)=>{try{await api.put(`/admin/users/${id}/role`,{role:value});load()}catch(err){setError(err.response?.data?.message||'Could not update role.')}}
 return <div className="container page"><div className="page-head"><div><span className="eyebrow">ADMINISTRATION</span><h1>User management</h1><p className="muted">Review accounts and manage role-based access.</p></div></div>{error&&<div className="alert error">{error}</div>}<div className="panel table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.name}{u.id===user.id&&<span className="you">You</span>}</td><td>{u.email}</td><td><select value={u.role} disabled={u.id===user.id} onChange={e=>role(u.id,e.target.value)}><option value="user">User</option><option value="admin">Admin</option></select></td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>
}
