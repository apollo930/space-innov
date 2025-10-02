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
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapClick onImpact={handleImpact} />
          
          {/* Animated Asteroid */}
          {isAnimating && impact && (
            <motion.div
              className="absolute z-[1000] pointer-events-none"
              style={{
                left: '20%',
                top: '10%',
                width: '20px',
                height: '20px'
              }}
              animate={{
                left: '50%',
                top: '50%',
                scale: [0.5, 1.5, 0.8],
                rotate: [0, 720]
              }}
              transition={{
                duration: 1,
                ease: "easeIn"
              }}
            >
              <div className="w-5 h-5 bg-gradient-radial from-orange-400 via-red-500 to-orange-600 rounded-full shadow-lg animate-pulse" />
            </motion.div>
          )}
          
          {/* Explosion Effect */}
          {showExplosion && impact && (
            <motion.div
              className="absolute z-[1001] pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
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
          )}
          
          {impact && !isAnimating && !showExplosion && (
            <>
              <Marker position={[impact.lat, impact.lng]} icon={impactIcon}>
                <Popup>
                  Impact site<br />Lat: {impact.lat.toFixed(3)} Lon: {impact.lng.toFixed(3)}
                </Popup>
              </Marker>
              {results && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Circle 
                    center={[impact.lat, impact.lng]} 
                    radius={Math.max(1000, results.blastRadius)} 
                    pathOptions={{ 
                      color: results.megatons > 100 ? '#ef4444' : results.megatons > 10 ? '#f97316' : '#3b82f6', 
                      opacity: 0.4,
                      fillOpacity: 0.2
                    }} 
                  />
                </motion.div>
              )}
            </>
          )}
        </MapContainer>
        
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