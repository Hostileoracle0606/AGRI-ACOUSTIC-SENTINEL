import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Mic } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom microphone icon
const micIcon = new L.DivIcon({
  html: '<div style="background-color: #3b82f6; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🎤</div>',
  className: 'custom-mic-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// Custom alert icon
const alertIcon = new L.DivIcon({
  html: '<div style="background-color: #ef4444; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🚨</div>',
  className: 'custom-alert-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const FieldMap = ({ fieldData, currentReadings }) => {
  const mapRef = useRef();

  const microphones = fieldData?.fieldLayout?.microphones || [];
  const fieldBounds = fieldData?.fieldLayout?.fieldBounds || {
    north: 40.7140,
    south: 40.7120,
    east: -74.0050,
    west: -74.0070
  };

  // Calculate center point
  const center = [
    (fieldBounds.north + fieldBounds.south) / 2,
    (fieldBounds.east + fieldBounds.west) / 2
  ];

  // Get latest alerts for visualization
  const recentAlerts = fieldData?.alerts?.slice(0, 10) || [];

  const getMicrophoneStatus = (micId) => {
    const reading = currentReadings[micId];
    if (!reading) return 'inactive';
    
    if (reading.pestTypes?.length > 0) {
      return 'alert';
    } else if (reading.confidence > 0.4) {
      return 'warning';
    } else {
      return 'healthy';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'alert': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'healthy': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="field-map">
      <div className="card-header mb-4">
        <h3 className="card-title">Field Map & Sensor Network</h3>
        <p className="card-subtitle">Real-time monitoring of microphone sensors and pest activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="card h-96">
            <MapContainer
              center={center}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Field boundary */}
              <Circle
                center={center}
                radius={50}
                pathOptions={{
                  color: '#667eea',
                  fillColor: '#667eea',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />

              {/* Microphones */}
              {microphones.map((mic) => {
                const status = getMicrophoneStatus(mic.id);
                const reading = currentReadings[mic.id];
                
                return (
                  <Marker
                    key={mic.id}
                    position={[mic.lat, mic.lng]}
                    icon={status === 'alert' ? alertIcon : micIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-lg mb-2">
                          Microphone #{mic.id}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <span className={`status-badge ${
                              status === 'alert' ? 'critical' :
                              status === 'warning' ? 'warning' : 'healthy'
                            }`}>
                              {status === 'alert' ? 'Alert' :
                               status === 'warning' ? 'Warning' : 'Healthy'}
                            </span>
                          </div>
                          
                          {reading && (
                            <>
                              <div className="text-sm">
                                <span className="font-medium">Confidence:</span> {(reading.confidence * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Baseline Dev:</span> {(reading.baselineDeviation * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Last Update:</span> {new Date(reading.timestamp).toLocaleTimeString()}
                              </div>
                              
                              {reading.pestTypes?.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm">Detected Pests:</span>
                                  <ul className="list-disc list-inside text-sm mt-1">
                                    {reading.pestTypes.map((pest, idx) => (
                                      <li key={idx} className="text-red-600">
                                        {pest.type.replace('_', ' ')} ({(pest.confidence * 100).toFixed(1)}%)
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Alert markers */}
              {recentAlerts.map((alert) => {
                const mic = microphones.find(m => m.id === alert.microphoneId);
                if (!mic) return null;
                
                return (
                  <Circle
                    key={`alert-${alert.id}`}
                    center={[mic.lat, mic.lng]}
                    radius={15}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.3,
                      weight: 2
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Legend and Info */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title text-lg">Map Legend & Examples</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Healthy Microphone</span>
                  <div className="text-xs text-gray-600">Mic #4: 15% confidence, Normal baseline</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Warning</span>
                  <div className="text-xs text-gray-600">Mic #2: 55% confidence, Elevated activity</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Alert</span>
                  <div className="text-xs text-gray-600">Mic #1 & #3: Pest detected, Action needed</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-dashed"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Field Boundary</span>
                  <div className="text-xs text-gray-600">Monitoring area perimeter</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full opacity-30"></div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Alert Zone</span>
                  <div className="text-xs text-gray-600">Recent pest activity areas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Status */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title text-lg">Sensor Status Examples</h4>
            </div>
            <div className="space-y-2">
              {microphones.map((mic) => {
                const status = getMicrophoneStatus(mic.id);
                const reading = currentReadings[mic.id];
                
                return (
                  <div key={mic.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Mic #{mic.id}</span>
                        <div className="text-xs text-gray-600">
                          {status === 'alert' && '🔴 Pest Alert'}
                          {status === 'warning' && '🟡 Elevated Activity'}
                          {status === 'healthy' && '🟢 Healthy'}
                          {!reading && '⚫ No Data'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {reading ? (
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full ${
                            status === 'alert' ? 'bg-red-100 text-red-800' :
                            status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {(reading.confidence * 100).toFixed(0)}%
                          </div>
                          {reading.pestTypes?.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {reading.pestTypes.length} pest(s)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field Info */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title text-lg">Field Information</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sensors:</span>
                <span className="font-medium">{microphones.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Alerts:</span>
                <span className="font-medium text-red-600">{recentAlerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Field Size:</span>
                <span className="font-medium">~2 acres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coverage:</span>
                <span className="font-medium">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldMap;
