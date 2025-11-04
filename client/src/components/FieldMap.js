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

      <div className="w-full">
        {/* Map - Full Width */}
        <div className="card" style={{ height: '500px' }}>
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
                      <div className="p-2" style={{ color: 'var(--text-primary)', minWidth: '200px' }}>
                        <h4 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                          Microphone #{mic.id}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status:</span>
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
                              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                <span className="font-medium">Confidence:</span> {(reading.confidence * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                <span className="font-medium">Baseline Dev:</span> {(reading.baselineDeviation * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <span className="font-medium">Last Update:</span> {new Date(reading.timestamp).toLocaleTimeString()}
                              </div>
                              
                              {reading.pestTypes?.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Detected Pests:</span>
                                  <ul className="list-disc list-inside text-sm mt-1">
                                    {reading.pestTypes.map((pest, idx) => (
                                      <li key={idx} style={{ color: 'var(--accent-red)' }}>
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
          
          {/* Legend and Info - Below Map */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" style={{ alignItems: 'stretch' }}>
          {/* Legend */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <h4 className="card-title" style={{ fontSize: '16px' }}>Map Legend & Examples</h4>
            </div>
            <div className="space-y-3" style={{ flex: '1 1 auto' }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent-green)' }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Healthy Microphone</span>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mic #4: 15% confidence, Normal baseline</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent-yellow)' }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Warning</span>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mic #2: 55% confidence, Elevated activity</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--accent-red)' }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Alert</span>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Mic #1 & #3: Pest detected, Action needed</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--accent-blue)'
                }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Field Boundary</span>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Monitoring area perimeter</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ 
                  backgroundColor: 'var(--accent-red)',
                  opacity: 0.3
                }}></div>
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Alert Zone</span>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recent pest activity areas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Status */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <h4 className="card-title" style={{ fontSize: '16px' }}>Sensor Status Examples</h4>
            </div>
            <div className="space-y-2" style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              {microphones.map((mic) => {
                const status = getMicrophoneStatus(mic.id);
                const reading = currentReadings[mic.id];
                const statusColor = getStatusColor(status);
                
                // Get status badge style
                const getBadgeStyle = () => {
                  if (status === 'alert') {
                    return {
                      background: 'rgba(255, 59, 48, 0.15)',
                      color: 'var(--accent-red)',
                      border: '1px solid rgba(255, 59, 48, 0.3)'
                    };
                  } else if (status === 'warning') {
                    return {
                      background: 'rgba(255, 204, 0, 0.15)',
                      color: 'var(--accent-yellow)',
                      border: '1px solid rgba(255, 204, 0, 0.3)'
                    };
                  } else {
                    return {
                      background: 'rgba(48, 209, 88, 0.15)',
                      color: 'var(--accent-green)',
                      border: '1px solid rgba(48, 209, 88, 0.3)'
                    };
                  }
                };
                
                return (
                  <div 
                    key={mic.id} 
                    className="flex items-center justify-between p-2 rounded"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      ></div>
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Mic #{mic.id}</span>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {status === 'alert' && '🔴 Pest Alert'}
                          {status === 'warning' && '🟡 Elevated Activity'}
                          {status === 'healthy' && '🟢 Healthy'}
                          {!reading && '⚫ No Data'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs">
                      {reading ? (
                        <div className="text-right">
                          <div 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={getBadgeStyle()}
                          >
                            {(reading.confidence * 100).toFixed(0)}%
                          </div>
                          {reading.pestTypes?.length > 0 && (
                            <div className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>
                              {reading.pestTypes.length} pest(s)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>No data</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field Info */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            <div className="card-header" style={{ flexShrink: 0 }}>
              <h4 className="card-title" style={{ fontSize: '16px' }}>Field Information</h4>
            </div>
            <div className="space-y-2 text-sm" style={{ flex: '1 1 auto' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total Sensors:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{microphones.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Active Alerts:</span>
                <span className="font-medium" style={{ color: 'var(--accent-red)' }}>{recentAlerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Field Size:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>~2 acres</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Coverage:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldMap;
