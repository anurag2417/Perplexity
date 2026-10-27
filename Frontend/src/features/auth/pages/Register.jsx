import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../hook/useAuth'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { handleRegister } = useAuth()
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()
    if (await handleRegister({ username, email, password })) navigate('/login')
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
          <div className="auth-card-heading"><p className="eyebrow">Get started</p><h2>Create your account</h2><p>It only takes a minute to begin.</p></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <form onSubmit={submitForm} className="auth-form">
            <div><label htmlFor="username">Username</label><input className="auth-input" id="username" type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Choose a username" required /></div>
            <div><label htmlFor="email">Email address</label><input className="auth-input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            <div><label htmlFor="password">Password</label><input className="auth-input" id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" required /></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </main>
  )
}

export default Register
