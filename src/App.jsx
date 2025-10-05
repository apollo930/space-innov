import React, { useState, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import Controls from './components/Controls'
import ResultCard from './components/ResultCard'
import NearEarthObjects from './components/NearEarthObjects'
import { motion, AnimatePresence } from 'framer-motion'

const RED_DOT_SVG = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%23ff3b30'/></svg>`

const TARGET_SVG = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
  <circle cx='12' cy='12' r='10' fill='none' stroke='%234f46e5' stroke-width='3'/>
  <circle cx='12' cy='12' r='6' fill='none' stroke='%234f46e5' stroke-width='2'/>
  <circle cx='12' cy='12' r='2' fill='%234f46e5'/>
</svg>`

const impactIcon = new L.Icon({
  iconUrl: RED_DOT_SVG,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const targetIcon = new L.Icon({
  iconUrl: TARGET_SVG,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

function MapClick({ onLocationSelect }) {
  useMapEvents({
    click(e) { onLocationSelect(e.latlng) }
  })
  return null
}

export default function App(){
  const [settings, setSettings] = useState({ diam:500, speed:17, angle:45, density:3500 })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [impact, setImpact] = useState(null)
  const [results, setResults] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const mapRef = useRef(null)

  // Fetch real population density from WorldPop API
  const fetchPopulationDensity = async (lat, lng) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
      
      const url = new URL('https://worldpop.arcgis.com/arcgis/rest/services/WorldPop_Population_Density_1km/ImageServer/identify')
      url.searchParams.append('geometry', JSON.stringify({x: lng, y: lat}))
      url.searchParams.append('geometryType', 'esriGeometryPoint')
      url.searchParams.append('sr', '4326')
      url.searchParams.append('returnCatalogItems', 'false')
      url.searchParams.append('returnGeometry', 'false')
      url.searchParams.append('f', 'json')
      
      const response = await fetch(url, { 
        signal: controller.signal,
        mode: 'cors' 
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // WorldPop returns population density per km²
      // Handle various response formats and null values
      let density = data.value !== null && data.value !== undefined ? data.value : null
      
      // Check for 'noData' string which indicates water/uninhabited areas
      if (data.value === 'noData' || data.value === 'NoData') {
        console.log(`Impact location over water/uninhabited area (${lat.toFixed(3)}, ${lng.toFixed(3)}), using 0 population density`)
        return 0
      }
      
      if (density === null && data.results && data.results.length > 0) {
        density = data.results[0].value
        if (density === 'noData' || density === 'NoData') {
          console.log(`Impact location over water/uninhabited area (${lat.toFixed(3)}, ${lng.toFixed(3)}), using 0 population density`)
          return 0
        }
      }
      
      // Use global average if no data available (API error, not water)
      if (density === null || density === undefined || isNaN(density)) {
        console.log(`No population data for coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)}), using global average`)
        return 57 // Global average
      }
      
      return Math.max(0, Math.round(density)) // Ensure non-negative integer
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Population API request timeout')
      } else {
        console.warn('Failed to fetch population data:', error.message)
      }
      return 57 // Fallback to global average
    }
  }

  const computeImpact = async (latlng, s = settings) => {
    const d = Number(s.diam)
    const r = d/2
    const volume = (4/3)*Math.PI*Math.pow(r,3)
    const mass = s.density * volume
    const v = Number(s.speed)*1000
    const energy = 0.5 * mass * v * v
    const megatons = energy / 4.184e15
    const gigatons = megatons / 1000
    const impactAngleRad = (s.angle * Math.PI) / 180 // Convert degrees to radians
    
    // Fetch real population density for impact location
    const popDensity = await fetchPopulationDensity(latlng.lat, latlng.lng)
    
    // Basic impact calculations with angle corrections
    const baseCraterDiameter = 0.02 * Math.pow(energy, 1/3.4)
    
    // Impact angle scaling factors:
    // - Vertical impacts (90°) create circular craters with maximum depth
    // - Oblique impacts create elliptical craters with reduced depth
    // - Very shallow impacts (<15°) may not form proper craters
    const angleScaling = Math.pow(Math.sin(impactAngleRad), 0.67) // Empirical scaling from impact studies
    const craterDiameter = baseCraterDiameter * (0.3 + 0.7 * angleScaling) // Minimum 30% of vertical impact
    const craterDepth = craterDiameter * 0.2 * angleScaling // Depth more affected by angle
    
    const blastRadius = craterDiameter * 2.5
    const willAirburst = (d < 200 && s.speed > 11 && s.angle > 15)
    
    // Crater effects (using real population density)
    const craterArea = Math.PI * Math.pow(craterDiameter/2000, 2) // km²
    const craterVaporized = Math.round(craterArea * popDensity)
    
    // Fireball calculations
    const fireballRadius = Math.pow(energy/4.184e12, 0.4) * 1000 // meters
    const fireballArea = Math.PI * Math.pow(fireballRadius/1000, 2) // km²
    const fireballDeaths = Math.round(fireballArea * popDensity * 0.9) // 90% fatality in fireball
    const burns3rdDegree = Math.round(fireballArea * popDensity * 0.05)
    const burns2ndDegree = Math.round(fireballArea * popDensity * 0.1)
    const treeFires = fireballRadius * 10 // trees catch fire much further out
    
    // Shock wave calculations
    const shockWaveDecibels = Math.min(300, 180 + 20 * Math.log10(megatons))
    const shockWaveRadius = Math.pow(energy/4.184e12, 0.33) * 2000 // meters
    const shockWaveArea = Math.PI * Math.pow(shockWaveRadius/1000, 2) // km²
    const shockWaveDeaths = Math.round(shockWaveArea * popDensity * 0.3)
    const lungDamageRadius = shockWaveRadius * 0.3
    const eardrumRadius = shockWaveRadius * 0.4
    const buildingCollapseRadius = shockWaveRadius * 0.7
    const homeCollapseRadius = shockWaveRadius * 0.9
    
    // Wind blast calculations
    const windSpeed = Math.pow(energy/4.184e12, 0.25) * 500 // mph
    const windRadius = Math.pow(energy/4.184e12, 0.3) * 1500 // meters
    const windArea = Math.PI * Math.pow(windRadius/1000, 2) // km²
    const windDeaths = Math.round(windArea * popDensity * 0.4)
    const jupiterWindRadius = windRadius * 0.2
    const leveledRadius = windRadius * 0.4
    const tornadoRadius = windRadius * 0.7
    const treeKnockRadius = windRadius * 1.2
    
    // Earthquake calculations
    const earthquakeMagnitude = Math.min(10, 4 + Math.log10(megatons))
    const earthquakeRadius = Math.pow(10, earthquakeMagnitude) * 10 // meters felt
    const earthquakeArea = Math.PI * Math.pow(earthquakeRadius/1000, 2) // km²
    const earthquakeDeaths = Math.round(earthquakeArea * popDensity * 0.001) // much lower fatality rate
    
    // Impact frequency (very rough estimates)
    const impactFrequency = megatons > 10000 ? 65000000 : 
                           megatons > 1000 ? 650000 :
                           megatons > 100 ? 65000 :
                           megatons > 10 ? 6500 :
                           megatons > 1 ? 650 : 65
    
    // Energy comparisons
    const hurricaneComparison = energy / (1.5e16) // hurricane releases ~1.5e16 J per day
    
    // Deflection calculations (using PHA threshold of 0.05 AU)
    const earthRadius = 6371000 // meters
    const AU = 149597870700 // meters (1 Astronomical Unit)
    const phaThreshold = 0.05 * AU // 0.05 AU = PHA definition threshold
    const currentVelocity = v // m/s (impact velocity)
    
    // For deflection calculation, assume we detect the asteroid at a reasonable distance
    // Typical detection might be at 1-10 AU depending on size and survey capabilities
    const detectionDistance = Math.max(1 * AU, phaThreshold * 20) // At least 1 AU or 20x PHA threshold
    
    // Required deflection angle to miss Earth by PHA threshold distance
    const baseDeflectionAngle = phaThreshold / detectionDistance // radians
    
    // Impact angle affects deflection efficiency:
    // - Perpendicular impacts (90°) are most efficient for deflection
    // - Grazing impacts (low angles) are less efficient
    // - Very steep impacts (near 0°) are hardest to deflect laterally
    const angleEfficiency = Math.sin(impactAngleRad) // Sine gives efficiency factor
    const effectiveDeflectionAngle = baseDeflectionAngle / Math.max(angleEfficiency, 0.1) // Avoid division by zero
    
    // Change in velocity needed for deflection (accounting for impact angle)
    const deltaV = currentVelocity * effectiveDeflectionAngle // m/s
    
    // Energy required for deflection
    const deflectionEnergy = 0.5 * mass * deltaV * deltaV // Joules
    const deflectionMegatons = deflectionEnergy / 4.184e15
    
    // Nuclear weapon comparisons
    const littleBoy = 0.015 // 15 kilotons in megatons
    const modernNuke = 0.1 // 100 kilotons
    const tsarBomba = 50 // 50 megatons
    
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
      lat: latlng.lat, 
      lng: latlng.lng, 
      mass, 
      energy, 
      megatons, 
      gigatons,
      craterDiameter, 
      craterDepth,
      craterAngleScaling: (angleScaling * 100).toFixed(1),
      craterShape: s.angle > 60 ? 'Circular' : s.angle > 30 ? 'Elliptical' : 'Highly Elongated',
      blastRadius, 
      willAirburst,
      impactSpeed: v * 2.237, // convert to mph
      
      // Crater effects
      craterVaporized,
      
      // Fireball effects
      fireballRadius,
      fireballDeaths,
      burns3rdDegree,
      burns2ndDegree,
      treeFires,
      
      // Shock wave effects
      shockWaveDecibels,
      shockWaveDeaths,
      lungDamageRadius,
      eardrumRadius,
      buildingCollapseRadius,
      homeCollapseRadius,
      
      // Wind effects
      windSpeed,
      windDeaths,
      jupiterWindRadius,
      leveledRadius,
      tornadoRadius,
      treeKnockRadius,
      
      // Earthquake effects
      earthquakeMagnitude,
      earthquakeDeaths,
      earthquakeRadius,
      
      // Comparisons
      impactFrequency,
      hurricaneComparison,
      
      // Deflection data
      deflectionDeltaV: deltaV.toFixed(2),
      deflectionEnergy,
      deflectionMegatons,
      deflectionBombComparison: bombComparison,
      deflectionImpactAngle: s.angle,
      deflectionAngleEfficiency: (angleEfficiency * 100).toFixed(1),
      
      // Population data
      populationDensity: Math.round(popDensity)
    }
  }

  const handleMapClick = (latlng) => {
    // Only allow location selection if not currently animating
    if (!isAnimating && !showExplosion) {
      setSelectedLocation(latlng)
      // Clear previous results when selecting new location
      setImpact(null)
      setResults(null)
    }
  }

  const handleLaunch = () => {
    if (!selectedLocation) return
    
    setImpact(selectedLocation)
    setIsAnimating(true)
    setShowExplosion(false)
    
    // Asteroid flight time
    setTimeout(() => {
      setIsAnimating(false)
      setShowExplosion(true)
      
      // Show explosion briefly, then calculate results
      setTimeout(async () => {
        setIsCalculating(true)
        try {
          const res = await computeImpact(selectedLocation)
          setResults(res)
          setShowExplosion(false)
        } catch (error) {
          console.error('Failed to compute impact:', error)
          setShowExplosion(false)
        } finally {
          setIsCalculating(false)
        }
      }, 500)
    }, 1000)
  }

  // Convert lat/lng to screen coordinates for asteroid animation
  const getScreenPosition = (latlng) => {
    if (!mapRef.current || !latlng) return { x: '50%', y: '50%' }
    
    const map = mapRef.current
    const point = map.latLngToContainerPoint([latlng.lat, latlng.lng])
    const mapContainer = map.getContainer()
    const rect = mapContainer.getBoundingClientRect()
    
    return {
      x: `${(point.x / rect.width) * 100}%`,
      y: `${(point.y / rect.height) * 100}%`
    }
  }

  const handleSettingsChange = async (partial) => {
    setSettings(prev => ({...prev,...partial}))
    if (selectedLocation && results) {
      try {
        const res = await computeImpact(selectedLocation, {...settings,...partial})
        setResults(res)
      } catch (error) {
        console.error('Failed to compute impact with new settings:', error)
      }
    }
  }

  const handleSelectAsteroid = (asteroid, asteroidSettings) => {
    // Update settings to match the selected asteroid
    setSettings(asteroidSettings)
    
    // Clear any existing selection
    setSelectedLocation(null)
    setImpact(null)
    setResults(null)
    
    // Auto-select a random impact location (could be made selectable later)
    const randomLat = (Math.random() - 0.5) * 160 // -80 to 80 latitude
    const randomLng = (Math.random() - 0.5) * 360 // -180 to 180 longitude
    const impactLocation = { lat: randomLat, lng: randomLng }
    
    setSelectedLocation(impactLocation)
    
    // Show a notification about the asteroid selection
    console.log(`Selected asteroid: ${asteroid.name} for impact simulation`)
  }

  const handleReset = () => {
    setSettings({ diam: 500, speed: 17, angle: 45, density: 3500 })
    setSelectedLocation(null)
    setImpact(null)
    setResults(null)
  }

  const mapCenter = useMemo(()=>[20,0],[])

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-96 bg-white border-r p-4 flex flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Meteoroid Launcher
          </h1>
          <p className="text-sm text-gray-500">
            {selectedLocation 
              ? "Target selected! Click Launch to start impact simulation." 
              : "Click anywhere on the map to select a target location."
            }
          </p>
        </motion.div>

        <Controls settings={settings} onChange={handleSettingsChange} onReset={handleReset} />

        <NearEarthObjects onSelectAsteroid={handleSelectAsteroid} />

        {/* Target Location Display */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-blue-800 flex items-center gap-2">
                    🎯 Target Selected
                  </div>
                  <div className="text-sm text-blue-600">
                    Lat: {selectedLocation.lat.toFixed(3)}, Lng: {selectedLocation.lng.toFixed(3)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="text-blue-400 hover:text-blue-600 transition-colors"
                    title="Clear target"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => {
                      setSettings({ diam: 500, speed: 17, angle: 45, density: 3500 })
                      setSelectedLocation(null)
                      setImpact(null)
                      setResults(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-sm px-2 py-1 rounded border border-gray-300 hover:border-gray-400"
                    title="Reset all settings"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launch Button */}
        <AnimatePresence>
          {selectedLocation && !isAnimating && !showExplosion && (
            <motion.button
              onClick={handleLaunch}
              disabled={!selectedLocation}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 
                         text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                         text-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🚀</span>
              LAUNCH METEOROID
              <span className="text-2xl">💥</span>
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isAnimating || showExplosion) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-4 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full"
                  animate={{ 
                    scale: showExplosion ? [1, 2, 1] : [1, 1.2, 1],
                    rotate: showExplosion ? [0, 360] : [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: showExplosion ? 0.5 : 1, 
                    repeat: showExplosion ? 0 : Infinity,
                    ease: "easeInOut" 
                  }}
                />
                <div>
                  <div className="font-bold text-orange-800">
                    {showExplosion ? 'IMPACT!' : 'Meteoroid Incoming!'}
                  </div>
                  <div className="text-sm text-orange-600">
                    {showExplosion ? 'Explosion in progress...' : 'Calculating devastation...'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCalculating && !isAnimating && !showExplosion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-4 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
                  animate={{ 
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                />
                <div>
                  <div className="font-bold text-blue-800">
                    Calculating Impact Effects...
                  </div>
                  <div className="text-sm text-blue-600">
                    Fetching real population data from WorldPop
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && !isAnimating && !showExplosion && !isCalculating && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 100 
              }}
            >
              <ResultCard results={results} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="mt-auto text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          Educational demo — approximate values only.
        </motion.div>
      </aside>

      <main className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={2} className="h-full" whenCreated={m=>mapRef.current=m}>
          <TileLayer 
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community" 
          />
          <MapClick onLocationSelect={handleMapClick} />
          
          {/* Target Location Marker */}
          {selectedLocation && !impact && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={targetIcon}>
              <Popup>
                <strong>🎯 Target Location</strong><br />
                Lat: {selectedLocation.lat.toFixed(3)}<br />
                Lng: {selectedLocation.lng.toFixed(3)}<br />
                <em>Click Launch to start impact simulation</em>
              </Popup>
            </Marker>
          )}

          {/* Animated Meteoroid */}
          {isAnimating && impact && (() => {
            const targetPos = getScreenPosition(impact)
            return (
              <motion.div
                className="absolute z-[1000] pointer-events-none"
                style={{
                  left: '10%',
                  top: '5%',
                  width: '20px',
                  height: '20px'
                }}
                animate={{
                  left: targetPos.x,
                  top: targetPos.y,
                  scale: [0.3, 1.2, 0.8],
                  rotate: [0, 720]
                }}
                transition={{
                  duration: 1,
                  ease: "easeIn"
                }}
              >
                <div className="w-5 h-5 bg-gradient-radial from-orange-400 via-red-500 to-orange-600 rounded-full shadow-lg animate-pulse">
                  {/* Meteoroid trail */}
                  <motion.div
                    className="absolute -top-8 left-1/2 w-1 h-8 bg-gradient-to-t from-orange-400 to-transparent"
                    style={{ transform: 'translateX(-50%)' }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )
          })()}
          
          {/* Explosion Effect */}
          {showExplosion && impact && (() => {
            const targetPos = getScreenPosition(impact)
            return (
              <motion.div
                className="absolute z-[1001] pointer-events-none"
                style={{
                  left: targetPos.x,
                  top: targetPos.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-radial from-white via-yellow-400 to-orange-600 rounded-full"
                  animate={{
                    scale: [0, 4, 2],
                    opacity: [1, 0.8, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                />
                {/* Flash effect */}
                <motion.div
                  className="absolute inset-0 w-32 h-32 -top-6 -left-6 bg-white rounded-full"
                  animate={{
                    scale: [0, 6],
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 0.2
                  }}
                />
              </motion.div>
            )
          })()}
          
          {impact && !isAnimating && !showExplosion && (
            <>
              <Marker position={[impact.lat, impact.lng]} icon={impactIcon}>
                <Popup>
                  Impact site<br />Lat: {impact.lat.toFixed(3)} Lon: {impact.lng.toFixed(3)}
                  <br />Crater: {results ? Math.round(results.craterDiameter).toLocaleString() : 0}m
                </Popup>
              </Marker>
              {results && (
                <>
                  {/* Crater - Inner dark circle representing the actual crater */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  >
                    <Circle 
                      center={[impact.lat, impact.lng]} 
                      radius={Math.max(50, results.craterDiameter / 2)} 
                      pathOptions={{ 
                        color: '#1f2937',
                        weight: 3,
                        opacity: 0.8,
                        fillColor: '#111827',
                        fillOpacity: 0.7
                      }}
                    >
                      <Popup>
                        <strong>🕳️ Main Crater</strong><br/>
                        Diameter: {Math.round(results.craterDiameter).toLocaleString()}m<br/>
                        <small>The primary impact excavation</small>
                      </Popup>
                    </Circle>
                  </motion.div>

                  {/* Crater Rim - Elevated rim around the crater */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                  >
                    <Circle 
                      center={[impact.lat, impact.lng]} 
                      radius={Math.max(100, results.craterDiameter * 0.8)} 
                      pathOptions={{ 
                        color: '#8b5cf6',
                        weight: 2,
                        opacity: 0.6,
                        fillColor: '#6b21a8',
                        fillOpacity: 0.3
                      }}
                    >
                      <Popup>
                        <strong>🏔️ Crater Rim</strong><br/>
                        Diameter: {Math.round(results.craterDiameter * 0.8).toLocaleString()}m<br/>
                        <small>Elevated rim of ejected material</small>
                      </Popup>
                    </Circle>
                  </motion.div>

                  {/* Debris Field - Scattered debris around crater */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                  >
                    <Circle 
                      center={[impact.lat, impact.lng]} 
                      radius={Math.max(200, results.craterDiameter * 1.5)} 
                      pathOptions={{ 
                        color: '#f97316',
                        weight: 1,
                        opacity: 0.4,
                        fillColor: '#fb923c',
                        fillOpacity: 0.15,
                        dashArray: '5, 10'
                      }}
                    >
                      <Popup>
                        <strong>💥 Debris Field</strong><br/>
                        Radius: {Math.round(results.craterDiameter * 1.5).toLocaleString()}m<br/>
                        <small>Scattered impact debris and ejecta</small>
                      </Popup>
                    </Circle>
                  </motion.div>

                  {/* Blast Radius - Area of destruction */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                  >
                    <Circle 
                      center={[impact.lat, impact.lng]} 
                      radius={Math.max(1000, results.blastRadius)} 
                      pathOptions={{ 
                        color: results.megatons > 100 ? '#ef4444' : results.megatons > 10 ? '#f97316' : '#3b82f6', 
                        weight: 2,
                        opacity: 0.5,
                        fillOpacity: 0.1,
                        dashArray: results.megatons > 50 ? '10, 5' : '15, 10'
                      }}
                    >
                      <Popup>
                        <strong>🌊 Destruction Zone</strong><br/>
                        Radius: {Math.round(results.blastRadius).toLocaleString()}m<br/>
                        Power: {results.megatons.toFixed(1)} megatons<br/>
                        <small>Area of severe damage and casualties</small>
                      </Popup>
                    </Circle>
                  </motion.div>

                  {/* Seismic Waves - Ripple effects for large impacts */}
                  {results.megatons > 10 && (
                    <>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 0.3, 0] }}
                        transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
                      >
                        <Circle 
                          center={[impact.lat, impact.lng]} 
                          radius={results.blastRadius * 2} 
                          pathOptions={{ 
                            color: '#ef4444',
                            weight: 1,
                            opacity: 0.3,
                            fillOpacity: 0,
                            dashArray: '3, 15'
                          }} 
                        />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: [0, 0.2, 0] }}
                        transition={{ duration: 3, ease: "easeOut", delay: 0.8 }}
                      >
                        <Circle 
                          center={[impact.lat, impact.lng]} 
                          radius={results.blastRadius * 3} 
                          pathOptions={{ 
                            color: '#f97316',
                            weight: 1,
                            opacity: 0.2,
                            fillOpacity: 0,
                            dashArray: '2, 20'
                          }} 
                        />
                      </motion.div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </MapContainer>
        
        {/* Impact Legend */}
        {results && impact && !isAnimating && !showExplosion && (
          <motion.div 
            className="absolute right-2 top-2 z-[1000] bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white shadow-xl border border-gray-500 max-w-xs"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-center">Impact Zones</h3>
              <div className="text-xs bg-red-600 px-2 py-1 rounded text-white font-bold">
                {results.megatons > 100 ? 'CATASTROPHIC' : 
                 results.megatons > 10 ? 'SEVERE' : 
                 results.megatons > 1 ? 'MAJOR' : 'MODERATE'}
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 p-1 rounded bg-white/10">
                <div className="w-3 h-3 rounded-full bg-gray-800 border-2 border-gray-400 flex-shrink-0"></div>
                <span className="font-medium">Crater:</span>
                <span className="ml-auto font-mono">{Math.round(results.craterDiameter).toLocaleString()}m</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded bg-white/10">
                <div className="w-3 h-3 rounded-full bg-purple-600/50 border-2 border-purple-400 flex-shrink-0"></div>
                <span className="font-medium">Rim:</span>
                <span className="ml-auto font-mono">{Math.round(results.craterDiameter * 0.8).toLocaleString()}m</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded bg-white/10">
                <div className="w-3 h-3 rounded-full bg-orange-500/30 border-2 border-orange-400 border-dashed flex-shrink-0"></div>
                <span className="font-medium">Debris:</span>
                <span className="ml-auto font-mono">{Math.round(results.craterDiameter * 1.5).toLocaleString()}m</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded bg-white/10">
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                  results.megatons > 100 ? 'border-red-400 bg-red-500/20' : 
                  results.megatons > 10 ? 'border-orange-400 bg-orange-500/20' : 
                  'border-blue-400 bg-blue-500/20'
                }`}></div>
                <span className="font-medium">Blast:</span>
                <span className="ml-auto font-mono">{Math.round(results.blastRadius).toLocaleString()}m</span>
              </div>
              {results.megatons > 10 && (
                <div className="flex items-center gap-2 p-1 rounded bg-red-900/20 border-t border-red-600/30 pt-2">
                  <div className="w-3 h-3 rounded-full border-2 border-red-400 border-dashed bg-transparent flex-shrink-0"></div>
                  <span className="text-red-300 font-medium">Seismic Waves</span>
                </div>
              )}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-600 text-center">
              <div className="text-xs text-gray-300">
                <span className="font-bold text-orange-400">{results.megatons.toFixed(1)}</span> megatons TNT
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="absolute left-4 bottom-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {selectedLocation ? "🚀" : "🎯"}
            </span>
            <small className="text-xs text-gray-600 font-medium">
              {selectedLocation 
                ? "Target selected! Click Launch in the left panel to begin impact simulation."
                : "Click the map to select a target location, then adjust settings and launch."
              }
            </small>
          </div>
        </motion.div>
      </main>
    </div>
  )
}