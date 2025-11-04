import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Pause, Square, Settings, TrendingUp, Clock, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BaselineManager = ({ fieldData }) => {
  const [isEstablishing, setIsEstablishing] = useState({});
  const [selectedMicrophone, setSelectedMicrophone] = useState('');
  const [baselineStatus, setBaselineStatus] = useState({});

  const microphones = fieldData?.fieldLayout?.microphones || [];
  const baselines = fieldData?.baseline || {};

  useEffect(() => {
    // Update establishing status based on baseline data
    const newEstablishing = {};
    const newStatus = {};
    microphones.forEach(mic => {
      const baseline = baselines[mic.id];
      if (baseline && baseline.isEstablishing) {
        newEstablishing[mic.id] = true;
        newStatus[mic.id] = 'establishing';
      } else if (baseline) {
        newStatus[mic.id] = 'completed';
      } else {
        newStatus[mic.id] = 'not_started';
      }
    });
    setIsEstablishing(newEstablishing);
    setBaselineStatus(newStatus);
    
    // Set default selected microphone
    if (!selectedMicrophone && microphones.length > 0) {
      setSelectedMicrophone(microphones[0].id);
    }
  }, [baselines, microphones]);

  const stopBaseline = async (micId) => {
    try {
      await axios.post('/api/establish-baseline', {
        microphoneId: micId,
        action: 'stop'
      });
      toast.success(`Baseline establishment stopped for microphone`);
    } catch (error) {
      console.error('Error stopping baseline:', error);
      toast.error('Failed to stop baseline establishment');
    }
  };

  const getBaselineStatus = (micId) => {
    if (baselineStatus[micId]) return baselineStatus[micId];
    return baselines[micId] ? 'completed' : 'not_started';
  };

  const getStatusColor = (status) => {
    // Return style object instead of class names for dark mode compatibility
    switch (status) {
      case 'completed': 
        return {
          background: 'rgba(48, 209, 88, 0.15)',
          color: 'var(--accent-green)',
          border: '1px solid rgba(48, 209, 88, 0.3)'
        };
      case 'establishing': 
        return {
          background: 'rgba(255, 204, 0, 0.15)',
          color: 'var(--accent-yellow)',
          border: '1px solid rgba(255, 204, 0, 0.3)'
        };
      case 'not_started': 
        return {
          background: 'rgba(174, 174, 178, 0.15)',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(174, 174, 178, 0.3)'
        };
      default: 
        return {
          background: 'rgba(174, 174, 178, 0.15)',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(174, 174, 178, 0.3)'
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'establishing': return '⏳';
      case 'not_started': return '⏸️';
      default: return '⏸️';
    }
  };

  // Generate real baseline comparison data from actual readings
  const baselineData = useMemo(() => {
    if (!selectedMicrophone || !baselines[selectedMicrophone]) {
      return [];
    }
    
    const baseline = baselines[selectedMicrophone];
    const data = [];
    
    // Get current readings for this microphone (from fieldData or currentReadings prop)
    const currentReadings = fieldData?.currentReadings || {};
    const reading = currentReadings[selectedMicrophone];
    
    if (reading && baseline.acousticProfile) {
      // Create comparison data from baseline vs current
      const profile = baseline.acousticProfile;
      const current = reading.acousticFeatures || {};
      
      data.push({
        time: 'Baseline',
        baseline: profile.averageFrequency || 0,
        current: current.frequency || 0,
        deviation: reading.baselineDeviation || 0
      });
    }
    
    return data;
  }, [selectedMicrophone, baselines, fieldData]);

  // Generate microphone comparison data from real baselines
  const microphoneComparisonData = useMemo(() => {
    return microphones.map(mic => {
      const baseline = baselines[mic.id];
      return {
        microphone: mic.name || `Mic #${mic.id}`,
        baselineEstablished: baseline ? 'Yes' : 'No',
        avgFrequency: baseline?.acousticProfile?.averageFrequency || 0,
        avgAmplitude: baseline?.acousticProfile?.averageAmplitude || 0,
        establishmentDate: baseline?.establishedAt ? new Date(baseline.establishedAt).toLocaleDateString() : 'Not established'
      };
    });
  }, [microphones, baselines]);

  return (
    <div className="baseline-manager">
      <div className="card-header mb-6">
        <h3 className="card-title">Baseline Management</h3>
        <p className="card-subtitle">Establish and monitor healthy acoustic baselines for each microphone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baseline Establishment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Establish New Baseline</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select Microphone:
                </label>
                {microphones.length === 0 ? (
                  <div className="p-4 rounded-md" style={{
                    border: '1px solid rgba(255, 204, 0, 0.3)',
                    background: 'rgba(255, 204, 0, 0.1)'
                  }}>
                    <p className="text-sm" style={{ color: 'var(--accent-yellow)' }}>
                      No microphones registered. Please register an audio device in the Microphones tab first.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedMicrophone}
                    onChange={(e) => setSelectedMicrophone(e.target.value)}
                    className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      focusRingColor: 'var(--accent-blue)'
                    }}
                  >
                    {microphones.map(mic => (
                      <option key={mic.id} value={mic.id}>
                        {mic.name || `Microphone ${mic.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p className="mb-2">
                  Baseline establishment starts automatically when a microphone is registered.
                  It records 1-second clips continuously and updates the baseline cumulatively.
                </p>
                {baselines[selectedMicrophone]?.isEstablishing && (
                  <div className="p-3 rounded-md" style={{
                    border: '1px solid rgba(255, 204, 0, 0.3)',
                    background: 'rgba(255, 204, 0, 0.1)'
                  }}>
                    <p style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>
                      <strong>Establishing baseline...</strong>
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Total seconds: {baselines[selectedMicrophone]?.totalSeconds || 0}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Sample count: {baselines[selectedMicrophone]?.sampleCount || 0}
                    </p>
                    <button
                      onClick={() => stopBaseline(selectedMicrophone)}
                      className="mt-2 px-3 py-1 text-xs rounded"
                      style={{
                        background: 'var(--accent-red)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                      }}
                    >
                      Stop Baseline
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Baseline establishment starts automatically when you register a microphone.
                The system continuously records and updates the baseline cumulatively.
              </div>

              {baselines[selectedMicrophone] && (
                <div className="p-3 rounded-lg" style={{
                  background: 'rgba(48, 209, 88, 0.1)',
                  border: '1px solid rgba(48, 209, 88, 0.3)'
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                    <span className="font-medium" style={{ color: 'var(--accent-green)' }}>Baseline Established</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div>Established: {new Date(baselines[selectedMicrophone].establishedAt).toLocaleDateString()}</div>
                    <div>Duration: {baselines[selectedMicrophone].duration} hours</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Microphone Status */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Microphone Status</h4>
            </div>
            <div className="space-y-3">
              {microphones.map(mic => {
                const status = getBaselineStatus(mic.id);
                const statusStyle = getStatusColor(status);
                return (
                  <div 
                    key={mic.id} 
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(status)}</span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Mic #{mic.id}</span>
                    </div>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={statusStyle}
                    >
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Baseline vs Current Comparison */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Baseline vs Current Readings</h4>
              <p className="card-subtitle">Daily acoustic pattern comparison</p>
            </div>
            <div className="h-64">
              {baselineData.length > 0 && selectedMicrophone ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={baselineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Baseline"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="current" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      name="Current"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="deviation" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Deviation"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                  <div className="text-center">
                    <p className="text-sm">No baseline data</p>
                    <p className="text-xs mt-1">Select a microphone with established baseline</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Microphone Comparison */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Microphone Acoustic Profiles</h4>
              <p className="card-subtitle">Average frequency and amplitude by microphone</p>
            </div>
            <div className="h-64">
              {microphoneComparisonData.length > 0 && microphoneComparisonData.some(d => d.avgFrequency > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={microphoneComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="microphone" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgFrequency" fill="#667eea" name="Avg Frequency (Hz)" />
                    <Bar dataKey="avgAmplitude" fill="#10b981" name="Avg Amplitude" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-secondary)' }}>
                  <div className="text-center">
                    <p className="text-sm">No baseline data</p>
                    <p className="text-xs mt-1">Establish baselines to see comparison</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Baseline Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-blue)' }}>
                {Object.keys(baselines).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Established Baselines</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>
                {microphones.length - Object.keys(baselines).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending Establishment</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: '#a78bfa' }}>
                {Object.values(baselines).reduce((sum, baseline) => sum + (baseline.totalSeconds || 0), 0)}s
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Baseline Seconds</div>
            </div>
          </div>

          {/* Baseline Details Table */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Baseline Details</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Microphone</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Status</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Established</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Avg Frequency</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Avg Amplitude</th>
                  </tr>
                </thead>
                <tbody>
                  {microphones.map(mic => {
                    const baseline = baselines[mic.id];
                    const statusStyle = getStatusColor(getBaselineStatus(mic.id));
                    return (
                      <tr key={mic.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <td className="py-3 px-4" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Mic #{mic.id}</td>
                        <td className="py-3 px-4">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={statusStyle}
                          >
                            {getBaselineStatus(mic.id).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {baseline ? new Date(baseline.establishedAt).toLocaleDateString() : 'Not established'}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                          {baseline ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{baseline.acousticProfile.averageFrequency.toFixed(0)} Hz</div>
                              {baseline.totalSeconds && (
                                <div className="text-xs" style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
                                  ({baseline.totalSeconds}s cumulative)
                                </div>
                              )}
                            </div>
                          ) : <span style={{ color: 'var(--text-tertiary)' }}>-</span>}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>
                          {baseline ? baseline.acousticProfile.averageAmplitude.toFixed(3) : <span style={{ color: 'var(--text-tertiary)' }}>-</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaselineManager;
