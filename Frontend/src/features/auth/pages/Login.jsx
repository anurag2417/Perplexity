import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../hook/useAuth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const error = useSelector((state) => state.auth.error)
  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()
    if (await handleLogin({ email, password })) navigate('/dashboard')
  }

  if (!loading && user) return <Navigate to="/dashboard" replace />

  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/"><span>✦</span> Perplexity</Link>
      <div className="auth-layout">
        <div className="auth-intro">
          <p className="landing-eyebrow"><span /> Your thinking, in focus</p>
          <h1>Make every question <i>count.</i></h1>
          <p>Search less, understand more, and keep your best ideas moving forward.</p>
        </div>
        <div className="auth-card">
          <div className="auth-card-heading"><p className="eyebrow">Welcome back</p><h2>Sign in to continue</h2><p>Pick up your research where you left off.</p></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <form onSubmit={submitForm} className="auth-form">
            <div><label htmlFor="email">Email address</label><input className="auth-input" id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            <div><label htmlFor="password">Password</label><input className="auth-input" id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div>
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="auth-switch">Don&apos;t have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </main>
  )
}

export default Login
