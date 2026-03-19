'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const GOAL = 500000

export default function AdminPage() {
  const [amount, setAmount] = useState('')
  const [current, setCurrent] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('church_barometer')
      .select('amount_raised')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setCurrent(data.amount_raised)
          setAmount(String(data.amount_raised))
        }
      })
  }, [])

  const handleSave = async () => {
    const val = parseFloat(amount.replace(/,/g, ''))
    if (isNaN(val) || val < 0) {
      setMessage('Please enter a valid amount')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('church_barometer')
      .update({ amount_raised: val, updated_at: new Date().toISOString() })
      .eq('id', 1)
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setCurrent(val)
      setMessage('Updated! Barometer is now live.')
    }
    setSaving(false)
  }

  const pct = Math.min((current / GOAL) * 100, 100).toFixed(1)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      fontFamily: 'Georgia, serif',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid #c5a028',
        borderRadius: '12px',
        padding: '3rem',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 0 40px rgba(197,160,40,0.15)',
      }}>
        <h1 style={{
          color: '#c5a028',
          fontSize: '1.8rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
          letterSpacing: '0.1em',
        }}>
          Update Barometer
        </h1>
        <p style={{ color: '#a09070', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Church Fundraising Drive — Goal: R500,000
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            background: 'rgba(197,160,40,0.1)',
            border: '1px solid rgba(197,160,40,0.3)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <div style={{ color: '#a09070', fontSize: '0.8rem', marginBottom: '0.3rem' }}>CURRENT AMOUNT</div>
            <div style={{ color: '#c5a028', fontSize: '2rem', fontWeight: 700 }}>
              R{new Intl.NumberFormat('en-ZA').format(current)}
            </div>
            <div style={{ color: '#a09070', fontSize: '0.9rem', marginTop: '0.3rem' }}>{pct}% of goal</div>
          </div>

          <label style={{ color: '#e8d5a3', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            New Amount (R)
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 125000"
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(197,160,40,0.5)',
              borderRadius: '6px',
              color: '#e8d5a3',
              fontSize: '1.2rem',
              outline: 'none',
            }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '1rem',
            background: saving ? 'rgba(197,160,40,0.3)' : 'linear-gradient(135deg, #c5a028, #f0c040)',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em',
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Saving...' : 'Update Barometer'}
        </button>

        {message && (
          <p style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: message.startsWith('Error') ? '#ff6b6b' : '#6bcb77',
            fontSize: '0.9rem',
          }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: '2rem', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
          <a href="/" style={{ color: '#c5a028', textDecoration: 'none' }}>← View public barometer</a>
        </p>
      </div>
    </div>
  )
}
