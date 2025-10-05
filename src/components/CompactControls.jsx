import React from 'react'
import { motion } from 'framer-motion'

export default function CompactControls({ settings, onChange, onReset }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 }
  }

  const ControlSlider = ({ icon, label, min, max, value, onChange, unit, color = "#3b82f6" }) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="group relative"
    >
      <div className="bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm rounded-lg p-2 border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-200">
        <div className="text-xs font-medium flex items-center gap-1 mb-1">
          <span className="text-sm">{icon}</span>
          <span className="text-gray-700">{label}</span>
        </div>
        
        <div className="relative mb-1">
          <input 
            type="range" 
            min={min} 
            max={max} 
            value={value}
            onChange={onChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all duration-200"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{min}</span>
          <motion.span 
            className="font-mono font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent"
            key={value}
            animate={{ scale: [1.05, 1] }}
            transition={{ duration: 0.2 }}
          >
            {value.toLocaleString()}{unit}
          </motion.span>
          <span className="text-xs text-gray-400">{max}</span>
        </div>
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {/* Compact Header */}
      <motion.div 
        variants={itemVariants}
        className="text-center mb-3"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-purple-200/50">
          <h3 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ⚙️ Impact Parameters
          </h3>
        </div>
      </motion.div>

      <ControlSlider
        icon="🌑"
        label="Diameter"
        min="1"
        max="2000"
        value={settings.diam}
        onChange={e => onChange({ diam: Number(e.target.value) })}
        unit=" m"
        color="#f97316"
      />
      
      <ControlSlider
        icon="⚡"
        label="Speed"
        min="1"
        max="72"
        value={settings.speed}
        onChange={e => onChange({ speed: Number(e.target.value) })}
        unit=" km/s"
        color="#3b82f6"
      />
      
      <ControlSlider
        icon="📐"
        label="Angle"
        min="1"
        max="89"
        value={settings.angle}
        onChange={e => onChange({ angle: Number(e.target.value) })}
        unit="°"
        color="#8b5cf6"
      />

      {/* Compact Material Selector */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="group"
      >
        <div className="bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm rounded-lg p-2 border border-white/50 shadow-sm group-hover:shadow-md transition-all duration-200">
          <div className="text-xs font-medium flex items-center gap-1 mb-1">
            <span className="text-sm">🪨</span>
            <span className="text-gray-700">Material</span>
          </div>
          
          <select 
            value={settings.density}
            onChange={e => onChange({ density: Number(e.target.value) })}
            className="w-full text-xs p-1 bg-white/90 border border-indigo-200/50 rounded 
                     focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all duration-200
                     text-gray-800 cursor-pointer"
          >
                        <option value={3500}>🗿 Chondrite (3,500)</option>
            <option value={3200}>⚫ Carbon (3,200)</option>
            <option value={7800}>⚙️ Iron (7,800)</option>
            <option value={5200}>🔩 Mixed (5,200)</option>
            <option value={2700}>🌋 Rocky (2,700)</option>
          </select>
        </div>
      </motion.div>

      {/* Compact Reset Button */}
      <motion.button
        variants={itemVariants}
        onClick={onReset}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 
                   text-white font-medium py-2 px-3 rounded-lg shadow-sm transition-all duration-200
                   border border-gray-300/50 backdrop-blur-sm text-xs flex items-center justify-center gap-1"
      >
        <span>🔄</span>
        Reset Defaults
      </motion.button>
    </motion.div>
  )
}