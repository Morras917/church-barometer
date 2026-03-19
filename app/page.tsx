'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const GOAL = 500000
const CURRENCY = 'R'

function formatCurrency(amount: number) {
  return CURRENCY + new Intl.NumberFormat('en-ZA').format(Math.round(amount))
}

// 10% increments: 10, 20, 30, ... 100
const MILESTONES = Array.from({ length: 10 }, (_, i) => {
  const pct = (i + 1) * 10
  const color =
    pct === 100 ? '#c5a028' :
    pct >= 80   ? '#e07b00' :
    pct >= 50   ? '#f0a500' :
                  '#4a9eff'
  return { pct, label: pct === 100 ? 'GOAL!' : `${pct}%`, color }
})

const TUBE_HEIGHT = 420

export default function Home() {
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('church_barometer')
      .select('amount_raised')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) setAmount(data.amount_raised)
        setLoading(false)
      })

    const channel = supabase
      .channel('barometer')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'church_barometer',
      }, (payload) => {
        setAmount(payload.new.amount_raised)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const pct = Math.min((amount / GOAL) * 100, 100)
  const fillColor =
    pct >= 100 ? '#c5a028' :
    pct >= 80  ? '#e07b00' :
    pct >= 50  ? '#f0a500' :
    pct >= 20  ? '#4a9eff' :
                 '#2d6aad'

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '1.5rem', color: '#e8d5a3',
        background: 'rgba(0,0,0,0.85)'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      backgroundImage: 'url(/church.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Dark overlay so text stays readable */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0, 0, 0, 0.62)',
        backdropFilter: 'blur(1px)',
        zIndex: 0,
      }} />

      {/* All content above the overlay */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 3rem)',
          fontWeight: 700,
          color: '#c5a028',
          marginBottom: '0.5rem',
          textAlign: 'center',
          letterSpacing: '0.1em',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        }}>
          Church Fundraising Drive
        </h1>
        <p style={{ color: '#e8d5a3', marginBottom: '2.5rem', fontSize: '1rem', letterSpacing: '0.05em', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          Goal: {formatCurrency(GOAL)}
        </p>

        {/* Barometer */}
        <div style={{ position: 'relative', width: '180px', height: `${TUBE_HEIGHT + 90}px`, margin: '0 auto 2.5rem' }}>

          {/* Milestone ticks - 10% increments */}
          {MILESTONES.map(m => {
            const bottomPx = (m.pct / 100) * TUBE_HEIGHT + 35
            const reached = pct >= m.pct
            return (
              <div key={m.pct} style={{
                position: 'absolute',
                bottom: `${bottomPx}px`,
                left: 'calc(50% + 43px)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
              }}>
                <div style={{
                  width: m.pct % 50 === 0 || m.pct === 100 ? '18px' : '10px',
                  height: '2px',
                  background: reached ? m.color : 'rgba(255,255,255,0.3)',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: m.pct % 50 === 0 || m.pct === 100 ? '0.75rem' : '0.6rem',
                  color: reached ? m.color : 'rgba(255,255,255,0.4)',
                  fontWeight: m.pct % 50 === 0 || m.pct === 100 ? 700 : 400,
                }}>
                  {m.label}
                </span>
              </div>
            )
          })}

          {/* Glass tube */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: `${TUBE_HEIGHT}px`,
            border: '3px solid #c5a028',
            borderRadius: '40px 40px 0 0',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6), 0 0 25px rgba(197,160,40,0.3)',
          }}>
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: pct + '%',
              background: `linear-gradient(to top, ${fillColor}, ${fillColor}cc)`,
              transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s',
              boxShadow: `0 0 15px ${fillColor}80`,
            }} />
          </div>

          {/* Bulb */}
          <div style={{
            position: 'absolute',
            top: `${TUBE_HEIGHT - 10}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '3px solid #c5a028',
            background: pct > 0 ? fillColor : 'rgba(255,255,255,0.07)',
            transition: 'background 0.5s',
            boxShadow: `0 0 25px ${pct > 0 ? fillColor + '90' : 'transparent'}`,
          }} />
        </div>

        {/* Amount display */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(0,0,0,0.45)',
          borderRadius: '12px',
          padding: '1rem 2rem',
          border: '1px solid rgba(197,160,40,0.3)',
        }}>
          <div style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: 700,
            color: fillColor,
            transition: 'color 0.5s',
            textShadow: `0 0 30px ${fillColor}60`,
            letterSpacing: '0.02em',
          }}>
            {formatCurrency(amount)}
          </div>
          <div style={{ color: '#d4c090', fontSize: '1rem', marginTop: '0.5rem' }}>
            raised of {formatCurrency(GOAL)} goal
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '1.5rem', fontWeight: 600, color: '#e8d5a3' }}>
            {pct.toFixed(1)}%
          </div>
        </div>

        {pct >= 100 && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 2rem',
            background: 'linear-gradient(135deg, #c5a028, #f0c040)',
            color: '#1a1a1a',
            borderRadius: '8px',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            boxShadow: '0 0 30px rgba(197, 160, 40, 0.7)',
          }}>
            🙏 GOAL REACHED! PRAISE GOD! 🙏
          </div>
        )}
      </div>
    </div>
  )
}
