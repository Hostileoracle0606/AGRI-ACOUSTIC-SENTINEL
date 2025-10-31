import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Mic, FileAudio, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AudioUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [microphoneId, setMicrophoneId] = useState('1');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Clear previous results when selecting a new file
      setSelectedFile(file);
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Clear previous results when dropping a new file
      setSelectedFile(file);
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const uploadAudio = async () => {
    if (!selectedFile) {
      toast.error('Please select an audio file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('microphoneId', microphoneId);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await axios.post('/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setAnalysisResult(response.data.analysis);
      toast.success('Audio analysis completed successfully!');
      
      // Keep results visible - only reset when new file is selected
      // Clear the selected file to allow new uploads but keep results
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to analyze audio file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.7) return 'text-red-600 bg-red-100';
    if (confidence > 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence > 0.7) return 'High Risk';
    if (confidence > 0.4) return 'Moderate Risk';
    return 'Low Risk';
  };

  return (
    <div className="audio-upload">
      <div className="card-header mb-6">
        <h3 className="card-title">Audio Analysis Upload</h3>
        <p className="card-subtitle">Upload audio recordings for bioacoustic pest detection analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* File Selection */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Select Audio File</h4>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <h5 className="font-medium text-gray-900">{selectedFile.name}</h5>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop audio file here</p>
                    <p className="text-sm text-gray-600">or click to browse</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-file-input"
                  />
                  <label
                    htmlFor="audio-file-input"
                    className="btn btn-primary cursor-pointer"
                  >
                    <FileAudio className="w-4 h-4" />
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Microphone Selection */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Microphone Location</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Select microphone:</span>
              </div>
              <select
                value={microphoneId}
                onChange={(e) => setMicrophoneId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Microphone #1 (North-West)</option>
                <option value="2">Microphone #2 (North-East)</option>
                <option value="3">Microphone #3 (South-West)</option>
                <option value="4">Microphone #4 (South-East)</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <div className="card">
            <button
              onClick={uploadAudio}
              disabled={!selectedFile || isUploading}
              className={`btn w-full ${
                !selectedFile || isUploading 
                  ? 'btn-secondary opacity-50 cursor-not-allowed' 
                  : 'btn-primary'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing Audio...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Analyze
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Upload Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analysisResult ? (
            <>
              {/* Analysis Overview */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Analysis Results</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Detection Confidence:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                      {(analysisResult.confidence * 100).toFixed(1)}% - {getConfidenceLabel(analysisResult.confidence)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Baseline Deviation:</span>
                    <span className="text-sm">
                      {(analysisResult.baselineDeviation * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Analysis Time:</span>
                    <span className="text-sm">
                      {new Date(analysisResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Microphone:</span>
                    <span className="text-sm text-blue-600 font-medium">
                      Mic #{microphoneId}
                    </span>
                  </div>
                  
                  
                  {analysisResult.modelUsed && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">AI Model:</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {analysisResult.modelUsed}
                      </span>
                    </div>
                  )}
                  
                  {analysisResult.similarityScores && Object.keys(analysisResult.similarityScores).length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Similarity Scores:</span>
                      <div className="text-sm text-gray-600 mt-1 p-2 bg-blue-50 rounded">
                        {Object.entries(analysisResult.similarityScores).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.transcription && (
                    <div className="mt-3">
                      <span className="font-medium text-sm">Audio Transcription:</span>
                      <div className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                        {analysisResult.transcription}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pest Detection */}
              {analysisResult.pestTypes && analysisResult.pestTypes.length > 0 ? (
                <div className="card border-l-4 border-l-red-500">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <h4 className="card-title text-red-700">Pest Detection Alert</h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {analysisResult.pestTypes.map((pest, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-800">
                            {pest.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-red-600">
                            {(pest.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                        <div className="text-sm text-red-700">
                          Severity: {(pest.severity * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card border-l-4 border-l-green-500">
                  <div className="card-header">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h4 className="card-title text-green-700">No Pests Detected</h4>
                    </div>
                  </div>
                  <p className="text-green-700">
                    The audio analysis indicates a healthy ecosystem with no significant pest activity detected.
                  </p>
                </div>
              )}

              {/* Acoustic Features */}
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Acoustic Features</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <div className="font-medium">{analysisResult.acousticFeatures.frequency.toFixed(0)} Hz</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Amplitude:</span>
                    <div className="font-medium">{analysisResult.acousticFeatures.amplitude.toFixed(3)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Spectral Centroid:</span>
                    <div className="font-medium">{analysisResult.acousticFeatures.spectralCentroid.toFixed(0)} Hz</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Zero Crossing Rate:</span>
                    <div className="font-medium">{analysisResult.acousticFeatures.zeroCrossingRate.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h4>
              <p className="text-gray-600">
                Upload an audio file to see bioacoustic analysis results and pest detection information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card mt-6">
        <div className="card-header">
          <h4 className="card-title">Upload Instructions</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Supported Formats:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• WAV (recommended)</li>
              <li>• MP3</li>
              <li>• M4A</li>
              <li>• FLAC</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Best Practices:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Record in quiet conditions</li>
              <li>• Minimum 10 seconds duration</li>
              <li>• Maximum 10MB file size</li>
              <li>• Clear audio without distortion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioUpload;
