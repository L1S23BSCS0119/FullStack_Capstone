import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  return (
    <section className="hero container">
      <div className="hero-copy">
        <span className="eyebrow">SMART SERVICE REQUEST TRACKING</span>
        <h1>Turn everyday issues into <span>visible progress.</span></h1>
        <p>IssueFlow helps students, teams, and organizations report problems, track resolutions, and keep communication in one place.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to={user ? '/dashboard' : '/register'}>{user ? 'Open dashboard' : 'Create free account'}</Link>
          <Link className="btn btn-ghost btn-lg" to={user ? '/tickets' : '/login'}>{user ? 'View tickets' : 'Sign in'}</Link>
        </div>
        <div className="feature-row">
          <div><strong>Role based</strong><span>User + admin access</span></div>
          <div><strong>Searchable</strong><span>Filter every request</span></div>
          <div><strong>Insightful</strong><span>Live dashboard charts</span></div>
        </div>
      </div>
      <div className="hero-card">
        <div className="mini-window">
          <div className="mini-top"><span></span><span></span><span></span></div>
          <div className="mini-stat"><span>Open requests</span><strong>18</strong></div>
          <div className="mini-ticket"><b>WiFi outage in Lab 4</b><span className="badge badge-in-progress">in progress</span></div>
          <div className="mini-ticket"><b>Broken projector</b><span className="badge badge-open">open</span></div>
          <div className="mini-ticket"><b>Library AC issue</b><span className="badge badge-resolved">resolved</span></div>
        </div>
      </div>
    </section>
  )
}
