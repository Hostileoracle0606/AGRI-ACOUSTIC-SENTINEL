# Deployment Guide

This guide covers deploying Agri-Acoustic Sentinel to various hosting platforms with ImageBind support.

## 🐳 Docker Deployment (Recommended)

Docker is the easiest way to deploy the application with all dependencies bundled.

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+ (optional, for docker-compose)

### Quick Start with Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Or build and run manually:**
   ```bash
   # Build the image
   docker build -t agri-acoustic-sentinel .
   
   # Run the container
   docker run -d \
     -p 5000:5000 \
     -v $(pwd)/server/uploads:/app/server/uploads \
     --name agri-sentinel \
     agri-acoustic-sentinel
   ```

3. **Access the application:**
   - Backend API: `http://localhost:5000`
   - Frontend: Build and serve separately or use a reverse proxy

### Production Docker Deployment

For production, use a reverse proxy (nginx) and configure environment variables:

```bash
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -v $(pwd)/server/uploads:/app/server/uploads \
  --restart unless-stopped \
  --name agri-sentinel \
  agri-acoustic-sentinel
```

## ☁️ Cloud Platform Deployment

### Heroku

1. **Create a `Procfile`:**
   ```
   web: cd server && node index.js
   ```

2. **Add buildpacks:**
   ```bash
   heroku buildpacks:add heroku/nodejs
   heroku buildpacks:add heroku/python
   ```

3. **Deploy:**
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

> **Note**: Heroku may have limitations with ImageBind due to slug size and build time. Consider using Docker on Heroku.

### Railway

1. **Connect your GitHub repository**
2. **Configure build settings:**
   - Build Command: `npm install && cd server && npm install`
   - Start Command: `cd server && node index.js`

3. **Set environment variables** (if needed)

### DigitalOcean App Platform

1. **Create a new app from GitHub**
2. **Configure build:**
   - Build Command: `npm install && cd server && npm install`
   - Run Command: `cd server && node index.js`

3. **Add environment variables**

### AWS (EC2, ECS, or Lambda)

#### EC2 Deployment

1. **Launch an EC2 instance** (recommended: Ubuntu 22.04, t3.medium or larger)

2. **SSH into the instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```

4. **Clone and deploy:**
   ```bash
   git clone https://github.com/Hostileoracle0606/AGRI-ACOUSTIC-SENTINEL.git
   cd AGRI-ACOUSTIC-SENTINEL
   docker-compose up -d
   ```

5. **Configure security group:**
   - Open port 5000 (or your chosen port)
   - Optionally set up nginx reverse proxy on port 80/443

#### ECS (Elastic Container Service)

1. **Build and push Docker image:**
   ```bash
   docker build -t agri-acoustic-sentinel .
   docker tag agri-acoustic-sentinel:latest your-ecr-repo/agri-acoustic-sentinel:latest
   docker push your-ecr-repo/agri-acoustic-sentinel:latest
   ```

2. **Create ECS task definition** (see `ecs-task-definition.json` example)

3. **Deploy to ECS cluster**

### Google Cloud Platform

#### Cloud Run (Serverless Containers)

1. **Build and push to Container Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/agri-acoustic-sentinel
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy agri-acoustic-sentinel \
     --image gcr.io/PROJECT-ID/agri-acoustic-sentinel \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 4Gi \
     --cpu 2
   ```

> **Note**: Cloud Run may timeout for long-running ImageBind processes. Consider using Cloud Run Jobs or Compute Engine.

#### Compute Engine (VM)

Follow similar steps to AWS EC2 deployment.

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file or set environment variables:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Python Configuration
PYTHONUNBUFFERED=1

# ImageBind Path (optional, defaults to ../ImageBind)
IMAGEBIND_PATH=/app/ImageBind

# Optional: Custom Python executable
PYTHON_PATH=/usr/bin/python3
```

### Docker Environment Variables

When running in Docker, these are set automatically:
- `NODE_ENV=production`
- `PYTHONUNBUFFERED=1`
- ImageBind path is set to `/app/ImageBind`

## 📊 Performance Optimization for Cloud

### Resource Recommendations

- **Minimum**: 2 CPU cores, 4GB RAM
- **Recommended**: 4 CPU cores, 8GB RAM
- **GPU Support**: Optional but recommended for faster ImageBind processing

### Memory Considerations

- ImageBind model loading: ~2-3GB RAM
- Node.js server: ~500MB RAM
- Audio processing: Varies by file size

### Optimization Tips

1. **Use GPU instances** when available (AWS p3, GCP GPU instances)
2. **Enable caching** for model checkpoints
3. **Limit concurrent requests** to prevent memory issues
4. **Use load balancing** for horizontal scaling

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store securely in hosting platform's secret management
3. **Firewall**: Restrict access to necessary ports only
4. **HTTPS**: Use reverse proxy (nginx) with SSL certificates
5. **File Upload Limits**: Configure max file size in multer

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] SSL/TLS certificates set up
- [ ] Reverse proxy configured (nginx/Apache)
- [ ] Database configured (if using persistent storage)
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] Resource limits configured
- [ ] Health checks configured
- [ ] Error handling and recovery tested

## 📝 Reverse Proxy Configuration (nginx)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🐛 Troubleshooting

### ImageBind Not Found

- Check that ImageBind is cloned in the correct path
- Verify Python environment is set up
- Check permissions on ImageBind directory

### Out of Memory Errors

- Increase container/host memory allocation
- Reduce concurrent request limits
- Consider using GPU instances

### Slow Processing

- Check CPU/memory usage
- Consider GPU acceleration
- Optimize audio file sizes before upload

## 📞 Support

For deployment issues:
- Check logs: `docker logs agri-sentinel` or hosting platform logs
- Verify environment variables
- Test ImageBind setup locally first
- Check resource allocation

