import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, AlertTriangle, Mic, TrendingUp } from 'lucide-react';

const Dashboard = ({ fieldData, currentReadings }) => {
  const totalMicrophones = fieldData?.fieldLayout?.microphones?.length || 4;
  const activeMicrophones = Object.keys(currentReadings).length;
  const activeAlerts = fieldData?.alerts?.filter(
    (alert) => new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length || 0;

  const avgConfidence = Object.values(currentReadings).length > 0
    ?
      Object.values(currentReadings).reduce((sum, reading) => sum + reading.confidence, 0) /
      Object.values(currentReadings).length
    : 0;

  const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseHour = (23 - i) % 24;
      const timeOfDayFactor = baseHour < 6 ? 0.3 : baseHour < 12 ? 0.5 : baseHour < 18 ? 0.7 : 0.4;

      const confidence = Math.max(
        0.1,
        Math.min(
          0.8,
          timeOfDayFactor * 0.6 + Math.sin((baseHour / 24) * Math.PI * 2) * 0.2 + Math.random() * 0.2
        )
      );

      const baselineDeviation = Math.max(
        0.05,
        Math.min(0.4, confidence * 0.5 + Math.random() * 0.15)
      );

      const pestActivity =
        confidence > 0.5 && baselineDeviation > 0.2
          ? confidence * 0.8 + Math.random() * 0.2
          : Math.max(0, confidence * 0.3 + Math.random() * 0.1);

      data.push({
        time: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        confidence,
        baselineDeviation,
        pestActivity,
      });
    }

    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  const pestDistribution = useMemo(() => {
    const pestCounts = {};
    const recentAlerts =
      fieldData?.alerts?.filter(
        (alert) => new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ) || [];

    recentAlerts.forEach((alert) => {
      if (alert.pestTypes) {
        alert.pestTypes.forEach((pest) => {
          const pestName = pest.type?.replace('_', ' ') || 'Unknown';
          pestCounts[pestName] = (pestCounts[pestName] || 0) + 1;
        });
      }
    });

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1'];
    let colorIndex = 0;

    return Object.entries(pestCounts).map(([name, count]) => ({
      name,
      count,
      color: colors[colorIndex++ % colors.length],
    }));
  }, [fieldData?.alerts]);

  const metrics = [
    {
      label: 'Active Microphones',
      value: activeMicrophones,
      total: totalMicrophones,
      icon: <Mic className="h-5 w-5" />, 
      badgeClasses: 'text-brand-300 bg-brand-100/20 border-brand-400/40',
    },
    {
      label: 'Active Alerts',
      value: activeAlerts,
      icon: <AlertTriangle className="h-5 w-5" />, 
      badgeClasses: 'text-danger-400 bg-danger-50/20 border-danger-400/40',
    },
    {
      label: 'Avg Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      icon: <Activity className="h-5 w-5" />, 
      badgeClasses: 'text-success-400 bg-success-50/30 border-success-400/40',
    },
    {
      label: 'Field Health',
      value: activeAlerts === 0 ? 'Healthy' : activeAlerts < 3 ? 'Warning' : 'Critical',
      icon: <TrendingUp className="h-5 w-5" />,
      badgeClasses:
        activeAlerts === 0
          ? 'text-success-400 bg-success-50/30 border-success-400/40'
          : activeAlerts < 3
            ? 'text-warning-400 bg-warning-50/20 border-warning-400/40'
            : 'text-danger-400 bg-danger-50/25 border-danger-400/40',
    },
  ];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-text">Field Monitoring Dashboard</h2>
        <p className="text-xs font-medium text-text-muted">Real-time bioacoustic analysis and pest detection</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border ${metric.badgeClasses}`}>
              {metric.icon}
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
            {metric.total && (
              <div className="metric-change text-text-muted">of {metric.total} total</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Acoustic Analysis Over Time</h3>
              <p className="card-subtitle">Last 24 hours · Demo data</p>
            </div>
          </div>
          <div className="h-80">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#9ea7bd', fontSize: 12 }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <YAxis
                    tick={{ fill: '#9ea7bd', fontSize: 12 }}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 23, 38, 0.95)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(39, 48, 65, 0.8)',
                    }}
                  />
                  <Line type="monotone" dataKey="confidence" stroke="#6366f1" strokeWidth={2} name="Detection Confidence" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="baselineDeviation" stroke="#f59e0b" strokeWidth={2} name="Baseline Deviation" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pestActivity" stroke="#ef4444" strokeWidth={2} name="Pest Activity" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-text-muted">
                <div>
                  <p>No data available</p>
                  <p className="text-xs">Register microphones to start monitoring</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Pest Type Distribution</h3>
              <p className="card-subtitle">Detected species</p>
            </div>
          </div>
          <div className="h-80">
            {pestDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pestDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ea7bd', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <YAxis tick={{ fill: '#9ea7bd', fontSize: 12 }} stroke="rgba(255,255,255,0.1)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 23, 38, 0.95)',
                      borderRadius: '0.75rem',
                      border: '1px solid rgba(39, 48, 65, 0.8)',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-text-muted">
                <div>
                  <p>No pest detections</p>
                  <p className="text-xs">Field appears healthy</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Microphone Readings</h3>
            <p className="card-subtitle">Latest acoustic analysis results</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Microphone</th>
                <th>Timestamp</th>
                <th>Confidence</th>
                <th>Baseline Dev.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentReadings).map(([micId, reading]) => (
                <tr key={micId}>
                  <td className="text-text">Mic #{micId}</td>
                  <td>{new Date(reading.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${
                        reading.confidence > 0.7
                          ? 'border-danger-400/40 bg-danger-50/20 text-danger-400'
                          : reading.confidence > 0.4
                          ? 'border-warning-400/40 bg-warning-50/20 text-warning-400'
                          : 'border-success-400/40 bg-success-50/30 text-success-400'
                      }`}
                    >
                      {(reading.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>{(reading.baselineDeviation * 100).toFixed(1)}%</td>
                  <td>
                    {reading.pestTypes?.length > 0 ? (
                      <span className="status-badge status-badge--critical">
                        🚨 {reading.pestTypes.length} pest(s)
                      </span>
                    ) : (
                      <span className="status-badge status-badge--healthy">✅ Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(currentReadings).length === 0 && (
            <div className="py-8 text-center text-sm text-text-muted">No recent readings available</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
