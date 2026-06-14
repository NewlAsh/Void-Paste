import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { usersAPI, clipsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import ClipCard from '../components/ClipCard'

const ease = [0.16, 1, 0.3, 1]

function Stat({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: accent ? 'var(--accent)' : 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [clips, setClips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isOwn = me?.id === parseInt(id)

  useEffect(() => {
    setLoading(true); setError('')
    const fetchProfile = isOwn ? Promise.resolve({ data: me }) : usersAPI.getUser(id)
    Promise.all([fetchProfile, clipsAPI.getUserClips(id)])
      .then(([p, c]) => { setProfile(p.data); setClips(c.data) })
      .catch(err => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        LOADING
      </motion.div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--red)', marginBottom: '1rem' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', background: 'none', border: '1px solid var(--border)', padding: '0.35rem 0.9rem', cursor: 'pointer', borderRadius: '2px' }}>← BACK</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <header style={{
        height: '40px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', background: 'var(--bg-surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.14em' }}>VOIDPASTE</span>
        </div>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}>
          ← EDITOR
        </button>
      </header>

      <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ease, duration: 0.3 }} style={{ position: 'sticky', top: '1rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '3px',
            background: 'var(--bg-raised)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
            color: 'var(--accent)', fontWeight: 600, marginBottom: '0.9rem',
          }}>
            {profile?.username?.[0]?.toUpperCase()}
          </div>

          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            {profile?.username}
          </h2>
          {isOwn && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1.2rem' }}>{profile?.email}</p>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.9rem', marginTop: isOwn ? 0 : '1.2rem' }}>
            <Stat label="SNIPPETS" value={clips.length} />
            <Stat label="UID" value={`#${profile?.id}`} />
            {isOwn && <Stat label="VISIBILITY" value={me?.private_account ? 'PRIVATE' : 'PUBLIC'} accent />}
          </div>

          {isOwn && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')}
              style={{
                marginTop: '1.2rem', width: '100%', padding: '0.45rem',
                background: 'var(--accent)', color: '#0D0D0D',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                letterSpacing: '0.1em', fontWeight: 600,
                border: 'none', borderRadius: '2px', cursor: 'pointer',
              }}>
              + NEW SNIPPET
            </motion.button>
          )}
        </motion.div>

        {/* Right */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ease, duration: 0.35, delay: 0.08 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SNIPPETS</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>{clips.length} total</span>
          </div>

          {clips.length === 0 ? (
            <div style={{ border: '1px dashed var(--border)', borderRadius: '3px', padding: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>no snippets yet</p>
            </div>
          ) : (
            clips.map((clip, i) => <ClipCard key={clip.id} clip={clip} index={i} canDelete={isOwn} onDelete={id => setClips(cs => cs.filter(c => c.id !== id))} />)
          )}
        </motion.div>
      </div>
    </div>
  )
}
