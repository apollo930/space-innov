import React from 'react'
import { motion } from 'framer-motion'

export default function EnhancedControls({ settings, onChange, onReset }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: { opacity: 1, x: 0, scale: 1 }
  }

  const ControlSlider = ({ icon, label, min, max, value, onChange, unit, color = "blue" }) => (
    <motion.div 
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="group relative"
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-lg blur-md opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
        <div className="text-sm font-semibold flex items-center gap-2 mb-3">
          <motion.span 
            className="text-lg"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            {icon}
          </motion.span>
          <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            {label}
          </span>
        </div>
        
        {/* Custom styled range input */}
        <div className="relative mb-2">
          <input 
            type="range" 
            min={min} 
            max={max} 
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
        
        {/* Animated value display */}
        <motion.div 
          className="flex justify-between items-center"
          key={value}
          animate={{ scale: [1.05, 1], opacity: [0.7, 1] }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs text-gray-500">{min}{unit}</span>
          <motion.span 
            className="font-mono font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent"
            animate={{ scale: [1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            {value.toLocaleString()}{unit}
          </motion.span>
          <span className="text-xs text-gray-500">{max}{unit}</span>
        </motion.div>
        
        {/* Interactive hover line */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 origin-left"
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="text-center mb-6"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200/50">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ⚙️ Impact Parameters
            </h3>
            <p className="text-sm text-gray-600">Fine-tune your asteroid's destructive power</p>
          </div>
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
        label="Impact Angle"
        min="1"
        max="89"
        value={settings.angle}
        onChange={e => onChange({ angle: Number(e.target.value) })}
        unit="°"
        color="#8b5cf6"
      />

      {/* Material Type Selector */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="group relative"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-violet-600/10 rounded-lg blur-md opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />
        
        <div className="relative bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
          <div className="text-sm font-semibold flex items-center gap-2 mb-3">
            <motion.span 
              className="text-lg"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              🪨
            </motion.span>
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Material Type
            </span>
          </div>
          
          <select 
            value={settings.density}
            onChange={e => onChange({ density: Number(e.target.value) })}
            className="w-full p-2 bg-gradient-to-r from-white/90 to-white/80 backdrop-blur-sm border border-indigo-200/50 rounded-lg 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200
                     text-gray-800 font-medium cursor-pointer hover:shadow-md"
          >
            <option value={3500}>🗿 Ordinary Chondrite (3,500 kg/m³)</option>
            <option value={3200}>⚫ Carbonaceous Chondrite (3,200 kg/m³)</option>
            <option value={7800}>⚙️ Iron Meteorite (7,800 kg/m³)</option>
            <option value={5200}>🔩 Stony-Iron (5,200 kg/m³)</option>
            <option value={2700}>🌋 Achondrite (2,700 kg/m³)</option>
          </select>
          
          {/* Interactive hover line */}
          <motion.div
            className="h-0.5 bg-gradient-to-r from-indigo-400 to-violet-600 rounded-full mt-2 scale-x-0 group-hover:scale-x-100 origin-left"
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Reset Button */}
      <motion.button
        variants={itemVariants}
        onClick={onReset}
        whileHover={{ scale: 1.05, rotateZ: 2 }}
        whileTap={{ scale: 0.95 }}
        className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 
                   text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300
                   border border-gray-400/50 backdrop-blur-sm relative overflow-hidden group"
      >
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        <span className="relative z-10 flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🔄
          </motion.span>
          Reset to Defaults
        </span>
      </motion.button>
    </motion.div>
  )
}