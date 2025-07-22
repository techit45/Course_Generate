# GenCouce Deployment Guide

## Production Build

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_OPENROUTER_MODEL=anthropic/claude-3.5-haiku
NODE_ENV=production
```

### Local Production Build
```bash
# Install dependencies
npm install --legacy-peer-deps

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

### Docker Deployment
```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Or use Docker Compose
npm run docker:compose:build
```

### Performance Optimizations Included
- ✅ AI Response Caching with localStorage persistence
- ✅ Image optimization with WebP/AVIF support
- ✅ Lazy loading for images and components
- ✅ Bundle optimization and code splitting
- ✅ 3-second response time enforcement
- ✅ Performance monitoring and metrics
- ✅ Progressive loading for large datasets
- ✅ Memory management and cleanup

### Security Features
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Input validation and sanitization
- ✅ Error handling and fallback mechanisms
- ✅ Rate limiting protection
- ✅ Content Security Policy

### Production Checklist
- [ ] Environment variables configured
- [ ] OpenRouter API key valid
- [ ] Production build successful
- [ ] Performance metrics within targets
- [ ] Security headers enabled
- [ ] Error handling tested
- [ ] Cache mechanisms working
- [ ] Mobile responsiveness verified

### Monitoring
The application includes built-in performance monitoring:
- Response time tracking
- Cache hit rate monitoring  
- Memory usage alerts
- Error logging and reporting

### Deployment Platforms
Recommended platforms:
- **Vercel**: Native Next.js support
- **Netlify**: Static site generation
- **Railway**: Docker deployment
- **DigitalOcean**: VPS with Docker
- **AWS**: EC2 + ECS/EKS

### Support
For deployment issues, check:
1. Build logs for errors
2. Environment variable configuration
3. API key validity
4. Network connectivity to OpenRouter API