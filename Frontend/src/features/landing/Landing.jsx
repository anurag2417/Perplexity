import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import gsap from 'gsap'

const MotionDiv = motion.div
const MotionArticle = motion.article

const features = [
  ['01', 'Answers with depth', 'Go beyond links with focused answers that explain the why, not just the what.'],
  ['02', 'Always in context', 'Keep every idea, source, and follow-up together in one beautifully organized thread.'],
  ['03', 'Made for momentum', 'From first question to final decision, move from curiosity to clarity faster.'],
]

const Landing = () => {
  const canvasRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 4.5
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    resize()
    const geometry = new THREE.IcosahedronGeometry(1.35, 2)
    const material = new THREE.MeshBasicMaterial({ color: 0x7de3c0, wireframe: true, transparent: true, opacity: .25 })
    const orb = new THREE.Mesh(geometry, material)
    orb.position.set(1.45, .35, 0)
    scene.add(orb)
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(420)
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (Math.random() - .5) * 8
      positions[index + 1] = (Math.random() - .5) * 5
      positions[index + 2] = (Math.random() - .5) * 3
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const dots = new THREE.Points(particles, new THREE.PointsMaterial({ color: 0xa5f1d8, size: .012, transparent: true, opacity: .55 }))
    scene.add(dots)
    let frame
    const animate = () => {
      orb.rotation.x += .0018
      orb.rotation.y += .003
      dots.rotation.y -= .0002
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); geometry.dispose(); material.dispose(); renderer.dispose() }
  }, [])

  useEffect(() => {
    const button = ctaRef.current
    const enter = () => gsap.to(button, { scale: 1.04, duration: .25, ease: 'power2.out' })
    const leave = () => gsap.to(button, { scale: 1, duration: .25, ease: 'power2.out' })
    button.addEventListener('mouseenter', enter)
    button.addEventListener('mouseleave', leave)
    return () => { button.removeEventListener('mouseenter', enter); button.removeEventListener('mouseleave', leave) }
  }, [])

  return (
    <main className="landing-page">
      <canvas className="hero-canvas" ref={canvasRef} />
      <nav className="landing-nav"><Link className="landing-brand" to="/"><span>✦</span> Perplexity</Link><div className="landing-links"><a href="#why">Why Perplexity</a><a href="#features">Features</a><Link to="/login">Sign in</Link><Link className="nav-cta" to="/register">Get started <span>↗</span></Link></div></nav>
      <section className="hero-section">
        <MotionDiv className="hero-copy" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
          <p className="landing-eyebrow"><span /> The answer engine for curious minds</p>
          <h1>Turn questions into<br /><i>clarity.</i></h1>
          <p className="hero-subtitle">A smarter way to search, learn, and decide. Ask anything and get a clear answer you can actually use.</p>
          <div className="hero-actions"><Link ref={ctaRef} className="primary-cta" to="/register">Start exploring <span>↗</span></Link><a className="text-cta" href="#why">See how it works <span>↓</span></a></div>
          <p className="hero-note">Free to start · No credit card required</p>
        </MotionDiv>
        <MotionDiv className="hero-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: 1 }}>
          <div className="card-glow" /><div className="mini-label">TODAY&apos;S EXPLORATION <span>•••</span></div><p className="question">How do the best ideas<br />come to life?</p><div className="answer-line wide" /><div className="answer-line" /><div className="answer-line short" /><div className="source-row"><span className="source-dot" /> Research synthesis <span className="source-time">2 min read</span></div>
        </MotionDiv>
      </section>
      <section className="proof-strip"><span>BUILT FOR THE WAY YOU THINK</span><div><b>Explore</b><b>Understand</b><b>Imagine</b><b>Decide</b></div></section>
      <section className="feature-section" id="why"><p className="landing-eyebrow">A better starting point</p><h2>Less searching.<br /><i>More discovering.</i></h2><p className="section-lede">Perplexity brings the best of the web and the power of AI together, so every question can take you somewhere meaningful.</p><div className="feature-grid" id="features">{features.map(([number, title, copy]) => <MotionArticle className="feature" key={number} whileHover={{ y: -7 }}><span className="feature-number">{number}</span><h3>{title}</h3><p>{copy}</p><span className="feature-arrow">↗</span></MotionArticle>)}</div></section>
      <section className="landing-bottom"><p>Ready to find a better answer?</p><Link className="primary-cta" to="/register">Ask your first question <span>↗</span></Link></section>
      <footer className="landing-footer"><span>✦ Perplexity</span><span>© 2026 · Think deeper.</span></footer>
    </main>
  )
}

export default Landing
