import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const ease = [0.16, 1, 0.3, 1]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FeedCard({ clip, index }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease, duration: 0.26, delay: index * 0.04 }}
      whileTap={{ scale: 0.998 }}
      style={{ border: '1px solid var(--border)', borderRadius: '3px', background: 'var(--bg-surface)', marginBottom: '2px', overflow: 'hidden' }}
    >
      <div onClick={() => setExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ ease, duration: 0.15 }}
            style={{ color: 'var(--text-muted)', fontSize: '0.55rem', flexShrink: 0 }}>▶</motion.span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {clip.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); navigate(`/user/${clip.user_id}`) }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {clip.username}
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {formatDate(clip.date_posted)}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ ease, duration: 0.22 }}
            style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <pre style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.65,
              color: 'var(--text-primary)', padding: '0.9rem',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              margin: 0, background: 'var(--bg-editor)',
              maxHeight: '300px', overflowY: 'auto',
            }}>
              {clip.content}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FeedPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/').then(r => setClips(r.data)).catch(() => setError('Failed to load feed')).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <header style={{
        height: '40px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.14em' }}>VOIDPASTE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {[
            { label: 'EDITOR', action: () => navigate('/') },
            { label: user?.username, action: () => navigate(`/user/${user?.id}`) },
            { label: 'EXIT', action: logout },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '1.8rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ ease, duration: 0.28 }}
          style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Public Feed</h1>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>snippets from public accounts</p>
          </div>
          {!loading && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>{clips.length} total</span>}
        </motion.div>

        {loading && (
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.1em', paddingTop: '2rem' }}>
            LOADING
          </motion.div>
        )}
        {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--red)' }}>{error}</p>}
        {!loading && !error && clips.length === 0 && (
          <div style={{ border: '1px dashed var(--border)', borderRadius: '3px', padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>no public snippets yet</p>
          </div>
        )}
        {!loading && !error && clips.map((clip, i) => <FeedCard key={clip.id} clip={clip} index={i} />)}
      </div>
    </div>
  )
}
