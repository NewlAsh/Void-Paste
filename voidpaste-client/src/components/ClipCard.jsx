import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clipsAPI } from '../api'

const ease = [0.16, 1, 0.3, 1]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ClipCard({ clip, canDelete, onDelete, index }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm) { setConfirm(true); return }
    setDeleting(true)
    try {
      await clipsAPI.delete(clip.id)
      onDelete?.(clip.id)
    } catch { setDeleting(false); setConfirm(false) }
  }

  return (
    <AnimatePresence>
      {!deleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ ease, duration: 0.26, delay: index * 0.04 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => setExpanded(e => !e)}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '3px',
            background: 'var(--bg-surface)',
            marginBottom: '2px',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <motion.span
                animate={{ rotate: expanded ? 90 : 0 }}
                transition={{ ease, duration: 0.15 }}
                style={{ color: 'var(--text-muted)', fontSize: '0.55rem', flexShrink: 0 }}
              >▶</motion.span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clip.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                {formatDate(clip.date_posted)}
              </span>
              {canDelete && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleDelete}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                    color: confirm ? 'var(--red)' : 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em',
                  }}
                >
                  {confirm ? 'CONFIRM?' : 'DEL'}
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
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
      )}
    </AnimatePresence>
  )
}
