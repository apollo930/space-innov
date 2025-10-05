import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function ResultCard({ results }){
  const [activeTab, setActiveTab] = useState('overview')
  
  const getSeverityLevel = () => {
    if (results.megatons > 100) return { 
      level: 'CATASTROPHIC', 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      icon: '💀'
    }
    if (results.megatons > 10) return { 
      level: 'SEVERE', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200',
      icon: '🔥'
    }
    if (results.megatons > 1) return { 
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'crater', label: 'Crater', icon: '🕳️' },
    { id: 'fireball', label: 'Fireball', icon: '🔥' },
    { id: 'shockwave', label: 'Shock Wave', icon: '💥' },
    { id: 'wind', label: 'Wind', icon: '🌪️' },
    { id: 'earthquake', label: 'Earthquake', icon: '🌍' },
    { id: 'tsunami', label: 'Tsunami', icon: '🌊' },
    { id: 'deflection', label: 'Deflection', icon: '🚀' }
  ]

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

  const StatRow = ({ icon, label, value, unit = '', isHighlight = false }) => (
    <motion.div 
      variants={itemVariants} 
      className={`flex justify-between items-center p-2 rounded ${isHighlight ? 'bg-white/80 border border-gray-200' : 'bg-white/50'}`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <strong className={isHighlight ? 'text-lg' : ''}>{label}:</strong>
      </span>
      <motion.span 
        className={`font-mono text-right ${isHighlight ? 'font-bold text-lg ' + severity.color : ''}`}
        animate={{ scale: isHighlight ? [1.2, 1] : [1.1, 1] }}
        transition={{ duration: 0.4 }}
      >
        {value} {unit}
      </motion.span>
    </motion.div>
  )

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🎯" 
              label="Impact Speed" 
              value={Math.round(results.impactSpeed).toLocaleString()} 
              unit="mph" 
              isHighlight 
            />
            <StatRow 
              icon="💥" 
              label="TNT Equivalent" 
              value={results.gigatons >= 1 ? results.gigatons.toFixed(1) : results.megatons.toFixed(1)} 
              unit={results.gigatons >= 1 ? "Gigatons" : "Megatons"}
              isHighlight 
            />
            <StatRow icon="⚖️" label="Mass" value={results.mass.toExponential(2)} unit="kg" />
            <StatRow icon="⚡" label="Energy" value={results.energy.toExponential(2)} unit="J" />
            <StatRow icon="📅" label="Impact Frequency" value={`Every ${results.impactFrequency.toLocaleString()}`} unit="years" />
            <StatRow 
              icon="👥" 
              label="Population Density" 
              value={results.populationDensity?.toLocaleString() || 'Unknown'} 
              unit="people/km²" 
            />
            <StatRow 
              icon={results.isOceanImpact ? "🌊" : "🏔️"} 
              label="Impact Location" 
              value={results.isOceanImpact ? "Ocean/Water" : "Land"} 
              unit={results.isOceanImpact ? "(Tsunami risk)" : "(Direct damage)"} 
            />
            {results.hurricaneComparison > 1 && (
              <StatRow 
                icon="🌀" 
                label="Hurricane Comparison" 
                value={`${results.hurricaneComparison.toFixed(1)}x more energy`} 
                unit="than a hurricane/day" 
              />
            )}
          </motion.div>
        )
      
      case 'crater':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🕳️" 
              label="Crater Width" 
              value={`${(results.craterDiameter * 3.28084 / 5280).toFixed(1)} mile wide`} 
              unit=""
              isHighlight 
            />
            <StatRow 
              icon="📏" 
              label="Crater Depth" 
              value={Math.round(results.craterDepth * 3.28084).toLocaleString()} 
              unit="ft deep" 
            />
            <StatRow 
              icon="�" 
              label="Impact Angle" 
              value={results.deflectionImpactAngle} 
              unit="degrees" 
            />
            <StatRow 
              icon="🔄" 
              label="Crater Shape" 
              value={results.craterShape} 
              unit="" 
            />
            <StatRow 
              icon="📊" 
              label="Angle Efficiency" 
              value={results.craterAngleScaling} 
              unit="% of vertical" 
            />
            <StatRow 
              icon="�💀" 
              label="Vaporized in Crater" 
              value={results.craterVaporized.toLocaleString()} 
              unit="people" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              �️ Impact angle dramatically affects crater formation:
              • 90°: Circular crater, maximum depth
              • 60°: Slightly elliptical
              • 30°: Highly elliptical, shallower
              • &lt;15°: May ricochet or create elongated scar
            </div>
          </motion.div>
        )
      
      case 'fireball':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🔥" 
              label="Fireball Width" 
              value={`${(results.fireballRadius * 2 * 3.28084 / 5280).toFixed(1)} mile wide`} 
              unit="fireball"
              isHighlight 
            />
            <StatRow 
              icon="💀" 
              label="Deaths from Fireball" 
              value={results.fireballDeaths.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="🔥" 
              label="3rd Degree Burns" 
              value={results.burns3rdDegree.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="🔥" 
              label="2nd Degree Burns" 
              value={results.burns2ndDegree.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="🌲" 
              label="Tree Fire Range" 
              value={Math.round(results.treeFires * 3.28084 / 5280)} 
              unit="miles" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              🔥 The fireball is the initial ball of superheated gas that expands rapidly from the impact point.
            </div>
          </motion.div>
        )
      
      case 'shockwave':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="📢" 
              label="Shock Wave Level" 
              value={Math.round(results.shockWaveDecibels)} 
              unit="decibels"
              isHighlight 
            />
            <StatRow 
              icon="💀" 
              label="Deaths from Shock" 
              value={results.shockWaveDeaths.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="🫁" 
              label="Lung Damage Range" 
              value={Math.round(results.lungDamageRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="👂" 
              label="Eardrum Rupture Range" 
              value={Math.round(results.eardrumRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="🏢" 
              label="Building Collapse Range" 
              value={Math.round(results.buildingCollapseRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="🏠" 
              label="Home Collapse Range" 
              value={Math.round(results.homeCollapseRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              💥 The shock wave is a high-pressure wave that travels outward at supersonic speeds.
            </div>
          </motion.div>
        )
      
      case 'wind':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🌪️" 
              label="Peak Wind Speed" 
              value={Math.round(results.windSpeed).toLocaleString()} 
              unit="mph"
              isHighlight 
            />
            <StatRow 
              icon="💀" 
              label="Deaths from Wind" 
              value={results.windDeaths.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="🪐" 
              label="Jupiter-Speed Winds" 
              value={Math.round(results.jupiterWindRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="🏠" 
              label="Complete Destruction" 
              value={Math.round(results.leveledRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="🌪️" 
              label="EF5 Tornado Conditions" 
              value={Math.round(results.tornadoRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <StatRow 
              icon="🌲" 
              label="Trees Knocked Down" 
              value={Math.round(results.treeKnockRadius * 3.28084 / 5280)} 
              unit="miles" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              🌪️ Extreme winds follow the shock wave, capable of leveling structures and forests.
            </div>
          </motion.div>
        )
      
      case 'earthquake':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🌍" 
              label="Earthquake Magnitude" 
              value={results.earthquakeMagnitude.toFixed(1)} 
              unit="on Richter scale"
              isHighlight 
            />
            <StatRow 
              icon="💀" 
              label="Earthquake Deaths" 
              value={results.earthquakeDeaths.toLocaleString()} 
              unit="people" 
            />
            <StatRow 
              icon="📏" 
              label="Felt Distance" 
              value={Math.round(results.earthquakeRadius * 3.28084 / 5280)} 
              unit="miles away" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              🌍 Large impacts generate seismic waves that can be felt hundreds of miles away.
            </div>
          </motion.div>
        )
      
      case 'tsunami':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            {results.isOceanImpact ? (
              <>
                <StatRow 
                  icon="🌊" 
                  label="Tsunami Wave Height" 
                  value={results.tsunamiHeight.toFixed(1)} 
                  unit="meters"
                  isHighlight 
                />
                <StatRow 
                  icon="📏" 
                  label="Tsunami Radius" 
                  value={Math.round(results.tsunamiRadius).toLocaleString()} 
                  unit="km" 
                />
                <StatRow 
                  icon="💀" 
                  label="Coastal Deaths" 
                  value={results.tsunamiDeaths.toLocaleString()} 
                  unit="people" 
                />
                <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
                  🌊 Ocean impacts generate devastating tsunamis that can travel across entire ocean basins, 
                  affecting coastlines thousands of kilometers away. Wave height decreases with distance but remains dangerous.
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🏔️</div>
                <div className="font-medium text-gray-700">Land Impact</div>
                <div className="text-sm text-gray-500 mt-1">No tsunami generated from land impacts</div>
              </div>
            )}
          </motion.div>
        )
      
      case 'deflection':
        return (
          <motion.div className="space-y-3" variants={containerVariants}>
            <StatRow 
              icon="🚀" 
              label="Required Δv" 
              value={results.deflectionDeltaV} 
              unit="m/s"
              isHighlight 
            />
            <StatRow 
              icon="💥" 
              label="Deflection Energy" 
              value={results.deflectionBombComparison} 
              unit="" 
            />
            <StatRow 
              icon="⚡" 
              label="Energy (Megatons)" 
              value={results.deflectionMegatons < 0.001 ? 
                (results.deflectionMegatons * 1000).toFixed(3) + ' kilotons' : 
                results.deflectionMegatons.toFixed(3)
              } 
              unit={results.deflectionMegatons >= 0.001 ? 'megatons' : ''} 
            />
            <StatRow 
              icon="📐" 
              label="Impact Angle" 
              value={results.deflectionImpactAngle} 
              unit="degrees" 
            />
            <StatRow 
              icon="⚡" 
              label="Deflection Efficiency" 
              value={results.deflectionAngleEfficiency} 
              unit="%" 
            />
            <StatRow 
              icon="🌌" 
              label="PHA Threshold" 
              value="0.05" 
              unit="AU (7.5M km)" 
            />
            <div className="text-xs text-gray-600 mt-2 p-2 bg-white/30 rounded border">
              🚀 Deflection calculations use the PHA threshold of 0.05 AU (7.5M km). Impact angle affects deflection efficiency:
              • 90° (perpendicular): Maximum efficiency
              • 45°: ~71% efficiency
              • 30°: ~50% efficiency
              • Low angles: Much harder to deflect laterally
            </div>
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div 
      className={`${severity.bg} ${severity.border} border-2 rounded-xl shadow-xl backdrop-blur-sm relative overflow-hidden max-h-[28rem] flex flex-col`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gradient-to-r from-white/60 to-white/40">
        <h3 className="font-bold text-xl text-gray-800">Impact Analysis</h3>
        <motion.div 
          className={`${severity.color} ${severity.bg} px-4 py-2 rounded-full text-sm font-bold border-2 ${severity.border} flex items-center gap-2 shadow-sm`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <span className="text-lg">{severity.icon}</span>
          <span>{severity.level}</span>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-gradient-to-r from-white/50 to-white/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? `${severity.color} bg-white shadow-sm border-b-3 ${severity.border.replace('border-', 'border-b-')} transform scale-105`
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </motion.div>
  )
}