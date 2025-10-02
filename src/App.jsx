import React, { useState, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet'
import L from 'leaflet'
import Controls from './components/Controls'
import ResultCard from './components/ResultCard'
import { motion, AnimatePresence } from 'framer-motion'

const RED_DOT_SVG = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' fill='%23ff3b30'/></svg>`

const impactIcon = new L.Icon({
  iconUrl: RED_DOT_SVG,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function MapClick({ onImpact }) {
  useMapEvents({
    click(e) { onImpact(e.latlng) }
  })
  return null
}

export default function App(){
  const [settings, setSettings] = useState({ diam:500, speed:17, angle:45, density:7874 })
  const [impact, setImpact] = useState(null)
  const [results, setResults] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const mapRef = useRef(null)

  const computeImpact = (latlng, s = settings) => {
    const d = Number(s.diam)
    const r = d/2
    const volume = (4/3)*Math.PI*Math.pow(r,3)
    const mass = s.density * volume
    const v = Number(s.speed)*1000
    const energy = 0.5 * mass * v * v
    const megatons = energy / 4.184e15
    const craterDiameter = 0.02 * Math.pow(energy, 1/3.4)
    const blastRadius = craterDiameter * 2.5
    const willAirburst = (d < 200 && s.speed > 11 && s.angle > 15)
    return { lat: latlng.lat, lng: latlng.lng, mass, energy, megatons, craterDiameter, blastRadius, willAirburst }
  }

  const handleImpact = (latlng) => {
    setImpact(latlng)
    setIsAnimating(true)
    setShowExplosion(false)
    
    // Asteroid flight time
    setTimeout(() => {
      setIsAnimating(false)
      setShowExplosion(true)
      
      // Show explosion briefly, then calculate results
      setTimeout(() => {
        const res = computeImpact(latlng)
        setResults(res)
        setShowExplosion(false)
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

  const handleSettingsChange = (partial) => {
    setSettings(prev => ({...prev,...partial}))
    if (impact) {
      const res = computeImpact(impact, {...settings,...partial})
      setResults(res)
    }
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
            Asteroid Launcher
          </h1>
          <p className="text-sm text-gray-500">Click anywhere on the map to simulate an impact.</p>
        </motion.div>

        <Controls settings={settings} onChange={handleSettingsChange} />

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
                    {showExplosion ? 'IMPACT!' : 'Impact Incoming!'}
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
          {results && !isAnimating && !showExplosion && (
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
          <MapClick onImpact={handleImpact} />
          
          {/* Animated Asteroid */}
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
                  {/* Asteroid trail */}
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
            <span className="text-lg">🎯</span>
            <small className="text-xs text-gray-600 font-medium">
              Click the map to place an impact. Adjust settings in the left panel.
            </small>
          </div>
        </motion.div>
      </main>
    </div>
  )
}