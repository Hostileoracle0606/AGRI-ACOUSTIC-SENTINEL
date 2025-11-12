import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Bug, Filter } from 'lucide-react';

const severityTone = (severity) => {
  if (severity > 0.7) {
    return {
      badge: 'border-danger-500/40 bg-danger-500/10 text-danger-400',
      rail: 'border-l-danger-500/70',
      label: 'Critical',
    };
  }

  if (severity > 0.4) {
    return {
      badge: 'border-warning-500/40 bg-warning-500/10 text-warning-400',
      rail: 'border-l-warning-500/70',
      label: 'Warning',
    };
  }

  return {
    badge: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
    rail: 'border-l-brand-500/60',
    label: 'Info',
  };
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

const getPestName = (pestType) => pestType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const pestIcon = (type) => {
  switch (type) {
    case 'bark_beetle':
      return '🪲';
    case 'aphid':
      return '🪰';
    case 'caterpillar':
      return '🐛';
    case 'grasshopper':
      return '🦗';
    default:
      return '🐞';
  }
};

const AlertCenter = ({ alerts = [] }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const filteredAlerts = useMemo(() => {
    if (filter === 'critical') {
      return alerts.filter((alert) => alert.severity > 0.7);
    }
    if (filter === 'warning') {
      return alerts.filter((alert) => alert.severity <= 0.7 && alert.severity > 0.4);
    }
    return alerts;
  }, [alerts, filter]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      if (sortBy === 'severity') {
        return b.severity - a.severity;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }, [filteredAlerts, sortBy]);

  const uniquePests = useMemo(() => {
    const pests = new Set();
    alerts.forEach((alert) => {
      alert.pestTypes?.forEach((pest) => pests.add(pest.type));
    });
    return pests.size;
  }, [alerts]);

  return (
    <section className="space-y-6">
      <div className="card card--flat flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger-500/10 text-lg text-danger-400">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-text">Alert Center</h3>
            <p className="text-sm text-text-muted">Real-time bioacoustic detections and response priorities</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-text-muted">
          <span className="rounded-full border border-danger-500/40 bg-danger-500/10 px-3 py-1 text-danger-400">
            {alerts.length} active
          </span>
          <span className="hidden sm:inline">alerts monitored</span>
        </div>
      </div>

      <div className="card card--flat flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All alerts</option>
            <option value="critical">Critical only</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-medium">Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="timestamp">Most recent</option>
            <option value="severity">Highest severity</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-text-muted">
          Showing {sortedAlerts.length} of {alerts.length}
        </div>
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="card card--flat flex flex-col items-center gap-3 py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-text-muted/60" />
          <h4 className="text-lg font-semibold text-text">No alerts</h4>
          <p className="max-w-sm text-sm text-text-muted">
            {alerts.length === 0
              ? 'No detections yet. Sensors are actively monitoring the field for pest activity.'
              : 'Try relaxing the filters to see additional detections.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedAlerts.map((alert) => {
            const tone = severityTone(alert.severity);
            return (
              <div
                key={alert.id}
                className={`card border-l-4 ${tone.rail} transition hover:border-l-[6px]`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className={`status-badge ${tone.badge}`}>
                        {tone.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Mic #{alert.microphoneId}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-base font-semibold text-text">Pest detection alert</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/20 bg-surface-150/60 p-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            Detected pests
                          </h5>
                          <div className="mt-3 space-y-2 text-sm">
                            {alert.pestTypes?.map((pest, index) => (
                              <div key={index} className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2">
                                  <span className="text-base">{pestIcon(pest.type)}</span>
                                  <span className="font-medium text-text">{getPestName(pest.type)}</span>
                                </span>
                                <span className="text-xs text-text-muted">
                                  {(pest.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            )) || (
                              <span className="text-sm text-text-muted">No pest metadata</span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/20 bg-surface-150/60 p-4">
                          <h5 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Alert metrics</h5>
                          <div className="mt-3 space-y-2 text-sm text-text">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Detection confidence</span>
                              <span className="font-semibold">{(alert.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Severity level</span>
                              <span className="font-semibold">{(alert.severity * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Coordinates</span>
                              <span className="font-semibold">
                                {alert.location
                                  ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`
                                  : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-text-subtle">
                      Alert ID {alert.id} · Generated {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-row items-center gap-2 md:flex-col md:items-end">
                    <button type="button" className="btn btn-secondary px-4 py-2 text-xs">
                      View details
                    </button>
                    <button type="button" className="btn btn-danger px-4 py-2 text-xs">
                      Mark resolved
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="card card--flat grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-danger-500/20 bg-danger-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-danger-400">
              {alerts.filter((alert) => alert.severity > 0.7).length}
            </p>
            <p className="text-sm text-danger-100/70">Critical alerts</p>
          </div>
          <div className="rounded-2xl border border-warning-500/20 bg-warning-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-warning-400">
              {alerts.filter((alert) => alert.severity <= 0.7 && alert.severity > 0.4).length}
            </p>
            <p className="text-sm text-warning-100/70">Warnings</p>
          </div>
          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-brand-300">{uniquePests}</p>
            <p className="text-sm text-brand-100/70">Unique pest types</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default AlertCenter;
