import React from 'react'
import { motion } from 'framer-motion'

export default function ResultCard({ results }){
  const { mass, energy, megatons, craterDiameter, blastRadius, willAirburst } = results
  
  const getSeverityLevel = () => {
    if (megatons > 100) return { 
      level: 'CATASTROPHIC', 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      icon: '💀'
    }
    if (megatons > 10) return { 
      level: 'SEVERE', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200',
      icon: '🔥'
    }
    if (megatons > 1) return { 
      level: 'MAJOR', 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200',
      icon: '⚠️'
    }
    return { 
      level: 'MODERATE', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200',
      icon: '🌊'
    }
  }

  const severity = getSeverityLevel()

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      className={`${severity.bg} ${severity.border} border-2 p-4 rounded-lg shadow-lg backdrop-blur-sm relative overflow-hidden`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Severity Badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">Impact Results</h3>
        <motion.div 
          className={`${severity.color} ${severity.bg} px-3 py-1 rounded-full text-xs font-bold border ${severity.border} flex items-center gap-1`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span>{severity.icon}</span>
          {severity.level}
        </motion.div>
      </div>
      
      <motion.ul className="space-y-3 text-sm" variants={containerVariants}>
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50">
          <span className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <strong>Mass:</strong>
          </span>
          <motion.span 
            className="font-mono text-right"
            key={mass}
            animate={{ scale: [1.1, 1], color: ['#f97316', 'inherit'] }}
            transition={{ duration: 0.3 }}
          >
            {mass.toExponential(3)} kg
          </motion.span>
        </motion.li>
        
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50">
          <span className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <strong>Energy:</strong>
          </span>
          <motion.span 
            className="font-mono text-right"
            key={energy}
            animate={{ scale: [1.1, 1], color: ['#3b82f6', 'inherit'] }}
            transition={{ duration: 0.3 }}
          >
            {energy.toExponential(3)} J
          </motion.span>
        </motion.li>
        
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50">
          <span className="flex items-center gap-2">
            <span className="text-lg">💥</span>
            <strong>TNT-equivalent:</strong>
          </span>
          <motion.span 
            className={`font-mono text-right font-bold ${severity.color}`}
            key={megatons}
            animate={{ scale: [1.2, 1] }}
            transition={{ duration: 0.4 }}
          >
            {megatons.toFixed(1)} megatons
          </motion.span>
        </motion.li>
        
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50">
          <span className="flex items-center gap-2">
            <span className="text-lg">🕳️</span>
            <strong>Crater diameter:</strong>
          </span>
          <motion.span 
            className="font-mono text-right"
            key={craterDiameter}
            animate={{ scale: [1.1, 1], color: ['#8b5cf6', 'inherit'] }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(craterDiameter).toLocaleString()} m
          </motion.span>
        </motion.li>
        
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50">
          <span className="flex items-center gap-2">
            <span className="text-lg">🌊</span>
            <strong>Blast radius:</strong>
          </span>
          <motion.span 
            className="font-mono text-right"
            key={blastRadius}
            animate={{ scale: [1.1, 1], color: ['#ef4444', 'inherit'] }}
            transition={{ duration: 0.3 }}
          >
            {Math.round(blastRadius).toLocaleString()} m
          </motion.span>
        </motion.li>
        
        <motion.li variants={itemVariants} className="flex justify-between items-center p-2 rounded bg-white/50 border-t-2 border-gray-200">
          <span className="flex items-center gap-2">
            <span className="text-lg">{willAirburst ? '☁️' : '🎯'}</span>
            <strong>Event type:</strong>
          </span>
          <motion.span 
            className={`text-right font-semibold ${willAirburst ? 'text-blue-600' : 'text-red-600'}`}
            animate={{ scale: [1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {willAirburst ? 'Likely airburst' : 'Ground impact'}
          </motion.span>
        </motion.li>
      </motion.ul>
    </motion.div>
  )
}