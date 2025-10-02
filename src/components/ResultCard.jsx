import React from 'react'

export default function ResultCard({ results }){
  const { mass, energy, megatons, craterDiameter, blastRadius, willAirburst } = results
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-lg shadow">
      <h3 className="font-semibold">Results</h3>
      <ul className="mt-2 text-sm space-y-1">
        <li>Mass: <strong>{mass.toExponential(3)} kg</strong></li>
        <li>Energy: <strong>{energy.toExponential(3)} J</strong></li>
        <li>TNT-equivalent: <strong>{megatons.toFixed(1)} megatons</strong></li>
        <li>Estimated crater diameter: <strong>{Math.round(craterDiameter).toLocaleString()} m</strong></li>
        <li>Estimated blast radius: <strong>{Math.round(blastRadius).toLocaleString()} m</strong></li>
        <li>Event type: <strong>{willAirburst ? 'Likely airburst' : 'Ground impact possible'}</strong></li>
      </ul>
    </div>
  )
}