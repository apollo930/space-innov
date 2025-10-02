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
    const res = computeImpact(latlng)
    setResults(res)
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
        <div>
          <h1 className="text-2xl font-bold">Asteroid Launcher</h1>
          <p className="text-sm text-gray-500">Click anywhere on the map to simulate an impact.</p>
        </div>

        <Controls settings={settings} onChange={handleSettingsChange} />

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity:0, y:8 }} animate={{opacity:1, y:0}} exit={{opacity:0, y:8}}
            >
              <ResultCard results={results} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto text-xs text-gray-400">
          Educational demo — approximate values only.
        </div>
      </aside>

      <main className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={2} className="h-full" whenCreated={m=>mapRef.current=m}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapClick onImpact={handleImpact} />
          {impact && (
            <>
              <Marker position={[impact.lat, impact.lng]} icon={impactIcon}>
                <Popup>
                  Impact site<br />Lat: {impact.lat.toFixed(3)} Lon: {impact.lng.toFixed(3)}
                </Popup>
              </Marker>
              {results && (
                <Circle center={[impact.lat, impact.lng]} radius={Math.max(1000, results.blastRadius)} pathOptions={{ color:'#ff6b6b', opacity:0.35 }} />
              )}
            </>
          )}
        </MapContainer>
        <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur rounded-lg p-2 shadow">
          <small className="text-xs text-gray-600">Click the map to place an impact. Adjust settings in the left panel.</small>
        </div>
      </main>
    </div>
  )
}