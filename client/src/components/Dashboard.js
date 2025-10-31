import React from 'react';
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

  // Generate mock time series data for the last 24 hours
  const generateTimeSeriesData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        confidence: Math.random() * 0.3 + 0.1,
        baselineDeviation: Math.random() * 0.2 + 0.05,
        pestActivity: Math.random() < 0.1 ? Math.random() * 0.8 + 0.2 : 0
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Generate pest type distribution data
  const pestDistribution = [
    { name: 'Bark Beetle', count: 3, color: '#ef4444' },
    { name: 'Aphid', count: 7, color: '#f59e0b' },
    { name: 'Caterpillar', count: 2, color: '#10b981' },
    { name: 'Grasshopper', count: 1, color: '#8b5cf6' }
  ];

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
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Field Monitoring Dashboard</h2>
        <p className="text-gray-600">Real-time bioacoustic analysis and pest detection</p>
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
            <p className="card-subtitle">Last 24 hours</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  name="Detection Confidence"
                />
                <Line 
                  type="monotone" 
                  dataKey="baselineDeviation" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Baseline Deviation"
                />
                <Line 
                  type="monotone" 
                  dataKey="pestActivity" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Pest Activity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pest Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pest Type Distribution</h3>
            <p className="card-subtitle">Detected species</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pestDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
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
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Microphone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Confidence</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Baseline Dev.</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentReadings).map(([micId, reading]) => (
                <tr key={micId} className="border-b border-gray-100">
                  <td className="py-3 px-4">Mic #{micId}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(reading.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reading.confidence > 0.7 ? 'bg-red-100 text-red-800' :
                      reading.confidence > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {(reading.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
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
            <div className="text-center py-8 text-gray-500">
              No recent readings available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
