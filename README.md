# 🌾 Agri-Acoustic Sentinel

**AI-powered bioacoustic pest detection for sustainable agriculture**

Agri-Acoustic Sentinel is an innovative system that applies the CIA's "Spy the Lie" methodology to agriculture, using bioacoustic analysis and machine learning to detect pest infestations in crop fields before they become visible to the naked eye.

## 🎯 Project Overview

Drawing inspiration from the CIA's sophisticated lie detection methods, this project implements a holistic approach to pest detection:

### Core Principles
1. **Establishing a Baseline**: The system learns the normal acoustic patterns of a healthy ecosystem
2. **Detecting Behavioral Hot Spots**: AI identifies clusters of acoustic deviations that indicate pest activity
3. **Multi-modal Analysis**: Combines frequency analysis, amplitude detection, and spectral analysis

### Scientific Problem
Monitor crop field health by listening for the subtle biological "tells" of insect pests using bioacoustics - the study of biological sounds in nature.

## 🏗️ Architecture

### Frontend (React)
- **Dashboard**: Real-time monitoring with metrics and charts
- **Field Map**: Interactive map showing microphone locations and pest activity
- **Alert Center**: Comprehensive alert management system
- **Audio Upload**: Manual audio analysis interface
- **Baseline Manager**: Establish and monitor healthy acoustic baselines

### Backend (Node.js + Express)
- **Audio Processing**: Handles audio file uploads and preprocessing
- **Replicate API Integration**: Leverages AI models for bioacoustic analysis
- **Real-time Communication**: WebSocket connections for live updates
- **Baseline Management**: Stores and manages healthy acoustic profiles

### AI Integration (Replicate)
- **Bioacoustic Analysis**: Processes audio to detect pest signatures
- **Pattern Recognition**: Identifies deviations from healthy baselines
- **Pest Classification**: Categorizes detected pests by type and severity

## 🚀 Features

### Real-time Monitoring
- Live audio analysis from field microphones
- Real-time alerts for pest detection
- Interactive field map with sensor status
- Comprehensive dashboard with key metrics

### Advanced Analytics
- Baseline establishment and comparison
- Acoustic feature extraction (frequency, amplitude, spectral centroid)
- Pest type classification and confidence scoring
- Historical trend analysis

### Alert System
- Multi-level severity classification (Info, Warning, Critical)
- Real-time notifications via WebSocket
- Detailed alert history and filtering
- Location-based alert mapping

### Data Visualization
- Interactive charts and graphs
- Field heatmaps showing pest activity
- Time-series analysis of acoustic patterns
- Microphone status monitoring

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
- **Replicate API** - AI model integration
- **Node-cron** - Scheduled tasks

### AI/ML
- **Replicate API** - Cloud-based ML models
- **Bioacoustic Analysis** - Audio feature extraction
- **Pattern Recognition** - Pest signature detection
- **Baseline Comparison** - Deviation analysis

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Replicate API account and token

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agri-acoustic-sentinel
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `.env` and add your Replicate API token:
   ```
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## 🎮 Usage

### Getting Started

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The dashboard will show real-time field monitoring data

2. **Establish Baselines**
   - Go to the "Baseline" tab
   - Select a microphone and establish a healthy acoustic baseline
   - The system will learn normal patterns for each sensor

3. **Monitor Field Health**
   - Use the "Dashboard" to view real-time metrics
   - Check the "Field Map" for sensor locations and status
   - Review "Alerts" for any pest detection notifications

4. **Upload Audio for Analysis**
   - Use the "Audio Upload" tab to manually analyze audio files
   - Supported formats: WAV, MP3, M4A, FLAC
   - View detailed analysis results and pest detection information

### Key Features Usage

#### Real-time Monitoring
- The system automatically processes audio from field microphones
- Alerts are generated when pest activity is detected
- All data is displayed in real-time across the dashboard

#### Baseline Management
- Establish baselines for each microphone location
- Monitor deviations from healthy acoustic patterns
- View baseline comparison charts and statistics

#### Alert Management
- Filter alerts by severity level (Critical, Warning, Info)
- Sort alerts by timestamp or severity
- View detailed pest detection information

## 🔧 Configuration

### Microphone Network
The system supports configurable microphone networks. Edit `server/index.js` to modify:
- Microphone locations (latitude/longitude)
- Field boundaries
- Sensor configuration

### Alert Thresholds
Customize detection sensitivity by modifying:
- Confidence thresholds in the analysis logic
- Severity classification levels
- Alert generation criteria

### Replicate API Models
To use custom bioacoustic models:
1. Train your model on Replicate
2. Update the model reference in `server/index.js`
3. Modify the analysis function to use your specific model

## 📊 Data Flow

1. **Audio Collection**: Microphones capture ambient audio 24/7
2. **Audio Processing**: Raw audio is processed and features are extracted
3. **AI Analysis**: Replicate API analyzes acoustic patterns for pest signatures
4. **Baseline Comparison**: Current readings are compared against established baselines
5. **Alert Generation**: Deviations trigger alerts with confidence scores
6. **Real-time Updates**: WebSocket connections push updates to the frontend
7. **Visualization**: Data is displayed across multiple dashboard views

## 🧪 Testing

### Manual Testing
1. Upload test audio files through the Audio Upload interface
2. Verify analysis results and confidence scores
3. Check real-time updates on the dashboard
4. Test alert generation with various audio samples

### Simulated Data
The system includes simulated data generation for demonstration:
- Mock microphone readings every 30 seconds
- Simulated pest detection (5% probability)
- Realistic acoustic feature data

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: Native mobile application for field monitoring
- **Weather Integration**: Correlate acoustic data with weather conditions
- **Predictive Analytics**: Machine learning models for pest outbreak prediction
- **Multi-language Support**: Internationalization for global deployment
- **Advanced Visualizations**: 3D field mapping and augmented reality

### Technical Improvements
- **Database Integration**: Persistent storage for historical data
- **Cloud Deployment**: AWS/Azure deployment with auto-scaling
- **Edge Computing**: On-device processing for reduced latency
- **Machine Learning Pipeline**: Automated model training and deployment

## 🤝 Contributing

We welcome contributions to improve the Agri-Acoustic Sentinel system:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Guidelines
- Follow React best practices
- Use TypeScript for type safety
- Write comprehensive tests
- Document new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CIA's "Spy the Lie" methodology** - Inspiration for the baseline and hot spot detection approach
- **Replicate API** - Powerful AI model hosting and inference platform
- **React Community** - Excellent documentation and ecosystem
- **Agricultural Research** - Bioacoustic studies and pest detection research

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Agri-Acoustic Sentinel** - Transforming agriculture through AI-powered bioacoustic monitoring 🌾🤖🎤
