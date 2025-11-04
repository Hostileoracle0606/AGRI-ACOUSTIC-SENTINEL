import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, AlertTriangle, Mic, TrendingUp } from 'lucide-react';

const Dashboard = ({ fieldData, currentReadings }) => {
  // Calculate metrics from current readings
  const totalMicrophones = fieldData?.fieldLayout?.microphones?.length || 4;
  const activeMicrophones = Object.keys(currentReadings).length;
  const activeAlerts = fieldData?.alerts?.filter(alert => 
    new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length || 0;
  
  const avgConfidence = Object.values(currentReadings).length > 0 
    ? Object.values(currentReadings).reduce((sum, reading) => sum + reading.confidence, 0) / Object.values(currentReadings).length
    : 0;

  // Generate demo time series data for acoustic analysis over time
  const generateTimeSeriesData = () => {
    // Always generate demo data for the graph
    const data = [];
    const now = new Date();
    
    // Generate 24 data points (one per hour for last 24 hours)
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Create realistic demo data with some variation
      const baseHour = (23 - i) % 24;
      const timeOfDayFactor = baseHour < 6 ? 0.3 : baseHour < 12 ? 0.5 : baseHour < 18 ? 0.7 : 0.4; // Lower activity at night
      
      // Confidence: varies between 0.1 and 0.8 with some peaks
      const confidence = Math.max(0.1, Math.min(0.8, 
        timeOfDayFactor * 0.6 + 
        Math.sin((baseHour / 24) * Math.PI * 2) * 0.2 + 
        Math.random() * 0.2
      ));
      
      // Baseline deviation: related to confidence but with some lag
      const baselineDeviation = Math.max(0.05, Math.min(0.4, 
        confidence * 0.5 + 
        Math.random() * 0.15
      ));
      
      // Pest activity: spikes when confidence is high and baseline deviation is high
      const pestActivity = confidence > 0.5 && baselineDeviation > 0.2
        ? confidence * 0.8 + Math.random() * 0.2
        : Math.max(0, confidence * 0.3 + Math.random() * 0.1);
      
      data.push({
        time: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        confidence: confidence,
        baselineDeviation: baselineDeviation,
        pestActivity: pestActivity
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Generate pest type distribution from real alerts
  const pestDistribution = React.useMemo(() => {
    const pestCounts = {};
    const recentAlerts = fieldData?.alerts?.filter(alert => 
      new Date(alert.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || [];
    
    recentAlerts.forEach(alert => {
      if (alert.pestTypes) {
        alert.pestTypes.forEach(pest => {
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
      color: colors[colorIndex++ % colors.length]
    }));
  }, [fieldData?.alerts]);

  const metrics = [
    {
      label: 'Active Microphones',
      value: activeMicrophones,
      total: totalMicrophones,
      icon: <Mic className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Alerts',
      value: activeAlerts,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Avg Confidence',
      value: `${(avgConfidence * 100).toFixed(1)}%`,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Field Health',
      value: activeAlerts === 0 ? 'Healthy' : activeAlerts < 3 ? 'Warning' : 'Critical',
      icon: <TrendingUp className="w-6 h-6" />,
      color: activeAlerts === 0 ? 'text-green-600' : activeAlerts < 3 ? 'text-yellow-600' : 'text-red-600',
      bgColor: activeAlerts === 0 ? 'bg-green-100' : activeAlerts < 3 ? 'bg-yellow-100' : 'bg-red-100'
    }
  ];

  return (
    <div className="dashboard" style={{ width: '100%', overflow: 'hidden' }}>
      <div className="dashboard-header" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Field Monitoring Dashboard</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Real-time bioacoustic analysis and pest detection</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className={`metric-icon ${metric.bgColor} ${metric.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              {metric.icon}
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
            {metric.total && (
              <div className="metric-change text-xs text-gray-500 mt-1">
                of {metric.total} total
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acoustic Analysis Over Time</h3>
            <p className="card-subtitle">Last 24 hours - Demo data</p>
          </div>
          <div className="h-80">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-color)"
                  />
                  <YAxis 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-color)"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    name="Detection Confidence"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baselineDeviation" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Baseline Deviation"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pestActivity" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Pest Activity"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-center">
                  <p className="text-sm">No data available</p>
                  <p className="text-xs mt-1">Register microphones to start monitoring</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pest Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pest Type Distribution</h3>
            <p className="card-subtitle">Detected species</p>
          </div>
          <div className="h-80">
            {pestDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pestDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-color)"
                  />
                  <YAxis 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    stroke="var(--border-color)"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar dataKey="count" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-center">
                  <p className="text-sm">No pest detections</p>
                  <p className="text-xs mt-1">Field appears healthy</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Readings */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Microphone Readings</h3>
          <p className="card-subtitle">Latest acoustic analysis results</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Microphone</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Timestamp</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Confidence</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Baseline Dev.</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentReadings).map(([micId, reading]) => (
                <tr key={micId} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="py-3 px-4" style={{ color: 'var(--text-primary)' }}>Mic #{micId}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                      background: reading.confidence > 0.7 ? 'rgba(255, 59, 48, 0.15)' :
                                  reading.confidence > 0.4 ? 'rgba(255, 204, 0, 0.15)' :
                                  'rgba(48, 209, 88, 0.15)',
                      color: reading.confidence > 0.7 ? 'var(--accent-red)' :
                             reading.confidence > 0.4 ? 'var(--accent-yellow)' :
                             'var(--accent-green)',
                      border: `1px solid ${reading.confidence > 0.7 ? 'rgba(255, 59, 48, 0.3)' :
                                              reading.confidence > 0.4 ? 'rgba(255, 204, 0, 0.3)' :
                                              'rgba(48, 209, 88, 0.3)'}`
                    }}>
                      {(reading.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                    {(reading.baselineDeviation * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    {reading.pestTypes?.length > 0 ? (
                      <span className="status-badge critical">
                        🚨 {reading.pestTypes.length} pest(s)
                      </span>
                    ) : (
                      <span className="status-badge healthy">
                        ✅ Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(currentReadings).length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No recent readings available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
