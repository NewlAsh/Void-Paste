import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'

const ease = [0.16, 1, 0.3, 1]

function Field({ label, type = 'text', value, onChange, error }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: 'relative', marginBottom: '1.4rem' }}>
      <motion.label
        animate={{
          y: active ? -20 : 0,
          scale: active ? 0.76 : 1,
          color: focused ? 'var(--accent)' : 'var(--text-muted)',
        }}
        transition={{ ease, duration: 0.18 }}
        style={{
          position: 'absolute', left: '0.9rem', top: '0.8rem',
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          letterSpacing: '0.08em', pointerEvents: 'none',
          transformOrigin: 'left center', zIndex: 1,
        }}
      >
        {label}
      </motion.label>
      <motion.div
        animate={{ borderColor: focused ? 'var(--accent)' : error ? 'var(--red)' : 'var(--border)' }}
        transition={{ ease, duration: 0.15 }}
        style={{ border: '1px solid var(--border)', borderRadius: '3px' }}
      >
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', background: 'var(--bg-raised)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem', padding: '0.85rem 0.9rem 0.45rem',
            border: 'none', outline: 'none', borderRadius: '3px',
          }}
        />
      </motion.div>
      {error && (
        <p style={{ fontSize: '0.65rem', color: 'var(--red)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem', cursor: 'pointer' }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <motion.div
        animate={{ backgroundColor: value ? 'var(--accent)' : 'var(--bg-raised)' }}
        transition={{ ease, duration: 0.15 }}
        style={{ width: '34px', height: '18px', borderRadius: '9px', border: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}
      >
        <motion.div
          animate={{ x: value ? 17 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ position: 'absolute', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: value ? '#0D0D0D' : 'var(--text-muted)' }}
        />
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [fields, setFields] = useState({ username: '', email: '', password: '', private_account: false })
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!fields.username) e.username = 'required'
    if (mode === 'register' && !fields.email) e.email = 'required'
    if (!fields.password || fields.password.length < 8) e.password = 'min 8 chars'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({}); setServerErr(''); setLoading(true)
    try {
      if (mode === 'login') {
        await login(fields.username, fields.password)
      } else {
        await authAPI.register({ username: fields.username, email: fields.email, password: fields.password, private_account: fields.private_account })
        await login(fields.username, fields.password)
      }
      navigate('/')
    } catch (err) {
      setServerErr(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease, duration: 0.35 }}
        style={{ width: '100%', maxWidth: '360px' }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '0.5rem' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>VOIDPASTE</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {mode === 'login' ? 'Welcome back' : 'New account'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '1px', marginBottom: '1.8rem', background: 'var(--border)', borderRadius: '3px', padding: '1px' }}>
          {['login', 'register'].map(m => (
            <motion.button key={m}
              onClick={() => { setMode(m); setErrors({}); setServerErr('') }}
              animate={{ background: mode === m ? 'var(--bg-raised)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)' }}
              style={{ flex: 1, padding: '0.45rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', border: 'none', cursor: 'pointer', borderRadius: '2px' }}
            >
              {m.toUpperCase()}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -6 : 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ ease, duration: 0.2 }}
          >
            <Field label="USERNAME" value={fields.username} onChange={set('username')} error={errors.username} />
            {mode === 'register' && <Field label="EMAIL" type="email" value={fields.email} onChange={set('email')} error={errors.email} />}
            <Field label="PASSWORD" type="password" value={fields.password} onChange={set('password')} error={errors.password} />
            {mode === 'register' && <Toggle label="PRIVATE ACCOUNT" value={fields.private_account} onChange={v => setFields(f => ({ ...f, private_account: v }))} />}
          </motion.div>
        </AnimatePresence>

        {serverErr && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--red)', marginBottom: '0.9rem' }}>{serverErr}</p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={submit}
          disabled={loading}
          style={{
            width: '100%', padding: '0.7rem',
            background: loading ? 'var(--bg-raised)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : '#0D0D0D',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            letterSpacing: '0.12em', fontWeight: 600,
            border: 'none', borderRadius: '3px', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '...' : mode === 'login' ? 'SIGN IN' : 'CREATE'}
        </motion.button>
      </motion.div>
    </div>
  )
}
