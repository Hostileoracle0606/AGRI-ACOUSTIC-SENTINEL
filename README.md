# 🌾 Agri-Acoustic Sentinel

**AI-powered bioacoustic pest detection for sustainable agriculture**

> ⚠️ **Work in Progress**: This project is currently under active development. We are continuously testing, refining the UI, and optimizing ImageBind processing times. The system is functional but may have performance improvements and UI changes in upcoming releases.

Agri-Acoustic Sentinel is an innovative system that applies the CIA's "Spy the Lie" methodology to agriculture, using bioacoustic analysis and machine learning to detect pest infestations in crop fields before they become visible to the naked eye.

## 🎯 Project Overview

Drawing inspiration from the CIA's sophisticated lie detection methods, this project implements a holistic approach to pest detection:

### Core Principles
1. **Establishing a Baseline**: The system learns the normal acoustic patterns of a healthy ecosystem
2. **Detecting Behavioral Hot Spots**: AI identifies clusters of acoustic deviations that indicate pest activity
3. **Multi-modal Analysis**: Combines frequency analysis, amplitude detection, and spectral analysis

### Scientific Problem
Monitor crop field health by listening for the subtle biological "tells" of insect pests using bioacoustics - the study of biological sounds in nature.

## 🚧 Current Development Status

This version is actively being developed and tested. Key areas of focus:

- **UI/UX Improvements**: Continuously refining the dark mode interface, improving readability, and optimizing layout
- **Performance Optimization**: Working on reducing ImageBind processing and analysis times for faster audio analysis
- **Testing & Refinement**: Ongoing testing of the local ImageBind integration and system reliability
- **Feature Enhancement**: Adding new features and improving existing functionality based on testing feedback

## 🏗️ Architecture

### Frontend (React)
- **Dashboard**: Real-time monitoring with metrics, charts, and demo data visualization
- **Field Map**: Interactive map showing microphone locations and pest activity
- **Audio Upload**: Manual audio file analysis interface
- **Baseline Manager**: Establish and monitor healthy acoustic baselines
- **Microphone Manager**: Browser-based microphone detection and registration

### Backend (Node.js + Express)
- **Audio Processing**: Handles audio file uploads and preprocessing
- **Local ImageBind Integration**: Direct integration with Facebook's ImageBind model (no external API required)
- **Real-time Communication**: WebSocket connections for live updates
- **Baseline Management**: Stores and manages healthy acoustic profiles
- **Demo Data Generation**: Simulated data for testing and demonstration

### AI Integration (Local ImageBind)
- **ImageBind Model**: Facebook's open-source multimodal AI model running locally
- **Bioacoustic Analysis**: Processes audio to detect pest signatures using embeddings and similarity matching
- **Pattern Recognition**: Identifies deviations from healthy baselines
- **Pest Classification**: Categorizes detected pests by type and confidence

> **Note**: This version uses **local ImageBind** instead of Replicate API. No external API keys or cloud services are required for audio analysis.

## 🚀 Features

### Real-time Monitoring
- Live audio analysis from field microphones (demo mode)
- Real-time alerts for pest detection
- Interactive field map with sensor status
- Comprehensive dashboard with key metrics and visualizations

### Advanced Analytics
- Baseline establishment and comparison
- Acoustic feature extraction (frequency, amplitude, spectral centroid)
- Pest type classification and confidence scoring
- Historical trend analysis with demo data
- Time-series charts for acoustic patterns over 24 hours

### Alert System
- Multi-level severity classification (Info, Warning, Critical)
- Real-time notifications via WebSocket
- Location-based alert mapping

### Data Visualization
- Interactive charts and graphs (Recharts)
- Field maps showing microphone locations and status
- Time-series analysis of acoustic patterns
- Microphone status monitoring

### UI Features
- Dark mode with Apple.com-inspired aesthetic
- Responsive design optimized for various screen sizes
- Consistent color scheme and typography
- Efficient use of screen space

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Recharts** - Data visualization
- **React Leaflet** - Interactive maps
- **Lucide React** - Modern icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **Node-cron** - Scheduled tasks
- **Child Process** - Python script execution for ImageBind

### AI/ML (Local)
- **ImageBind** - Facebook's multimodal AI model (local installation)
- **PyTorch** - Deep learning framework (via Python)
- **Python 3.10+** - Required for ImageBind execution
- **Bioacoustic Analysis** - Audio feature extraction using embeddings
- **Pattern Recognition** - Pest signature detection via similarity matching
- **Baseline Comparison** - Deviation analysis

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.10 or higher
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hostileoracle0606/AGRI-ACOUSTIC-SENTINEL.git
   cd AGRI-ACOUSTIC-SENTINEL
   ```

2. **Install Node.js dependencies**
   ```bash
   npm run install-all
   ```
   Or install separately:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up ImageBind (Local AI Model)**
   
   **Windows:**
   ```bash
   cd server
   setup-imagebind.bat
   ```
   
   **Linux/Mac:**
   ```bash
   cd server
   chmod +x setup-imagebind.sh
   ./setup-imagebind.sh
   ```
   
   > See [server/IMAGEBIND_SETUP.md](server/IMAGEBIND_SETUP.md) for detailed setup instructions and troubleshooting.

4. **Environment Configuration (Optional)**
   
   The system works without API keys since we use local ImageBind. However, if you want to configure additional settings:
   ```bash
   cd server
   cp env.example .env
   ```
   
   > Note: No Replicate API token is needed for this version.

5. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Production Deployment Notes

- **Frontend → Backend URL**: Set `REACT_APP_API_BASE_URL` (and optional `REACT_APP_SOCKET_BASE_URL`) in your hosting provider to the publicly reachable backend root, e.g. `https://api.example.com`. The React build no longer defaults to `window.location.origin`, preventing the Netlify → Railway mismatch that caused buffering in production.
- **Runtime config file**: Alternatively, edit `client/public/app-config.json` (served with the build) and populate `apiBaseUrl`/`socketUrl`. The app loads this file at runtime so you can update endpoints without rebuilding. Leave values blank in Git; configure them in your deployment.
- **Runtime overrides**: Alternatively, inject `window.__APP_CONFIG__ = { apiBaseUrl: 'https://api.example.com' }` via an HTML snippet before loading the bundle if you need to configure the API endpoint without rebuilding.
- **CORS**: Ensure `FRONTEND_URL` (and/or `NETLIFY_URL`) is set on the backend so the Express CORS middleware will allow the deployed frontend domain.
- **Leaflet assets**: CDN styles are no longer required—the app imports `leaflet/dist/leaflet.css` from npm so browsers with tracking prevention (Edge/Safari) cannot block the map styles.

## 🎮 Usage

### Getting Started

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The dashboard will show demo data for field monitoring

2. **Upload Audio for Analysis**
   - Navigate to the "Audio Upload" tab
   - Select or drag-and-drop an audio file (WAV, MP3, M4A, FLAC)
   - The system will analyze the audio using local ImageBind
   - View detailed analysis results including pest detection confidence and acoustic features
   - Optionally, use the audio to establish a baseline for a microphone

3. **Establish Baselines**
   - Go to the "Baseline Management" tab
   - Select a microphone and upload audio clips to establish a healthy acoustic baseline
   - The system will learn normal patterns for each sensor
   - View baseline statistics and comparison charts

4. **Monitor Field Health**
   - Use the "Dashboard" to view real-time metrics and demo data
   - Check the "Field Map" for sensor locations and status
   - Review acoustic analysis charts showing trends over time

5. **Manage Microphones**
   - Click the connection status button (top right) to manage microphones
   - Detect and register browser-accessible audio devices
   - View registered microphones and their status

### Key Features Usage

#### Audio Analysis
- Upload audio files through the Audio Upload interface
- Analysis is performed locally using ImageBind (no internet required after setup)
- Results include pest detection confidence, acoustic features, and similarity scores
- Processing time may vary depending on audio length and system performance

#### Baseline Management
- Establish baselines by uploading audio clips from healthy field conditions
- Monitor deviations from healthy acoustic patterns
- View baseline comparison charts and statistics
- Baseline establishment is automatic when microphones are registered (demo mode)

#### Real-time Monitoring (Demo Mode)
- The system generates demo data for testing and demonstration
- Simulated microphone readings and pest detection alerts
- Real-time updates via WebSocket connections

## 🔧 Configuration

### Microphone Network
The system supports configurable microphone networks. Demo microphones are generated automatically. To customize:
- Edit `server/index.js` to modify demo microphone locations and field boundaries

### Alert Thresholds
Customize detection sensitivity by modifying:
- Confidence thresholds in the analysis logic
- Severity classification levels
- Alert generation criteria

### ImageBind Configuration
The system uses local ImageBind for analysis. Configuration options:
- Python script: `server/imagebind-local.py`
- Model checkpoint: Automatically downloaded on first use
- Processing settings: Adjustable in `server/replicate-integration.js`

## 📊 Data Flow

1. **Audio Collection**: Microphones capture ambient audio (or upload via UI)
2. **Audio Processing**: Raw audio is processed and prepared for analysis
3. **Local AI Analysis**: ImageBind model analyzes acoustic patterns for pest signatures (runs locally via Python)
4. **Baseline Comparison**: Current readings are compared against established baselines
5. **Alert Generation**: Deviations trigger alerts with confidence scores
6. **Real-time Updates**: WebSocket connections push updates to the frontend
7. **Visualization**: Data is displayed across multiple dashboard views

## ⚡ Performance Considerations

### Current Status
- **Processing Time**: ImageBind analysis can take several seconds to minutes depending on audio length and system resources
- **Optimization Work**: We are actively working on reducing processing and analysis times
- **GPU Acceleration**: Using a GPU can significantly speed up ImageBind processing (CUDA support)

### Tips for Faster Analysis
- Use shorter audio clips for faster processing
- Ensure Python environment and dependencies are properly installed
- Consider using GPU acceleration if available
- Monitor system resources during analysis

## 🧪 Testing

### Demo Mode
The system includes demo data generation for testing and demonstration:
- Mock microphone readings with realistic patterns
- Simulated pest detection based on demo baselines
- Time-series data for acoustic analysis charts
- Field map with sensor locations and status

### Manual Testing
1. Upload test audio files through the Audio Upload interface
2. Verify analysis results and confidence scores
3. Check real-time updates on the dashboard
4. Test baseline establishment with various audio samples
5. Verify microphone detection and registration

## 🔮 Future Enhancements

### Active Development Areas
- **Performance Optimization**: Reducing ImageBind processing times
- **UI Improvements**: Ongoing refinement of interface and user experience
- **Feature Enhancement**: Adding new capabilities based on testing feedback
- **Error Handling**: Improving robustness and error recovery

### Planned Features
- **Mobile App**: Native mobile application for field monitoring
- **Weather Integration**: Correlate acoustic data with weather conditions
- **Predictive Analytics**: Machine learning models for pest outbreak prediction
- **Database Integration**: Persistent storage for historical data
- **Advanced Visualizations**: Enhanced charts and 3D field mapping
- **Cloud Deployment**: Optional cloud deployment options

### Technical Improvements
- **Caching**: Implementing caching for faster repeated analyses
- **Batch Processing**: Processing multiple audio files efficiently
- **Edge Computing**: Optimized processing for edge devices
- **Model Optimization**: Fine-tuning ImageBind for bioacoustic use cases

## 🤝 Contributing

We welcome contributions to improve the Agri-Acoustic Sentinel system:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly** (especially UI changes and ImageBind integration)
5. **Submit a pull request**

### Development Guidelines
- Follow React best practices
- Test UI changes across different screen sizes
- Ensure ImageBind integration works correctly
- Document new features
- Follow the existing code style
- Note any performance improvements in your PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CIA's "Spy the Lie" methodology** - Inspiration for the baseline and hot spot detection approach
- **Facebook Research (ImageBind)** - Open-source multimodal AI model for audio analysis
- **React Community** - Excellent documentation and ecosystem
- **Agricultural Research** - Bioacoustic studies and pest detection research

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the documentation (especially [server/IMAGEBIND_SETUP.md](server/IMAGEBIND_SETUP.md) for setup help)
- Review existing issues for known problems

---

**Agri-Acoustic Sentinel** - Transforming agriculture through AI-powered bioacoustic monitoring 🌾🤖🎤

> **Version Note**: This version uses local ImageBind instead of Replicate API. See previous versions for Replicate API integration.
