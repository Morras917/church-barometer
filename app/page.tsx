'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const GOAL = 500000
const CURRENCY = 'R'
const BULB_MAX = 50000
const TUBE_HEIGHT = 400
const BULB_SIZE = 80
const TUBE_BOTTOM_PX = BULB_SIZE / 2 + 3

function formatCurrency(amount: number) {
  return CURRENCY + new Intl.NumberFormat('en-ZA').format(Math.round(amount))
}

const MILESTONES = Array.from({ length: 10 }, (_, i) => {
  const val = (i + 1) * 50000
  const color =
    val === 500000 ? '#c5a028' :
    val >= 400000  ? '#e07b00' :
    val >= 250000  ? '#f0a500' :
                     '#4a9eff'
  return { val, label: formatCurrency(val), color }
})

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    type Piece = { x:number;y:number;r:number;d:number;color:string;tilt:number;tiltAngle:number;tiltAngleIncrement:number }
    const pieces: Piece[] = []
    const colors = ['#c5a028','#f0c040','#4a9eff','#ff6b6b','#51cf66','#cc5de8','#ff922b','#fff']
    for (let i = 0; i < 200; i++) {
      pieces.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height, r:Math.random()*8+4, d:Math.random()*200+100, color:colors[Math.floor(Math.random()*colors.length)], tilt:Math.floor(Math.random()*10)-10, tiltAngle:0, tiltAngleIncrement:Math.random()*0.07+0.05 })
    }
    let angle = 0; let frame: number
    function draw() {
      if (!ctx||!canvas) return
      ctx.clearRect(0,0,canvas.width,canvas.height); angle+=0.01
      pieces.forEach((p,i) => {
        p.tiltAngle+=p.tiltAngleIncrement; p.y+=(Math.cos(angle+p.d)+2+p.r/10); p.x+=Math.sin(angle)*1.5; p.tilt=Math.sin(p.tiltAngle)*12
        if(p.y>canvas.height) pieces[i]={...p,x:Math.random()*canvas.width,y:-20}
        ctx.beginPath(); ctx.lineWidth=p.r/2; ctx.strokeStyle=p.color
        ctx.moveTo(p.x+p.tilt+p.r/4,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/4); ctx.stroke()
      })
      frame=requestAnimationFrame(draw)
    }
    draw(); return ()=>cancelAnimationFrame(frame)
  },[])
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:999}}/>
}

export default function Home() {
  const [amount,setAmount]=useState(0)
  const [loading,setLoading]=useState(true)
  const [showConfetti,setShowConfetti]=useState(false)
  const prevAmount=useRef(0)

  useEffect(()=>{
    supabase.from('church_barometer').select('amount_raised').eq('id',1).single()
      .then(({data})=>{
        if(data){setAmount(data.amount_raised);prevAmount.current=data.amount_raised;if(data.amount_raised>=GOAL)setShowConfetti(true)}
        setLoading(false)
      })
    const channel=supabase.channel('barometer')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'church_barometer'},(payload)=>{
        const n=payload.new.amount_raised; setAmount(n)
        if(n>=GOAL&&prevAmount.current<GOAL){setShowConfetti(true);setTimeout(()=>setShowConfetti(false),12000)}
        prevAmount.current=n
      }).subscribe()
    return ()=>{supabase.removeChannel(channel)}
  },[])

  const tubePct = amount<=BULB_MAX ? 0 : Math.min(((amount-BULB_MAX)/(GOAL-BULB_MAX))*100,100)
  const bulbPct = Math.min(amount/BULB_MAX,1)
  const cappedPct = Math.min((amount/GOAL)*100,100)
  const overGoal = amount>GOAL
  const excess = overGoal ? amount-GOAL : 0
  const fillColor = cappedPct>=100?'#c5a028':cappedPct>=80?'#e07b00':cappedPct>=50?'#f0a500':cappedPct>=20?'#4a9eff':'#2d6aad'
  const overColor = '#cc5de8'

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.5rem',color:'#e8d5a3',background:'rgba(0,0,0,0.85)'}}>Loading...</div>

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',position:'relative',backgroundImage:'url(/church.jpg)',backgroundSize:'cover',backgroundPosition:'center',backgroundRepeat:'no-repeat'}}>
      {showConfetti&&<Confetti/>}
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(1px)',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
        <h1 style={{fontSize:'clamp(1.3rem,3.5vw,2.6rem)',fontWeight:700,color:'#c5a028',marginBottom:'0.2rem',textAlign:'center',letterSpacing:'0.08em',textShadow:'0 2px 8px rgba(0,0,0,0.9)',lineHeight:1.2}}>St Peter Church</h1>
        <h2 style={{fontSize:'clamp(1rem,2.5vw,1.8rem)',fontWeight:600,color:'#e8d5a3',marginBottom:'0.4rem',textAlign:'center',letterSpacing:'0.12em',textShadow:'0 2px 8px rgba(0,0,0,0.9)'}}>Organ Fund</h2>
        <p style={{color:'#b0a080',marginBottom:'2rem',fontSize:'0.9rem',letterSpacing:'0.05em',textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>Goal: {formatCurrency(GOAL)}</p>

        <div style={{position:'relative',width:'220px',height:`${TUBE_BOTTOM_PX+TUBE_HEIGHT+20}px`,margin:'0 auto 2rem'}}>

          {MILESTONES.map(m=>{
            // R50k at the very bottom of the tube (= top of bulb join)
            // R100k to R500k evenly across TUBE_HEIGHT above that
            const bottomPx = m.val===50000
              ? TUBE_BOTTOM_PX
              : TUBE_BOTTOM_PX + ((m.val - BULB_MAX) / (GOAL - BULB_MAX)) * TUBE_HEIGHT
            const reached = amount >= m.val
            return (
              <div key={m.val} style={{position:'absolute',bottom:`${bottomPx}px`,left:'calc(50% + 43px)',display:'flex',alignItems:'center',gap:'6px',whiteSpace:'nowrap',transform:'translateY(50%)'}}>
                <div style={{width:'14px',height:'2px',background:reached?m.color:'rgba(255,255,255,0.3)',flexShrink:0}}/>
                <span style={{fontSize:'0.68rem',color:reached?m.color:'rgba(255,255,255,0.38)',fontWeight:500}}>{m.label}</span>
              </div>
            )
          })}

          <div style={{position:'absolute',bottom:`${TUBE_BOTTOM_PX}px`,left:'50%',transform:'translateX(-50%)',width:'80px',height:`${TUBE_HEIGHT}px`,border:'3px solid #c5a028',borderRadius:'40px 40px 0 0',overflow:'hidden',background:'rgba(255,255,255,0.07)',boxShadow:'inset 0 0 20px rgba(0,0,0,0.6),0 0 25px rgba(197,160,40,0.3)'}}>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:tubePct+'%',background:`linear-gradient(to top,${fillColor},${fillColor}cc)`,transition:'height 1.5s cubic-bezier(0.4,0,0.2,1),background 0.5s',boxShadow:`0 0 15px ${fillColor}80`}}/>
          </div>

          <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:`${BULB_SIZE}px`,height:`${BULB_SIZE}px`,borderRadius:'50%',border:'3px solid #c5a028',overflow:'hidden',background:'rgba(255,255,255,0.05)',boxShadow:amount>0?`0 0 25px ${fillColor}90`:'none'}}>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:`${bulbPct*100}%`,background:fillColor,transition:'height 1.5s cubic-bezier(0.4,0,0.2,1),background 0.5s'}}/>
          </div>
        </div>

        <div style={{textAlign:'center',background:'rgba(0,0,0,0.5)',borderRadius:'14px',padding:'1rem 2.5rem',border:`1px solid ${overGoal?overColor+'80':'rgba(197,160,40,0.3)'}`,boxShadow:overGoal?`0 0 20px ${overColor}40`:'none',transition:'border 0.5s,box-shadow 0.5s'}}>
          <div style={{fontSize:'clamp(1.8rem,5vw,3.5rem)',fontWeight:700,color:fillColor,textShadow:`0 0 30px ${fillColor}60`,letterSpacing:'0.02em',lineHeight:1}}>{formatCurrency(Math.min(amount,GOAL))}</div>
          {overGoal&&<div style={{fontSize:'clamp(1rem,3vw,1.8rem)',fontWeight:700,color:overColor,textShadow:`0 0 20px ${overColor}80`,marginTop:'0.2rem',letterSpacing:'0.02em',animation:'pulse 1.5s ease-in-out infinite'}}>+ {formatCurrency(excess)} over goal! 🎉</div>}
          <div style={{color:'#d4c090',fontSize:'0.9rem',marginTop:'0.5rem'}}>raised of {formatCurrency(GOAL)} goal</div>
          <div style={{marginTop:'0.5rem',fontSize:'1.3rem',fontWeight:600,color:'#e8d5a3'}}>{((amount/GOAL)*100).toFixed(1)}%</div>
        </div>

        {amount>=GOAL&&(
          <div style={{marginTop:'1.5rem',padding:'1rem 2rem',background:'linear-gradient(135deg,#c5a028,#f0c040,#c5a028)',backgroundSize:'200% 200%',color:'#1a1a1a',borderRadius:'12px',fontSize:'clamp(1rem,2.5vw,1.5rem)',fontWeight:800,letterSpacing:'0.08em',textAlign:'center',boxShadow:'0 0 40px rgba(197,160,40,0.8),0 0 80px rgba(197,160,40,0.3)',animation:'shimmer 2s linear infinite'}}>
            🙏 GOAL REACHED! PRAISE GOD! 🙏<br/><span style={{fontSize:'0.8em',letterSpacing:'0.15em'}}>THE ORGAN FUND IS COMPLETE</span>
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.85;transform:scale(1.03)}}`}</style>
    </div>
  )
}
