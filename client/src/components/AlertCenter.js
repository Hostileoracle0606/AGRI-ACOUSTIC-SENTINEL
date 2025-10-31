import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, Bug, Filter } from 'lucide-react';

const AlertCenter = ({ alerts }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.severity > 0.7;
    if (filter === 'warning') return alert.severity <= 0.7 && alert.severity > 0.4;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortBy === 'severity') {
      return b.severity - a.severity;
    }
    return 0;
  });

  const getSeverityColor = (severity) => {
    if (severity > 0.7) return 'text-red-600 bg-red-100';
    if (severity > 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getSeverityLabel = (severity) => {
    if (severity > 0.7) return 'Critical';
    if (severity > 0.4) return 'Warning';
    return 'Info';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getPestIcon = (pestType) => {
    switch (pestType) {
      case 'bark_beetle': return '🐛';
      case 'aphid': return '🦗';
      case 'caterpillar': return '🐛';
      case 'grasshopper': return '🦗';
      default: return '🐛';
    }
  };

  const getPestName = (pestType) => {
    return pestType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="alert-center">
      <div className="card-header mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="card-title">Alert Center</h3>
            <p className="card-subtitle">Real-time pest detection alerts and notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-lg font-semibold text-red-600">{alerts.length}</span>
            <span className="text-sm text-gray-600">alerts</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Time</option>
              <option value="severity">Severity</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Showing {sortedAlerts.length} of {alerts.length} alerts
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {sortedAlerts.length === 0 ? (
          <div className="card text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h4>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? "No alerts have been generated yet. The system is monitoring for pest activity."
                : "No alerts match the current filter criteria."
              }
            </p>
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <div key={alert.id} className="card border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(alert.timestamp)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      Mic #{alert.microphoneId}
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">
                    Pest Detection Alert
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Detected Pests:</h5>
                      <div className="space-y-1">
                        {alert.pestTypes.map((pest, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-lg">{getPestIcon(pest.type)}</span>
                            <span className="text-sm font-medium">{getPestName(pest.type)}</span>
                            <span className="text-xs text-gray-600">
                              ({(pest.confidence * 100).toFixed(1)}% confidence)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Alert Details:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Confidence:</span>
                          <span className="font-medium">{(alert.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Severity Level:</span>
                          <span className="font-medium">{(alert.severity * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">
                            {alert.location ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Alert ID: {alert.id} • Generated: {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button className="btn btn-secondary text-xs px-3 py-1">
                    View Details
                  </button>
                  <button className="btn btn-danger text-xs px-3 py-1">
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <div className="card mt-6">
          <div className="card-header">
            <h4 className="card-title">Alert Statistics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity > 0.7).length}
              </div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.severity <= 0.7 && a.severity > 0.4).length}
              </div>
              <div className="text-sm text-gray-600">Warning Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(alerts.map(a => a.pestTypes.map(p => p.type)).flat()).size}
              </div>
              <div className="text-sm text-gray-600">Unique Pest Types</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
