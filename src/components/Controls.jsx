import React from 'react'

export default function Controls({ settings, onChange }){
  return (
    <div className="space-y-3">
      <label className="block">
        <div className="text-sm font-medium">Diameter (m)</div>
        <input type="range" min="1" max="2000" value={settings.diam}
          onChange={e=>onChange({diam: Number(e.target.value)})}
          className="w-full" />
        <div className="text-xs text-gray-500">{settings.diam} m</div>
      </label>
      <label className="block">
        <div className="text-sm font-medium">Speed (km/s)</div>
        <input type="range" min="1" max="72" value={settings.speed}
          onChange={e=>onChange({speed: Number(e.target.value)})}
          className="w-full" />
        <div className="text-xs text-gray-500">{settings.speed} km/s</div>
      </label>
      <label className="block">
        <div className="text-sm font-medium">Impact angle (°)</div>
        <input type="range" min="1" max="89" value={settings.angle}
          onChange={e=>onChange({angle: Number(e.target.value)})}
          className="w-full" />
        <div className="text-xs text-gray-500">{settings.angle}°</div>
      </label>
      <label className="block">
        <div className="text-sm font-medium">Material</div>
        <select value={settings.density} onChange={e=>onChange({density: Number(e.target.value)})} className="w-full border rounded p-1">
          <option value={7874}>Iron (7,874 kg/m³)</option>
          <option value={3000}>Chondritic rock (3,000 kg/m³)</option>
          <option value={1000}>Icy (1,000 kg/m³)</option>
        </select>
      </label>
    </div>
  )
}