import React from 'react'
import { motion } from 'framer-motion'

export default function Controls({ settings, onChange, onReset }){
  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <motion.label 
        className="block"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-sm font-medium flex items-center gap-2">
          <span>🌑</span>
          Diameter (m)
        </div>
        <input type="range" min="1" max="2000" value={settings.diam}
          onChange={e=>onChange({diam: Number(e.target.value)})}
          className="w-full accent-orange-500 transition-all duration-200" />
        <motion.div 
          className="text-xs text-gray-500 font-mono"
          key={settings.diam}
          animate={{ scale: [1.1, 1], color: ['#f97316', '#6b7280'] }}
          transition={{ duration: 0.3 }}
        >
          {settings.diam.toLocaleString()} m
        </motion.div>
      </motion.label>
      
      <motion.label 
        className="block"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-sm font-medium flex items-center gap-2">
          <span>⚡</span>
          Speed (km/s)
        </div>
        <input type="range" min="1" max="72" value={settings.speed}
          onChange={e=>onChange({speed: Number(e.target.value)})}
          className="w-full accent-blue-500 transition-all duration-200" />
        <motion.div 
          className="text-xs text-gray-500 font-mono"
          key={settings.speed}
          animate={{ scale: [1.1, 1], color: ['#3b82f6', '#6b7280'] }}
          transition={{ duration: 0.3 }}
        >
          {settings.speed} km/s
        </motion.div>
      </motion.label>
      
      <motion.label 
        className="block"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-sm font-medium flex items-center gap-2">
          <span>📐</span>
          Impact angle (°)
        </div>
        <input type="range" min="1" max="89" value={settings.angle}
          onChange={e=>onChange({angle: Number(e.target.value)})}
          className="w-full accent-purple-500 transition-all duration-200" />
        <motion.div 
          className="text-xs text-gray-500 font-mono"
          key={settings.angle}
          animate={{ scale: [1.1, 1], color: ['#8b5cf6', '#6b7280'] }}
          transition={{ duration: 0.3 }}
        >
          {settings.angle}°
        </motion.div>
      </motion.label>
      
      <motion.label 
        className="block"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-sm font-medium flex items-center gap-2">
          <span>🪨</span>
          Material
        </div>
        <select value={settings.density} onChange={e=>onChange({density: Number(e.target.value)})} 
          className="w-full border rounded p-2 bg-white hover:bg-gray-50 transition-colors duration-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
          <option value={3500}>Ordinary Chondrite (3,500 kg/m³)</option>
          <option value={3200}>Carbonaceous Chondrite (3,200 kg/m³)</option>
          <option value={7800}>Iron Meteorite (7,800 kg/m³)</option>
          <option value={5200}>Stony-Iron (5,200 kg/m³)</option>
          <option value={2700}>Achondrite (2,700 kg/m³)</option>
        </select>
      </motion.label>

      {/* Reset Button */}
      <motion.button
        onClick={onReset}
        className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span>🔄</span>
        Reset to Defaults
      </motion.button>
    </motion.div>
  )
}