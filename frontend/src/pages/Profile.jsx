import { useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function Profile(){
 const{user,setUser}=useAuth();const[name,setName]=useState(user.name),[message,setMessage]=useState(''),[error,setError]=useState('')
 const submit=async e=>{e.preventDefault();setMessage('');setError('');if(name.trim().length<2)return setError('Name must be at least 2 characters.');try{const r=await api.put('/auth/profile',{name});setUser(r.data);setMessage('Profile updated successfully.')}catch{setError('Could not update profile.')}}
 return <div className="container page narrow"><div className="page-head"><div><span className="eyebrow">ACCOUNT</span><h1>Your profile</h1><p className="muted">Manage the information associated with your account.</p></div></div><form className="panel form-card" onSubmit={submit}>{message&&<div className="alert success">{message}</div>}{error&&<div className="alert error">{error}</div>}<label>Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input value={user.email} disabled/></label><label>Role<input value={user.role} disabled/></label><div className="form-actions"><button className="btn btn-primary">Save profile</button></div></form></div>
}
