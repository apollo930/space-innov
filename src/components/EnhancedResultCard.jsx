import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResultCard({ results }) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🌍' },
    { id: 'crater', label: 'Crater', icon: '🕳️' },
    { id: 'fireball', label: 'Fireball', icon: '🔥' },
    { id: 'shockwave', label: 'Shock Wave', icon: '💨' },
    { id: 'wind', label: 'Wind', icon: '🌪️' },
    { id: 'earthquake', label: 'Earthquake', icon: '🪨' },
    { id: 'tsunami', label: 'Tsunami', icon: '🌊' },
    { id: 'deflection', label: 'Deflection', icon: '🛡️' }
  ]

  const StatRow = ({ label, value, unit, severity, icon }) => {
    const getSeverityColor = () => {
      if (severity === 'extreme') return 'from-red-600 to-red-800'
      if (severity === 'high') return 'from-orange-500 to-red-600'
      if (severity === 'medium') return 'from-yellow-500 to-orange-600'
      return 'from-green-500 to-blue-600'
    }

    return (
      <motion.div 
        className="group relative"
        whileHover={{ scale: 1.02, z: 10 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-lg blur-sm transition-opacity duration-300"
          style={{ backgroundImage: `linear-gradient(to right, ${getSeverityColor().split(' ').join(', ')})` }}
        />
        
        <div className="relative bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-lg p-4 
                        border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300
                        transform hover:-translate-y-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors flex items-center gap-2">
              {icon && <span className="text-lg">{icon}</span>}
              {label}
            </span>
            <motion.div 
              className="text-right"
              whileHover={{ scale: 1.1 }}
            >
              <span className={`text-xl font-bold bg-gradient-to-r ${getSeverityColor()} bg-clip-text text-transparent`}>
                {value}
              </span>
              {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
            </motion.div>
          </div>
          
          {/* Severity indicator bar */}
          <motion.div 
            className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div 
              className={`h-full bg-gradient-to-r ${getSeverityColor()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ 
                width: severity === 'extreme' ? '100%' : 
                       severity === 'high' ? '75%' : 
                       severity === 'medium' ? '50%' : '25%'
              }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            />
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-orange-200/50">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2">
                  💥 Impact Summary
                </h3>
                <motion.p 
                  className="text-gray-600"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Analyzing catastrophic asteroid impact effects...
                </motion.p>
              </div>
            </motion.div>
            
            <StatRow 
              icon="🎯"
              label="Impact Location" 
              value={`${results.lat.toFixed(4)}°, ${results.lng.toFixed(4)}°`} 
              severity="medium"
            />
            <StatRow 
              icon="🪨"
              label="Asteroid Diameter" 
              value={results.diam || 'N/A'} 
              unit="m" 
              severity="high"
            />
            <StatRow 
              icon="🚀"
              label="Impact Speed" 
              value={results.impactSpeed ? Math.round(results.impactSpeed).toLocaleString() : 'N/A'} 
              unit="mph" 
              severity="extreme"
            />
            <StatRow 
              icon="📐"
              label="Impact Angle" 
              value={results.deflectionImpactAngle || 'N/A'} 
              unit="°" 
              severity="medium"
            />
            <StatRow 
              icon="⚡"
              label="Total Impact Energy" 
              value={results.energy ? results.energy.toExponential(2) : 'N/A'} 
              unit="J" 
              severity="extreme"
            />
            <StatRow 
              icon="👥"
              label="Population at Risk" 
              value={results.populationDensity ? results.populationDensity.toLocaleString() : 'N/A'} 
              unit="people/km²"
              severity={results.populationDensity > 1000 ? 'extreme' : results.populationDensity > 100 ? 'high' : 'medium'}
            />
          </div>
        )
      
      case 'crater':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  🕳️ Crater Formation
                </h3>
                
                {/* Visual crater representation */}
                <motion.div 
                  className="relative w-32 h-16 mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-200 to-orange-400 rounded-full" />
                  <div className="absolute top-2 left-4 right-4 bottom-8 bg-gradient-to-b from-amber-400 to-orange-600 rounded-full" />
                  <div className="absolute top-4 left-8 right-8 bottom-12 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
                  <motion.div 
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="📏"
              label="Crater Diameter" 
              value={results.craterDiameter ? results.craterDiameter.toFixed(1) : 'N/A'} 
              unit="m" 
              severity={results.craterDiameter > 1000 ? 'extreme' : results.craterDiameter > 500 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="🕳️"
              label="Crater Depth" 
              value={results.craterDepth ? results.craterDepth.toFixed(1) : 'N/A'} 
              unit="m" 
              severity={results.craterDepth > 200 ? 'extreme' : results.craterDepth > 100 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="🪣"
              label="Crater Shape" 
              value={results.craterShape || 'Circular'} 
              severity="medium"
            />
            <StatRow 
              icon="🪨"
              label="People Vaporized" 
              value={results.craterVaporized ? results.craterVaporized.toLocaleString() : '0'} 
              severity="extreme"
            />
          </div>
        )

      case 'fireball':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-red-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                  🔥 Atmospheric Fireball
                </h3>
                
                {/* Animated fireball visualization */}
                <motion.div 
                  className="relative w-24 h-24 mx-auto mb-4"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.5, duration: 2 }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, #ffff00 0%, #ff6600 30%, #ff0000 60%, #800000 100%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 20px #ff6600',
                        '0 0 40px #ff0000',
                        '0 0 20px #ff6600'
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  
                  {/* Flame particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 20],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 20],
                        opacity: [1, 0],
                        scale: [1, 0]
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="💡"
              label="Fireball Radius" 
              value={results.fireballRadius ? (results.fireballRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity="extreme"
            />
            <StatRow 
              icon="💀"
              label="Fireball Deaths" 
              value={results.fireballDeaths ? results.fireballDeaths.toLocaleString() : '0'} 
              severity="extreme"
            />
            <StatRow 
              icon="�"
              label="3rd Degree Burns" 
              value={results.burns3rdDegree ? results.burns3rdDegree.toLocaleString() : '0'} 
              severity="high"
            />
            <StatRow 
              icon="🌳"
              label="Tree Fires Range" 
              value={results.treeFires ? (results.treeFires / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity="high"
            />
          </div>
        )

      case 'shockwave':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  💨 Shock Wave Propagation
                </h3>
                
                {/* Animated shock wave rings */}
                <motion.div 
                  className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute border-2 border-purple-400 rounded-full"
                      style={{
                        width: `${20 + i * 20}px`,
                        height: `${20 + i * 20}px`
                      }}
                      animate={{
                        scale: [1, 2],
                        opacity: [0.8, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    />
                  ))}
                  <div className="w-4 h-4 bg-purple-600 rounded-full z-10" />
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="📊"
              label="Peak Decibels" 
              value={results.shockWaveDecibels ? results.shockWaveDecibels.toFixed(0) : 'N/A'} 
              unit="dB" 
              severity={results.shockWaveDecibels > 180 ? 'extreme' : results.shockWaveDecibels > 140 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="📏"
              label="Building Collapse Range" 
              value={results.buildingCollapseRadius ? (results.buildingCollapseRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity="extreme"
            />
            <StatRow 
              icon="💀"
              label="Shock Wave Deaths" 
              value={results.shockWaveDeaths ? results.shockWaveDeaths.toLocaleString() : '0'} 
              severity="extreme"
            />
            <StatRow 
              icon="🏠"
              label="Home Collapse Range" 
              value={results.homeCollapseRadius ? (results.homeCollapseRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity="high"
            />
          </div>
        )

      case 'wind':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  🌪️ Wind Effects
                </h3>
                
                {/* Animated wind streams */}
                <motion.div 
                  className="relative w-40 h-16 mx-auto mb-4 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-0.5 bg-green-400 rounded-full"
                      style={{
                        width: `${20 + Math.random() * 30}px`,
                        top: `${10 + i * 8}px`,
                        left: '0px'
                      }}
                      animate={{
                        x: ['-20px', '160px'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="💨"
              label="Maximum Wind Speed" 
              value={results.windSpeed ? results.windSpeed.toFixed(0) : 'N/A'} 
              unit="mph" 
              severity={results.windSpeed > 200 ? 'extreme' : results.windSpeed > 100 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="📏"
              label="Leveled Buildings Range" 
              value={results.leveledRadius ? (results.leveledRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity="extreme"
            />
            <StatRow 
              icon="💀"
              label="Wind Deaths" 
              value={results.windDeaths ? results.windDeaths.toLocaleString() : '0'} 
              severity="extreme"
            />
            <StatRow 
              icon="🌳"
              label="Trees Knocked Down" 
              value={results.treeKnockRadius ? (results.treeKnockRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km radius" 
              severity="high"
            />
          </div>
        )

      case 'earthquake':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-red-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-yellow-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-4">
                  🪨 Seismic Activity
                </h3>
                
                {/* Animated seismic waves */}
                <motion.div 
                  className="relative w-40 h-12 mx-auto mb-4 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bottom-0 w-1 bg-red-500"
                      style={{
                        left: `${i * 12.5}%`,
                        height: '20%'
                      }}
                      animate={{
                        height: ['20%', '80%', '20%'],
                        backgroundColor: ['#ef4444', '#f97316', '#ef4444']
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="📊"
              label="Magnitude" 
              value={results.earthquakeMagnitude ? results.earthquakeMagnitude.toFixed(1) : 'N/A'} 
              severity={results.earthquakeMagnitude > 7 ? 'extreme' : results.earthquakeMagnitude > 5 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="📏"
              label="Felt Range" 
              value={results.earthquakeRadius ? (results.earthquakeRadius / 1000).toFixed(1) : 'N/A'} 
              unit="km" 
              severity={results.earthquakeRadius > 500000 ? 'extreme' : results.earthquakeRadius > 200000 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="💀"
              label="Earthquake Deaths" 
              value={results.earthquakeDeaths ? results.earthquakeDeaths.toLocaleString() : '0'} 
              severity="high"
            />
            <StatRow 
              icon="🏢"
              label="Impact Type" 
              value={results.isOceanImpact ? 'Ocean Impact' : 'Land Impact'} 
              severity={results.isOceanImpact ? 'medium' : 'high'}
            />
          </div>
        )

      case 'tsunami':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                  🌊 Tsunami Generation
                </h3>
                
                {/* Animated tsunami waves */}
                <motion.div 
                  className="relative w-40 h-16 mx-auto mb-4 overflow-hidden rounded-lg bg-gradient-to-b from-blue-200 to-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Wave layers */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-400 to-blue-300"
                      style={{
                        height: `${30 - i * 8}%`,
                        opacity: 0.7 - i * 0.2
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2 - i * 0.3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.2
                      }}
                    />
                  ))}
                  
                  {/* Wave crests */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`crest-${i}`}
                      className="absolute bottom-4 w-8 h-4 bg-white/60 rounded-full"
                      style={{
                        left: `${i * 25}%`
                      }}
                      animate={{
                        y: [0, -4, 0],
                        scaleY: [1, 1.5, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="📏"
              label="Wave Height" 
              value={results.tsunamiHeight ? results.tsunamiHeight.toFixed(1) : 'N/A'} 
              unit="m" 
              severity={results.tsunamiHeight > 20 ? 'extreme' : results.tsunamiHeight > 10 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="💀"
              label="Tsunami Deaths" 
              value={results.tsunamiDeaths ? results.tsunamiDeaths.toLocaleString() : '0'} 
              severity="extreme"
            />
            <StatRow 
              icon="🏖️"
              label="Countries Affected" 
              value={results.tsunamiAffectedCoasts ? results.tsunamiAffectedCoasts.toString() : '0'} 
              severity="high"
            />
            <StatRow 
              icon="🌊"
              label="Ocean Impact" 
              value={results.isOceanImpact ? 'Yes' : 'No'} 
              severity={results.isOceanImpact ? 'extreme' : 'low'}
            />
          </div>
        )

      case 'deflection':
        return (
          <div className="space-y-4">
            <motion.div
              className="text-center mb-6 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-xl" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  🛡️ Planetary Defense Analysis
                </h3>
                
                {/* Animated deflection visualization */}
                <motion.div 
                  className="relative w-40 h-20 mx-auto mb-4 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Original trajectory */}
                  <motion.div className="flex items-center">
                    <motion.div 
                      className="w-4 h-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg"
                      animate={{ x: [0, 50, 100] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div 
                      className="ml-2 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-transparent"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  {/* Earth */}
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-500 rounded-full shadow-lg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-full h-full rounded-full border-2 border-blue-300/50" />
                  </motion.div>
                  
                  {/* Deflected trajectory */}
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <svg className="w-full h-full" viewBox="0 0 160 80">
                      <motion.path
                        d="M 20 60 Q 80 20 140 10"
                        stroke="#10b981"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: 1.5 }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
            
            <StatRow 
              icon="⚡"
              label="Required Deflection Energy" 
              value={results.deflectionMegatons ? results.deflectionMegatons.toFixed(2) : 'N/A'} 
              unit="megatons" 
              severity={results.deflectionMegatons > 1000 ? 'extreme' : results.deflectionMegatons > 100 ? 'high' : 'medium'}
            />
            <StatRow 
              icon="💣"
              label="Nuclear Comparison" 
              value={results.deflectionBombComparison || 'N/A'} 
              severity="high"
            />
            <StatRow 
              icon="🚀"
              label="Required Velocity Change" 
              value={results.deflectionDeltaV || 'N/A'} 
              unit="m/s" 
              severity="medium"
            />
            <StatRow 
              icon="📊"
              label="Deflection Efficiency" 
              value={results.deflectionAngleEfficiency ? `${results.deflectionAngleEfficiency}%` : 'N/A'} 
              severity={parseFloat(results.deflectionAngleEfficiency) < 30 ? 'extreme' : parseFloat(results.deflectionAngleEfficiency) < 60 ? 'high' : 'medium'}
            />
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a tab to view impact data</p>
          </div>
        )
    }
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-md rounded-2xl 
                 shadow-2xl border border-white/50 overflow-hidden relative"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Tab Navigation */}
      <div className="relative z-10 flex flex-wrap border-b border-gray-200/50 bg-white/30 backdrop-blur-sm">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 min-w-[120px] px-3 py-4 text-sm font-medium transition-all duration-300
                       hover:bg-white/50 group overflow-hidden
                       ${activeTab === tab.id 
                         ? 'text-blue-700 bg-white/70 shadow-lg' 
                         : 'text-gray-600 hover:text-gray-900'
                       }`}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            {/* Active tab indicator */}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-full"
                layoutId="activeTab"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10 flex flex-col items-center gap-1">
              <motion.span 
                className="text-lg"
                animate={activeTab === tab.id ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {tab.icon}
              </motion.span>
              <span className="leading-tight">{tab.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative z-10 p-6 bg-white/30 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 150 }}
            className="space-y-4"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-tr-full" />
    </motion.div>
  )
}