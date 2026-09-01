import { useEffect, useState } from 'react'
import './App.css'
import { api, getToken, setToken } from './api/client'
import AuthForm from './components/AuthForm'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'
import ThemeToggle from './components/ThemeToggle'

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

  return (
    <div className="app">
      <header className="masthead">
        <p className="masthead-kicker">Personnel File · Confidential</p>
        <div className="masthead-row">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">JT</span>
            <h1>Job Application Tracker</h1>
          </div>
          <div className="masthead-actions">
            <ThemeToggle />
            {user && (
              <div className="user-tab">
                <span>{user.email}</span>
                <button type="button" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {loading ? (
          <p className="status-message loading">Retrieving file</p>
        ) : !user ? (
          <AuthForm onAuthenticated={handleAuthenticated} />
        ) : (
          <>
            <ApplicationForm onCreated={(app) => setApplications((prev) => [app, ...prev])} />
            <p className="ledger-summary">
              {applications.length} {applications.length === 1 ? 'file' : 'files'} on record
            </p>
            <ApplicationList applications={applications} onChange={setApplications} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
