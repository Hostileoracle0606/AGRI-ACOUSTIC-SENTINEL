# 🚀 Agri-Acoustic Sentinel Setup Guide

This guide will walk you through setting up the Agri-Acoustic Sentinel system for bioacoustic pest detection in agriculture.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- **Replicate API Account** - [Sign up here](https://replicate.com/)

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd agri-acoustic-sentinel
```

### 2. Install Dependencies

Run the following command to install all dependencies for both frontend and backend:

```bash
npm run install-all
```

This will install:
- Root project dependencies
- Backend server dependencies (Express, Socket.IO, Replicate, etc.)
- Frontend client dependencies (React, Tailwind, Recharts, etc.)

### 3. Environment Configuration

#### Backend Environment Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Copy the environment template:
   ```bash
   cp env.example .env
   ```

3. Edit the `.env` file and add your configuration:
   ```env
   # Replicate API Configuration
   REPLICATE_API_TOKEN=your_actual_replicate_token_here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Optional: AWS Configuration (for production)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=agri-acoustic-audio
   ```

#### Getting Your Replicate API Token

1. Go to [Replicate.com](https://replicate.com/) and create an account
2. Navigate to your account settings
3. Generate an API token
4. Copy the token and paste it in your `.env` file

### 4. Start the Application

#### Option 1: Using the Startup Scripts

**For Windows:**
```bash
start.bat
```

**For macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

#### Option 2: Manual Startup

1. Start the backend server:
   ```bash
   npm run server
   ```
   The backend will run on `http://localhost:5000`

2. In a new terminal, start the frontend:
   ```bash
   npm run client
   ```
   The frontend will run on `http://localhost:3000`

## 🌐 Accessing the Application

Once both servers are running:

1. **Open your browser** and navigate to `http://localhost:3000`
2. **You should see** the Agri-Acoustic Sentinel dashboard
3. **The connection status** should show "Connected" in the top-right corner

## 🎮 First Steps

### 1. Explore the Dashboard
- View real-time metrics and field monitoring data
- Check the connection status and system health

### 2. Establish Baselines
- Go to the "Baseline" tab
- Select a microphone (Mic #1 through #4)
- Click "Start Baseline" to establish healthy acoustic patterns
- Wait for the baseline establishment to complete

### 3. Monitor Field Health
- Use the "Field Map" to see microphone locations
- Check the "Dashboard" for real-time readings
- Review any alerts in the "Alert Center"

### 4. Test Audio Upload
- Go to the "Audio Upload" tab
- Upload a sample audio file (WAV, MP3, M4A, or FLAC)
- Select a microphone location
- Click "Upload & Analyze" to see bioacoustic analysis results

## 🔍 Understanding the System

### Real-time Data Flow
1. **Simulated Data**: The system generates mock microphone readings every 30 seconds
2. **Pest Detection**: Randomly simulates pest detection (5% probability)
3. **Alert Generation**: Creates alerts when pest activity is detected
4. **Real-time Updates**: All data updates in real-time across the dashboard

### Key Features to Explore

#### Dashboard Tab
- **Metrics Grid**: Shows active microphones, alerts, confidence levels
- **Time Series Charts**: Displays acoustic analysis over time
- **Pest Distribution**: Bar chart of detected pest types
- **Recent Readings**: Table of latest microphone data

#### Field Map Tab
- **Interactive Map**: Shows microphone locations and field boundaries
- **Status Indicators**: Color-coded microphone health status
- **Alert Zones**: Red circles around microphones with active alerts
- **Sensor Information**: Detailed status for each microphone

#### Alert Center Tab
- **Alert List**: All generated alerts with filtering options
- **Severity Levels**: Critical, Warning, and Info classifications
- **Pest Details**: Information about detected pest types
- **Alert Statistics**: Summary of alert metrics

#### Audio Upload Tab
- **File Upload**: Drag-and-drop or click to upload audio files
- **Microphone Selection**: Choose which microphone location
- **Analysis Results**: Detailed bioacoustic analysis output
- **Pest Detection**: Shows detected pests with confidence scores

#### Baseline Tab
- **Baseline Establishment**: Set up healthy acoustic patterns
- **Comparison Charts**: Baseline vs current readings
- **Microphone Status**: Track baseline establishment progress
- **Acoustic Profiles**: View detailed acoustic characteristics

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Connection Failed" Error
- **Check**: Backend server is running on port 5000
- **Solution**: Restart the backend server
- **Verify**: No other applications are using port 5000

#### 2. "Module Not Found" Errors
- **Check**: All dependencies are installed
- **Solution**: Run `npm run install-all` again
- **Verify**: You're in the correct directory

#### 3. Replicate API Errors
- **Check**: Your API token is correctly set in `.env`
- **Solution**: Verify token is valid and has sufficient credits
- **Note**: The demo uses simulated data, so API errors won't affect basic functionality

#### 4. Frontend Won't Load
- **Check**: Frontend server is running on port 3000
- **Solution**: Restart the frontend server
- **Verify**: No other applications are using port 3000

### Port Conflicts

If you encounter port conflicts:

1. **Change Backend Port**:
   - Edit `server/.env` and change `PORT=5000` to another port
   - Update `client/package.json` proxy setting

2. **Change Frontend Port**:
   - Set `PORT=3001` in your environment
   - Or use `npm start -- --port 3001`

## 🔧 Development Mode

### Making Changes

1. **Backend Changes**: The server automatically restarts when you modify files
2. **Frontend Changes**: The React app hot-reloads when you save files
3. **Real-time Updates**: WebSocket connections maintain live data flow

### File Structure

```
agri-acoustic-sentinel/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   ├── demo-replicate.js # Replicate API demo
│   └── package.json      # Backend dependencies
├── package.json          # Root package file
├── README.md            # Project documentation
└── SETUP.md            # This setup guide
```

## 🚀 Production Deployment

For production deployment, consider:

1. **Environment Variables**: Set proper production values
2. **Database**: Add persistent storage (PostgreSQL, MongoDB)
3. **File Storage**: Use AWS S3 or similar for audio files
4. **SSL/HTTPS**: Enable secure connections
5. **Monitoring**: Add logging and error tracking
6. **Scaling**: Use load balancers and multiple instances

## 📞 Support

If you encounter issues:

1. **Check the logs** in both terminal windows
2. **Review this setup guide** for common solutions
3. **Check the README.md** for detailed documentation
4. **Create an issue** on GitHub with error details

## 🎉 You're Ready!

Your Agri-Acoustic Sentinel system is now running! The system simulates real-world bioacoustic monitoring with:

- ✅ Real-time field monitoring
- ✅ AI-powered pest detection
- ✅ Interactive dashboard
- ✅ Alert management
- ✅ Baseline establishment
- ✅ Audio analysis capabilities

Start exploring the different tabs and features to understand how the system works. The simulated data will help you see how the system would behave in a real agricultural environment.
