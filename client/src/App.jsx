import { useEffect, useState } from 'react'
import './App.css'
import { api, getToken, setToken } from './api/client'
import AuthForm from './components/AuthForm'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'

function App() {
  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  // On first load, if a token is already saved from a previous visit, try to
  // restore the session instead of showing the login form again.
  useEffect(() => {
    async function init() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api.me()
        const { applications } = await api.listApplications()
        setUser(user)
        setApplications(applications)
      } catch (err) {
        // Token was invalid/expired - clear it and fall back to the login form.
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  async function handleAuthenticated(authedUser) {
    setUser(authedUser)
    const { applications } = await api.listApplications()
    setApplications(applications)
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
    setApplications([])
  }

  if (loading) {
    return <p className="status-message">Loading…</p>
  }

  return (
    <div className="app">
      <header>
        <h1>Job Application Tracker</h1>
        {user && (
          <div className="user-bar">
            <span>{user.email}</span>
            <button type="button" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </header>
      <main>
        {!user ? (
          <AuthForm onAuthenticated={handleAuthenticated} />
        ) : (
          <>
            <ApplicationForm onCreated={(app) => setApplications((prev) => [app, ...prev])} />
            <ApplicationList applications={applications} onChange={setApplications} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
