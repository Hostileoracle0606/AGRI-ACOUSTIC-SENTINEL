import React, { useState, useRef, useEffect } from 'react';
import axios from '../config/axios';
import { Upload, Mic, FileAudio, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AudioUpload = ({ fieldData, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [microphoneId, setMicrophoneId] = useState('');
  const [registeredMicrophones, setRegisteredMicrophones] = useState([]);
  const [establishBaseline, setEstablishBaseline] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMicrophones();
  }, []);

  const loadMicrophones = async () => {
    try {
      const response = await axios.get('/api/microphones');
      setRegisteredMicrophones(response.data || []);
      if (response.data && response.data.length > 0) {
        setMicrophoneId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading microphones:', error);
    }
  };

  useEffect(() => {
    if (fieldData?.fieldLayout?.microphones) {
      const mics = fieldData.fieldLayout.microphones.map((m) => ({
        id: m.id,
        name: m.name || `Microphone ${m.id}`
      }));
      setRegisteredMicrophones(mics);
      if (mics.length > 0 && !microphoneId) {
        setMicrophoneId(mics[0].id);
      }
    } else {
      loadMicrophones();
    }
  }, [fieldData]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please select an audio file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      setUploadProgress(0);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
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
      toast.error('Please select an audio file');
      return;
    }

    if (!microphoneId || registeredMicrophones.length === 0) {
      toast.error('Please register a microphone first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('microphoneId', microphoneId);
    if (establishBaseline) {
      formData.append('establishBaseline', 'true');
    }

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await axios.post('/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisResult(response.data.analysis);

      if (establishBaseline && response.data.baselineUpdated) {
        toast.success('Audio analyzed and baseline updated successfully!');
      } else {
        toast.success('Audio analysis completed successfully!');
      }

      onUploadComplete?.();

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      toast.error(`Failed to analyze audio file: ${errorMessage}`);
      setUploadProgress(0);

      setAnalysisResult({
        timestamp: new Date().toISOString(),
        confidence: 0.1,
        pestTypes: [],
        acousticFeatures: {
          frequency: 0,
          amplitude: 0,
          spectralCentroid: 0,
          zeroCrossingRate: 0
        },
        error: errorMessage,
        success: false
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getConfidenceTone = (confidence) => {
    if (confidence > 0.7) return 'border-danger-500/40 bg-danger-500/15 text-danger-500';
    if (confidence > 0.4) return 'border-warning-500/40 bg-warning-500/15 text-warning-500';
    return 'border-success-500/40 bg-success-500/15 text-success-500';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence > 0.7) return 'High Risk';
    if (confidence > 0.4) return 'Moderate Risk';
    return 'Low Risk';
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h3 className="text-xl font-semibold text-text">Audio Analysis Upload</h3>
        <p className="max-w-2xl text-sm text-text-muted">
          Upload recordings to trigger real-time bioacoustic analysis and baseline updates.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="card space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-text">Select Audio File</h4>
              <p className="text-sm text-text-muted">Drag &amp; drop or browse to upload an audio sample.</p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                selectedFile
                  ? 'border-success-500/50 bg-success-500/10'
                  : 'border-border/15 bg-surface-200/20 hover:border-border/25 hover:bg-surface-100/60'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-success-500" />
                  <div>
                    <p className="truncate text-sm font-medium text-text">{selectedFile.name}</p>
                    <p className="text-xs text-text-muted/80">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-sm font-medium text-danger-500 transition hover:text-danger-500/80"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-text-subtle/60" />
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-text">Drop audio file here</p>
                    <p className="text-sm text-text-muted">or click the button below to browse</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="audio-file-input"
                  />
                  <label htmlFor="audio-file-input" className="btn-primary inline-flex cursor-pointer gap-2">
                    <FileAudio className="h-4 w-4" />
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="card space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-text">Microphone Location</h4>
              <p className="text-sm text-text-muted">Route the analysis to a registered field microphone.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Mic className="h-4 w-4 text-text-subtle/70" />
                Select microphone
              </div>
              {registeredMicrophones.length === 0 ? (
                <div className="rounded-2xl border border-warning-500/40 bg-warning-500/10 p-4 text-sm text-warning-500">
                  No microphones registered. Please register an audio device first.
                </div>
              ) : (
                <>
                  <select
                    value={microphoneId}
                    onChange={(e) => setMicrophoneId(e.target.value)}
                    className="w-full rounded-xl border border-border/15 bg-surface-100/60 px-3 py-2 text-sm text-text focus:border-brand-500/40 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                  >
                    {registeredMicrophones.map((mic) => (
                      <option key={mic.id} value={mic.id}>
                        {mic.name || `Microphone ${mic.id}`}
                      </option>
                    ))}
                  </select>

                  <div className="rounded-2xl border border-border/10 bg-surface-200/20 p-4">
                    <label className="flex items-start gap-3 text-sm text-text">
                      <input
                        type="checkbox"
                        checked={establishBaseline}
                        onChange={(e) => setEstablishBaseline(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-border/40 text-brand-500 focus:ring-brand-500/40"
                      />
                      <span>
                        <span className="font-medium text-text">Use this audio to update baseline</span>
                        <p className="mt-1 text-xs text-text-muted">
                          Update the acoustic profile for this microphone using this recording. Recommended
                          after environmental changes.
                        </p>
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card space-y-4">
            <button
              type="button"
              onClick={uploadAudio}
              disabled={!selectedFile || isUploading}
              className={`btn btn-primary inline-flex w-full items-center justify-center gap-2 ${
                !selectedFile || isUploading ? 'cursor-not-allowed opacity-60' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing audio…
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload &amp; Analyze
                </>
              )}
            </button>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-text-muted">
                  <span>Upload Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200/40">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {analysisResult ? (
            <>
              <div className="card space-y-5">
                <div>
                  <h4 className="text-lg font-semibold text-text">Analysis Results</h4>
                  <p className="text-sm text-text-muted">
                    Snapshot of detection confidence, deviations, and processing context.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-text">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Detection Confidence</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getConfidenceTone(analysisResult.confidence)}`}>
                      {(analysisResult.confidence * 100).toFixed(1)}% · {getConfidenceLabel(analysisResult.confidence)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Baseline Deviation</span>
                    <span className="font-medium text-text">
                      {(analysisResult.baselineDeviation * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Analysis Time</span>
                    <span className="font-medium text-text">
                      {new Date(analysisResult.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Microphone</span>
                    <span className="font-medium text-brand-300">Mic #{microphoneId}</span>
                  </div>

                  {analysisResult.modelUsed && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">AI Model</span>
                      <span className="font-medium text-brand-200">{analysisResult.modelUsed}</span>
                    </div>
                  )}

                  {analysisResult.similarityScores &&
                    Object.keys(analysisResult.similarityScores).length > 0 && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Similarity Scores
                        </span>
                        <div className="mt-2 space-y-2 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-3 text-sm text-brand-100">
                          {Object.entries(analysisResult.similarityScores).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span>{key}</span>
                              <span className="font-semibold">{(value * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {analysisResult.transcription && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Audio Transcription
                      </span>
                      <div className="mt-2 rounded-2xl border border-border/10 bg-surface-200/30 p-3 text-sm text-text-muted">
                        {analysisResult.transcription}
                      </div>
                    </div>
                  )}

                  {analysisResult.error && (
                    <div className="rounded-2xl border border-warning-500/40 bg-warning-500/10 p-3 text-xs text-warning-500">
                      {analysisResult.error}
                    </div>
                  )}
                </div>
              </div>

              {analysisResult.pestTypes && analysisResult.pestTypes.length > 0 ? (
                <div className="card border-l-4 border-danger-500/80 bg-danger-500/5">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-danger-500" />
                    <h4 className="text-lg font-semibold text-danger-500">Pest Detection Alert</h4>
                  </div>
                  <div className="space-y-4">
                    {analysisResult.pestTypes.map((pest, idx) => (
                      <div key={idx} className="rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4 text-sm text-danger-100">
                        <div className="flex items-center justify-between text-danger-200">
                          <span className="font-semibold tracking-wide text-danger-100">
                            {pest.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span>{(pest.confidence * 100).toFixed(1)}% confidence</span>
                        </div>
                        <p className="mt-2 text-xs text-danger-200">
                          Severity score: {(pest.severity * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card border-l-4 border-success-500/80 bg-success-500/5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success-500" />
                    <h4 className="text-lg font-semibold text-success-500">No Pests Detected</h4>
                  </div>
                  <p className="mt-2 text-sm text-success-500/90">
                    The audio analysis indicates a healthy soundscape with no significant pest activity.
                  </p>
                </div>
              )}

              <div className="card">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-text">Acoustic Features</h4>
                  <p className="text-sm text-text-muted">
                    Numeric features extracted from the recording for model introspection.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-text">
                  <div className="rounded-2xl border border-border/10 bg-surface-200/30 p-4">
                    <span className="text-xs uppercase tracking-wide text-text-muted">Frequency</span>
                    <div className="mt-2 text-lg font-semibold">
                      {analysisResult.acousticFeatures.frequency.toFixed(0)} Hz
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/10 bg-surface-200/30 p-4">
                    <span className="text-xs uppercase tracking-wide text-text-muted">Amplitude</span>
                    <div className="mt-2 text-lg font-semibold">
                      {analysisResult.acousticFeatures.amplitude.toFixed(3)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/10 bg-surface-200/30 p-4">
                    <span className="text-xs uppercase tracking-wide text-text-muted">Spectral Centroid</span>
                    <div className="mt-2 text-lg font-semibold">
                      {analysisResult.acousticFeatures.spectralCentroid.toFixed(0)} Hz
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/10 bg-surface-200/30 p-4">
                    <span className="text-xs uppercase tracking-wide text-text-muted">
                      Zero Crossing Rate
                    </span>
                    <div className="mt-2 text-lg font-semibold">
                      {analysisResult.acousticFeatures.zeroCrossingRate.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center gap-4 py-12 text-center">
              <FileAudio className="h-12 w-12 text-text-subtle/60" />
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-text">Awaiting Audio Upload</h4>
                <p className="text-sm text-text-muted">
                  Upload a recording to view model predictions and acoustic metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-text">Upload Guidelines</h4>
          <p className="text-sm text-text-muted">
            Follow these recommendations to ensure clean, reliable model output.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/10 bg-surface-200/20 p-5">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Supported Formats
            </h5>
            <ul className="mt-3 space-y-2 text-sm text-text">
              <li>• WAV (preferred)</li>
              <li>• MP3</li>
              <li>• M4A</li>
              <li>• FLAC</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border/10 bg-surface-200/20 p-5">
            <h5 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Best Practices
            </h5>
            <ul className="mt-3 space-y-2 text-sm text-text">
              <li>• Record in quiet, consistent conditions</li>
              <li>• Minimum 10 seconds per sample</li>
              <li>• Maximum 10MB upload size</li>
              <li>• Avoid clipping or distorted audio</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioUpload;
