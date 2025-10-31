import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Pause, Square, Settings, TrendingUp, Clock, Target, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BaselineManager = ({ fieldData }) => {
  const [isEstablishing, setIsEstablishing] = useState(false);
  const [selectedMicrophone, setSelectedMicrophone] = useState('1');
  const [baselineDuration, setBaselineDuration] = useState(168); // 1 week in hours
  const [baselineStatus, setBaselineStatus] = useState({});

  const microphones = fieldData?.fieldLayout?.microphones || [];
  const baselines = fieldData?.baseline || {};

  const establishBaseline = async () => {
    setIsEstablishing(true);
    
    try {
      const response = await axios.post('/api/establish-baseline', {
        microphoneId: selectedMicrophone,
        duration: baselineDuration
      });

      setBaselineStatus(prev => ({
        ...prev,
        [selectedMicrophone]: 'establishing'
      }));

      toast.success(`Baseline establishment started for Microphone #${selectedMicrophone}`);
      
      // Simulate baseline establishment process
      setTimeout(() => {
        setBaselineStatus(prev => ({
          ...prev,
          [selectedMicrophone]: 'completed'
        }));
        toast.success(`Baseline establishment completed for Microphone #${selectedMicrophone}`);
      }, 5000);

    } catch (error) {
      console.error('Error establishing baseline:', error);
      toast.error('Failed to establish baseline');
    } finally {
      setIsEstablishing(false);
    }
  };

  const getBaselineStatus = (micId) => {
    if (baselineStatus[micId]) return baselineStatus[micId];
    return baselines[micId] ? 'completed' : 'not_started';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'establishing': return 'text-yellow-600 bg-yellow-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
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

  // Generate mock baseline comparison data
  const generateBaselineData = () => {
    const data = [];
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    
    hours.forEach(hour => {
      data.push({
        time: hour,
        baseline: Math.random() * 0.3 + 0.1,
        current: Math.random() * 0.4 + 0.05,
        deviation: Math.random() * 0.2 + 0.02
      });
    });
    
    return data;
  };

  const baselineData = generateBaselineData();

  // Generate microphone comparison data
  const microphoneComparisonData = microphones.map(mic => {
    const baseline = baselines[mic.id];
    return {
      microphone: `Mic #${mic.id}`,
      baselineEstablished: baseline ? 'Yes' : 'No',
      avgFrequency: baseline?.acousticProfile?.averageFrequency || Math.random() * 1500 + 800,
      avgAmplitude: baseline?.acousticProfile?.averageAmplitude || Math.random() * 0.3 + 0.1,
      establishmentDate: baseline?.establishedAt ? new Date(baseline.establishedAt).toLocaleDateString() : 'Not established'
    };
  });

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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Microphone:
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {microphones.map(mic => (
                    <option key={mic.id} value={mic.id}>
                      Microphone #{mic.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours):
                </label>
                <select
                  value={baselineDuration}
                  onChange={(e) => setBaselineDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={24}>24 hours (1 day)</option>
                  <option value={72}>72 hours (3 days)</option>
                  <option value={168}>168 hours (1 week)</option>
                  <option value={336}>336 hours (2 weeks)</option>
                </select>
              </div>

              <button
                onClick={establishBaseline}
                disabled={isEstablishing || getBaselineStatus(selectedMicrophone) === 'establishing'}
                className={`btn w-full ${
                  isEstablishing || getBaselineStatus(selectedMicrophone) === 'establishing'
                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {getBaselineStatus(selectedMicrophone) === 'establishing' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Establishing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Baseline
                  </>
                )}
              </button>

              {baselines[selectedMicrophone] && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-800">Baseline Established</span>
                  </div>
                  <div className="text-sm text-green-700">
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
                return (
                  <div key={mic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(status)}</span>
                      <span className="font-medium">Mic #{mic.id}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
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
            </div>
          </div>

          {/* Microphone Comparison */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Microphone Acoustic Profiles</h4>
              <p className="card-subtitle">Average frequency and amplitude by microphone</p>
            </div>
            <div className="h-64">
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
            </div>
          </div>

          {/* Baseline Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(baselines).length}
              </div>
              <div className="text-sm text-gray-600">Established Baselines</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">
                {microphones.length - Object.keys(baselines).length}
              </div>
              <div className="text-sm text-gray-600">Pending Establishment</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(baselines).reduce((sum, baseline) => sum + baseline.duration, 0)}h
              </div>
              <div className="text-sm text-gray-600">Total Baseline Hours</div>
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
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Microphone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Established</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Amplitude</th>
                  </tr>
                </thead>
                <tbody>
                  {microphones.map(mic => {
                    const baseline = baselines[mic.id];
                    return (
                      <tr key={mic.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">Mic #{mic.id}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getBaselineStatus(mic.id))}`}>
                            {getBaselineStatus(mic.id).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {baseline ? new Date(baseline.establishedAt).toLocaleDateString() : 'Not established'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {baseline ? `${baseline.acousticProfile.averageFrequency.toFixed(0)} Hz` : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {baseline ? baseline.acousticProfile.averageAmplitude.toFixed(3) : '-'}
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
