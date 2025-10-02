import React from 'react'
import { motion } from 'framer-motion'

export default function ParticleSystem({ isActive, position }) {
  if (!isActive) return null

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * Math.PI / 180,
    distance: 50 + Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 0.3
  }))

  return (
    <div 
      className="absolute z-[1001] pointer-events-none"
      style={{
        left: position?.x || '50%',
        top: position?.y || '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 bg-orange-500 rounded-full"
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 1.5,
            delay: particle.delay,
            ease: "easeOut"
          }}
          style={{
            width: particle.size,
            height: particle.size
          }}
        />
      ))}
    </div>
  )
}