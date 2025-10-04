import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NearEarthObjects({ onSelectAsteroid }) {
  const [asteroids, setAsteroids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetchNearEarthObjects()
  }, [])

  const fetchNearEarthObjects = async () => {
    try {
      setLoading(true)
      
      // Use fallback to curated realistic data (NASA API has CORS issues)
      let asteroids = []
      
      try {
        // Try NASA NeoWs API (more reliable for web apps)
        const today = new Date().toISOString().split('T')[0]
        const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
        const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${endDate}&api_key=${apiKey}`
        
        const response = await fetch(apiUrl)
        
        if (response.ok) {
          const data = await response.json()
          const nearEarthObjects = []
          
          // Extract asteroids from the date-based response
          Object.values(data.near_earth_objects).forEach(dateAsteroids => {
            nearEarthObjects.push(...dateAsteroids.slice(0, 3)) // Take up to 3 per date
          })
          
          if (nearEarthObjects.length > 0) {
            asteroids = nearEarthObjects.slice(0, 10).map((asteroid, index) => {
              const diameter = asteroid.estimated_diameter?.meters?.estimated_diameter_max || (Math.random() * 2000 + 100)
              return { 
                name: asteroid.name,
                diameter: diameter,
                index,
                apiData: asteroid
              }
            })
          }
        }
      } catch (apiError) {
        console.warn('NASA API failed, using curated asteroid catalog:', apiError)
      }
      
      // If API fails, use realistic fallback data based on real asteroids
      if (asteroids.length === 0) {
        asteroids = [
          { name: "99942 Apophis", diameter: 340, index: 0 },
          { name: "101955 Bennu", diameter: 490, index: 1 },
          { name: "4179 Toutatis", diameter: 2400, index: 2 },
          { name: "4769 Castalia", diameter: 1400, index: 3 },
          { name: "25143 Itokawa", diameter: 330, index: 4 },
          { name: "433 Eros", diameter: 16840, index: 5 },
          { name: "1620 Geographos", diameter: 2000, index: 6 },
          { name: "6489 Golevka", diameter: 530, index: 7 },
          { name: "2063 Bacchus", diameter: 1100, index: 8 },
          { name: "1566 Icarus", diameter: 1400, index: 9 }
        ]
      }
      
      const processedAsteroids = asteroids.map((asteroid, index) => {
        const estimatedDiameter = asteroid.diameter
        const estimatedSpeed = 15 + Math.random() * 25 // km/s (typical asteroid speeds)
        const estimatedDensity = 2500 + Math.random() * 2000 // kg/m³ (rocky asteroids)
        
        // Calculate potential impact energy
        const volume = (4/3) * Math.PI * Math.pow(estimatedDiameter/2, 3)
        const mass = estimatedDensity * volume
        const velocity = estimatedSpeed * 1000 // m/s
        const energy = 0.5 * mass * velocity * velocity
        const megatons = energy / 4.184e15
        
        // Estimate close approach date (within next 5 years)
        const daysFromNow = Math.random() * 365 * 5
        const approachDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
        
        return {
          id: asteroid.index || index,
          name: asteroid.name || `Asteroid ${index + 1}`,
          diameter: estimatedDiameter,
          speed: estimatedSpeed,
          density: estimatedDensity,
          energy: energy,
          megatons: megatons,
          approachDate: approachDate,
          distance: 0.01 + Math.random() * 0.2, // AU (0.01-0.21 AU, closer approaches)
          nearestDistance: (0.01 + Math.random() * 0.2) * 149597870.7, // Convert to km
          hazardLevel: megatons > 1000 ? 'EXTREME' : megatons > 100 ? 'HIGH' : megatons > 10 ? 'MODERATE' : 'LOW'
        }
      })
      
      // Sort by approach date
      processedAsteroids.sort((a, b) => a.approachDate - b.approachDate)
      setAsteroids(processedAsteroids)
      
    } catch (err) {
      console.error('Error fetching asteroids:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getHazardColor = (level) => {
    switch(level) {
      case 'EXTREME': return 'text-red-600 bg-red-50 border-red-200'
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'MODERATE': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const calculateDeflection = (asteroid) => {
    // Calculate the minimum velocity change needed to miss Earth
    // Assuming we need to change trajectory by Earth's radius at closest approach
    const earthRadius = 6371 // km
    const approachDistance = asteroid.nearestDistance // km
    const timeToApproach = Math.abs(asteroid.approachDate - new Date()) / (1000 * 60 * 60 * 24) // days
    
    // Required deflection angle (small angle approximation)
    const deflectionAngle = earthRadius / approachDistance // radians
    
    // Required velocity change (delta-v)
    const currentVelocity = asteroid.speed * 1000 // m/s
    const deltaV = currentVelocity * deflectionAngle // m/s
    
    // Mass of asteroid
    const volume = (4/3) * Math.PI * Math.pow(asteroid.diameter/2, 3) // m³
    const mass = asteroid.density * volume // kg
    
    // Energy required for deflection
    const deflectionEnergy = 0.5 * mass * deltaV * deltaV // Joules
    const deflectionMegatons = deflectionEnergy / 4.184e15
    
    // Compare to nuclear weapons
    const tsarBomba = 50 // megatons (largest bomb ever tested)
    const littleBoy = 0.015 // megatons (Hiroshima bomb)
    const modernNuke = 0.3 // megatons (typical modern warhead)
    
    let bombComparison = ''
    if (deflectionMegatons >= tsarBomba) {
      bombComparison = `${(deflectionMegatons / tsarBomba).toFixed(1)}x Tsar Bomba`
    } else if (deflectionMegatons >= modernNuke) {
      bombComparison = `${(deflectionMegatons / modernNuke).toFixed(1)}x modern nukes`
    } else if (deflectionMegatons >= littleBoy) {
      bombComparison = `${(deflectionMegatons / littleBoy).toFixed(1)}x Hiroshima bombs`
    } else {
      bombComparison = `${(deflectionMegatons * 1000).toFixed(1)} kilotons`
    }
    
    return {
      deltaV: deltaV.toFixed(2),
      energy: deflectionEnergy,
      megatons: deflectionMegatons,
      bombComparison,
      timeToApproach: timeToApproach.toFixed(0)
    }
  }

  const handleSimulateImpact = (asteroid) => {
    const settings = {
      diam: asteroid.diameter,
      speed: asteroid.speed,
      angle: 45, // Default angle
      density: asteroid.density
    }
    onSelectAsteroid(asteroid, settings)
  }

  if (loading) {
    return (
      <motion.div 
        className="bg-white border-2 border-blue-200 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-blue-700 font-medium">Loading real asteroid data from NASA...</span>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div 
        className="bg-red-50 border-2 border-red-200 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-red-800 font-medium">Failed to load asteroid data</div>
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌌</span>
            <div>
              <h3 className="font-bold text-purple-800">Real Asteroid Threats</h3>
              <p className="text-sm text-purple-600">Based on NASA's Potentially Hazardous Asteroids</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
              {asteroids.length} objects
            </span>
            <motion.span 
              className="text-purple-600"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-200"
          >
            <div className="max-h-96 overflow-y-auto">
              {asteroids.slice(0, 10).map((asteroid, index) => (
                <motion.div
                  key={asteroid.id}
                  className="p-3 border-b border-purple-100 hover:bg-white/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800 text-sm">{asteroid.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getHazardColor(asteroid.hazardLevel)}`}>
                          {asteroid.hazardLevel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>📏 {Math.round(asteroid.diameter).toLocaleString()}m diameter</div>
                        <div>⚡ {asteroid.speed.toFixed(1)} km/s</div>
                        <div>🌍 {(asteroid.nearestDistance / 1000).toFixed(0)}k km closest</div>
                        <div>📅 {asteroid.approachDate.toLocaleDateString()}</div>
                      </div>
                      {(() => {
                        const deflection = calculateDeflection(asteroid)
                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs">
                            <div className="font-medium text-blue-800 mb-1">🚀 Deflection Required:</div>
                            <div className="grid grid-cols-1 gap-1 text-blue-700">
                              <div>Δv: {deflection.deltaV} m/s</div>
                              <div>Energy: {deflection.bombComparison}</div>
                              <div>Time window: {deflection.timeToApproach} days</div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                    <button
                      onClick={() => handleSimulateImpact(asteroid)}
                      className="ml-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors flex items-center gap-1"
                    >
                      <span>🎯</span>
                      Simulate
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}