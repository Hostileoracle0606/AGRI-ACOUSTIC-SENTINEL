import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Self-host Leaflet styles to avoid tracking-prevention blocking

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const micIcon = new L.DivIcon({
  html: '<div style="background-color: #6366f1; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🎤</div>',
  className: 'custom-mic-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const alertIcon = new L.DivIcon({
  html: '<div style="background-color: #ef4444; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">🚨</div>',
  className: 'custom-alert-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const FieldMap = ({ fieldData, currentReadings }) => {
  const mapRef = useRef();

  const microphones = fieldData?.fieldLayout?.microphones || [];
  const fieldBounds = fieldData?.fieldLayout?.fieldBounds || {
    north: 40.7140,
    south: 40.7120,
    east: -74.0050,
    west: -74.0070,
  };

  const center = [
    (fieldBounds.north + fieldBounds.south) / 2,
    (fieldBounds.east + fieldBounds.west) / 2,
  ];

  const recentAlerts = fieldData?.alerts?.slice(0, 10) || [];

  const getMicrophoneStatus = (micId) => {
    const reading = currentReadings[micId];
    if (!reading) return 'inactive';

    if (reading.pestTypes?.length > 0) {
      return 'alert';
    } else if (reading.confidence > 0.4) {
      return 'warning';
    }
    return 'healthy';
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'alert':
        return {
          dot: 'bg-danger-400',
          badge: 'status-badge status-badge--critical',
          label: 'Alert',
          hint: '🔴 Pest Alert',
        };
      case 'warning':
        return {
          dot: 'bg-warning-400',
          badge: 'status-badge status-badge--warning',
          label: 'Warning',
          hint: '🟡 Elevated Activity',
        };
      case 'healthy':
        return {
          dot: 'bg-success-400',
          badge: 'status-badge status-badge--healthy',
          label: 'Healthy',
          hint: '🟢 Healthy',
        };
      default:
        return {
          dot: 'bg-border',
          badge: 'status-badge status-badge--warning',
          label: 'No Data',
          hint: '⚫ No Data',
        };
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="card-header">
        <div>
          <h3 className="card-title">Field Map & Sensor Network</h3>
          <p className="card-subtitle">Real-time monitoring of microphone sensors and pest activity</p>
        </div>
      </header>

      <div className="card h-[500px]">
        <MapContainer
          center={center}
          zoom={16}
          className="h-full w-full rounded-2xl"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <Circle
            center={center}
            radius={50}
            pathOptions={{
              color: '#6366f1',
              fillColor: '#6366f1',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5',
            }}
          />

          {microphones.map((mic) => {
            const status = getMicrophoneStatus(mic.id);
            const reading = currentReadings[mic.id];
            const { badge } = getStatusMeta(status);

            return (
              <Marker key={mic.id} position={[mic.lat, mic.lng]} icon={status === 'alert' ? alertIcon : micIcon}>
                <Popup>
                  <div className="space-y-3 text-text">
                    <h4 className="text-base font-semibold">Microphone #{mic.id}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted">Status:</span>
                        <span className={badge}>
                          {status === 'inactive' ? 'Inactive' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>

                      {reading && (
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Confidence:</span> {(reading.confidence * 100).toFixed(1)}%
                          </div>
                          <div>
                            <span className="font-medium">Baseline Dev:</span> {(reading.baselineDeviation * 100).toFixed(1)}%
                          </div>
                          <div className="text-text-muted">
                            <span className="font-medium">Last Update:</span> {new Date(reading.timestamp).toLocaleTimeString()}
                          </div>

                          {reading.pestTypes?.length > 0 && (
                            <div className="pt-2">
                              <span className="text-sm font-medium">Detected Pests:</span>
                              <ul className="mt-1 space-y-1 text-sm text-danger-400">
                                {reading.pestTypes.map((pest, idx) => (
                                  <li key={idx}>
                                    {pest.type.replace('_', ' ')} ({(pest.confidence * 100).toFixed(1)}%)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {recentAlerts.map((alert) => {
            const mic = microphones.find((m) => m.id === alert.microphoneId);
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
                  weight: 2,
                }}
              />
            );
          })}
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex flex-col gap-4">
          <div>
            <h4 className="card-title text-base">Map Legend & Examples</h4>
          </div>
          <div className="space-y-3 text-sm text-text-muted">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-success-400" />
              <div>
                <span className="font-medium text-text">Healthy Microphone</span>
                <p>Mic #4 · 15% confidence · Normal baseline</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-warning-400" />
              <div>
                <span className="font-medium text-text">Warning</span>
                <p>Mic #2 · 55% confidence · Elevated activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-danger-400" />
              <div>
                <span className="font-medium text-text">Alert</span>
                <p>Mic #1 & #3 · Pest detected · Action needed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full border-2 border-dashed border-brand-400" />
              <div>
                <span className="font-medium text-text">Field Boundary</span>
                <p>Monitoring area perimeter</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-danger-400/30" />
              <div>
                <span className="font-medium text-text">Alert Zone</span>
                <p>Recent pest activity areas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div>
            <h4 className="card-title text-base">Sensor Status Examples</h4>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {microphones.map((mic) => {
              const status = getMicrophoneStatus(mic.id);
              const reading = currentReadings[mic.id];
              const meta = getStatusMeta(status);

              return (
                <div key={mic.id} className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-150/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                    <div>
                      <span className="text-sm font-semibold text-text">Mic #{mic.id}</span>
                      <div className="text-xs text-text-muted">{meta.hint}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-text-muted">
                    {reading ? (
                      <>
                        <span className="rounded-full border border-brand-400/30 bg-brand-100/20 px-2 py-1 text-xs font-semibold text-brand-200">
                          {(reading.confidence * 100).toFixed(0)}%
                        </span>
                        {reading.pestTypes?.length > 0 && (
                          <span className="text-danger-400">{reading.pestTypes.length} pest(s)</span>
                        )}
                      </>
                    ) : (
                      <span>No data</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card flex flex-col gap-4 text-sm text-text-muted">
          <div>
            <h4 className="card-title text-base">Field Information</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Sensors:</span>
              <span className="font-semibold text-text">{microphones.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Alerts:</span>
              <span className="font-semibold text-danger-400">{recentAlerts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Field Size:</span>
              <span className="font-semibold text-text">~2 acres</span>
            </div>
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="font-semibold text-text">100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FieldMap;
