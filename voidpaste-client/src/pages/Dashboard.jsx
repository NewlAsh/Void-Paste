import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { clipsAPI } from '../api'

const ease = [0.16, 1, 0.3, 1]

// Syntax token colors — very subtle, not a full highlighter
const TOKEN_COLORS = {
  keyword: '#C9A84C',
  comment: '#4A4A42',
  string: '#7FB069',
  number: '#A8A89A',
}

function tokenizeLine(line) {
  // Minimal tokenizer — keywords, comments, strings
  const parts = []
  let rest = line

  // Single-line comment
  const commentIdx = rest.search(/\/\/|#/)
  if (commentIdx !== -1) {
    parts.push({ text: rest.slice(0, commentIdx), color: null })
    parts.push({ text: rest.slice(commentIdx), color: TOKEN_COLORS.comment })
    return parts
  }

  // Very simple pass — just color keywords inline
  const keywords = /\b(const|let|var|def|return|import|from|export|default|function|async|await|if|else|for|while|class|in|of|try|catch|pass|and|or|not|True|False|None)\b/g
  let last = 0
  let match
  while ((match = keywords.exec(rest)) !== null) {
    if (match.index > last) parts.push({ text: rest.slice(last, match.index), color: null })
    parts.push({ text: match[0], color: TOKEN_COLORS.keyword })
    last = match.index + match[0].length
  }
  if (last < rest.length) parts.push({ text: rest.slice(last), color: null })
  return parts.length ? parts : [{ text: rest, color: null }]
}

function EditorLine({ line, number, isActive }) {
  const tokens = tokenizeLine(line || '')
  return (
    <div style={{ display: 'flex', minHeight: '21px' }}>
      <div style={{
        width: '44px', flexShrink: 0,
        textAlign: 'right', paddingRight: '16px',
        fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: '21px',
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        userSelect: 'none',
        transition: 'color 0.1s',
      }}>
        {number}
      </div>
      <div style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '21px', color: 'var(--text-primary)', whiteSpace: 'pre' }}>
        {tokens.map((t, i) => (
          <span key={i} style={{ color: t.color || 'var(--text-primary)' }}>{t.text}</span>
        ))}
        {line === '' && <span style={{ color: 'transparent' }}>_</span>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(null)
  const [activeLine, setActiveLine] = useState(0)
  const textareaRef = useRef(null)
  const overlayRef = useRef(null)

  const lines = content.split('\n')

  const syncScroll = (e) => {
    if (overlayRef.current) overlayRef.current.scrollTop = e.target.scrollTop
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.target.selectionStart
      const end = e.target.selectionEnd
      const next = content.substring(0, start) + '  ' + content.substring(end)
      setContent(next)
      requestAnimationFrame(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
      })
    }
  }

  const handleSelect = (e) => {
    const val = e.target.value.substring(0, e.target.selectionStart)
    setActiveLine(val.split('\n').length - 1)
  }

  const publish = async () => {
    if (!title.trim() || !content.trim()) return
    setStatus('saving')
    try {
      await clipsAPI.create({ title, content })
      setStatus('saved')
      setTitle(''); setContent('')
      setTimeout(() => setStatus(null), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(null), 2500)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <header style={{
        height: '40px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.14em' }}>VOIDPASTE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {[
            { label: 'FEED', action: () => navigate('/feed') },
            { label: user?.username, action: () => navigate(`/user/${user?.id}`) },
            { label: 'EXIT', action: logout },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.08em' }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Window chrome — fake tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'stretch', padding: '0 1rem', gap: '1px' }}>
        <div style={{
          padding: '0.4rem 1rem',
          borderBottom: '1px solid var(--accent)',
          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>✎</span>
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title || 'untitled.txt'}
          </span>
        </div>
      </div>

      {/* Title input */}
      <div style={{ padding: '0.6rem 1rem 0.4rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="snippet title..."
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 500,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}
        />
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', background: 'var(--bg-editor)' }}>
        {/* Syntax highlight overlay (visual only, pointer-events none) */}
        <div
          ref={overlayRef}
          style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            padding: '0.75rem 0',
          }}
        >
          {lines.map((line, i) => (
            <EditorLine key={i} line={line} number={i + 1} isActive={i === activeLine} />
          ))}
        </div>

        {/* Actual textarea — transparent text so overlay shows through */}
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Gutter spacer */}
          <div style={{ width: '44px', flexShrink: 0 }} />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => { setContent(e.target.value); handleSelect(e) }}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            onClick={handleSelect}
            onKeyUp={handleSelect}
            spellCheck={false}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              lineHeight: '21px', color: 'transparent',
              caretColor: 'var(--accent)',
              padding: '0.75rem 1rem 0.75rem 0',
              minHeight: 'calc(100vh - 200px)',
              position: 'relative', zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* Statusbar */}
      <footer style={{
        height: '26px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem', background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            Ln {activeLine + 1}, Col {content.split('\n')[activeLine]?.length ?? 0}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {lines.length} lines
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {content.length} chars
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AnimatePresence>
            {status && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: status === 'saved' ? 'var(--green)' : status === 'error' ? 'var(--red)' : 'var(--text-muted)' }}
              >
                {status === 'saving' ? 'publishing...' : status === 'saved' ? '✓ published' : '✗ failed'}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={publish}
            disabled={!title.trim() || !content.trim()}
            style={{
              padding: '0.2rem 0.8rem',
              background: title.trim() && content.trim() ? 'var(--accent)' : 'transparent',
              color: title.trim() && content.trim() ? '#0D0D0D' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', fontWeight: 600,
              border: '1px solid', borderColor: title.trim() && content.trim() ? 'transparent' : 'var(--border)',
              borderRadius: '2px', cursor: title.trim() && content.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            PUBLISH
          </motion.button>
        </div>
      </footer>
    </div>
  )
}
