import { useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../hook/useAuth'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const { handleRegister } = useAuth()
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  const submitForm = async (event) => {
    event.preventDefault()
    setFormError('')

    const normalizedUsername = username.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      setFormError('Username must be between 3 and 30 characters.')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      setFormError('Username can only contain letters, numbers, and underscores.')
      return
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    const result = await handleRegister({ username: normalizedUsername, email: normalizedEmail, password })
    if (result) setRegisteredEmail(normalizedEmail)
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/"><span>✦</span> Perplexity</Link>
      <div className="auth-layout">
        <div className="auth-intro">
          <p className="landing-eyebrow"><span /> Start with a blank page</p>
          <h1>Give your ideas room to <i>grow.</i></h1>
          <p>Create a focused workspace for questions, research, and decisions that matter.</p>
        </div>
        <div className="auth-card">
          {registeredEmail ? (
            <div className="auth-success" role="status">
              <span className="auth-success-icon">✓</span>
              <h2>Check your inbox</h2>
              <p>We sent a verification link to <strong>{registeredEmail}</strong>. Verify your email before signing in.</p>
              <Link className="auth-submit auth-submit-link" to="/login">Continue to sign in</Link>
            </div>
          ) : (
            <>
              <div className="auth-card-heading"><p className="eyebrow">Get started</p><h2>Create your account</h2><p>It only takes a minute to begin.</p></div>
              {(formError || error) && <p className="auth-error" role="alert">{formError || error}</p>}
              <form onSubmit={submitForm} className="auth-form" noValidate>
                <div><label htmlFor="username">Username</label><input className="auth-input" id="username" type="text" value={username} onChange={(event) => { setUsername(event.target.value); setFormError('') }} placeholder="Choose a username" autoComplete="username" required aria-invalid={Boolean(formError)} /></div>
                <div><label htmlFor="email">Email address</label><input className="auth-input" id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormError('') }} placeholder="you@example.com" autoComplete="email" required /></div>
                <div><label htmlFor="password">Password</label><input className="auth-input" id="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setFormError('') }} placeholder="Create a password" autoComplete="new-password" required /></div>
                <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
              </form>
              <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default Register
