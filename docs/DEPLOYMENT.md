# Deployment Guide

This guide covers deploying Token Feedback Hub to production environments.

## Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project set up with schema deployed
- ✅ Neynar API key for Farcaster integration
- ✅ Domain name configured
- ✅ SSL certificate (handled by most platforms automatically)

## Environment Configuration

### Required Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Neynar API Configuration
VITE_NEYNAR_API_KEY=your_neynar_api_key
VITE_NEYNAR_BASE_URL=https://api.neynar.com/v2

# Application Configuration
VITE_APP_NAME=Token Feedback Hub
VITE_APP_URL=https://your-domain.com
VITE_FRAME_BASE_URL=https://your-domain.com
```

## Deployment Options

### 1. Vercel (Recommended)

Vercel provides excellent support for React applications with automatic deployments.

#### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all required environment variables

#### Vercel Configuration File

Create `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Netlify

Netlify is another excellent option for static site deployment.

#### Setup Steps

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Netlify Configuration File

Create `netlify.toml` in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

### 3. Docker Deployment

For containerized deployments on platforms like Railway, Render, or self-hosted.

#### Dockerfile

The project includes a production-ready Dockerfile:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Deploy

```bash
# Build the image
docker build -t token-feedback-hub .

# Run locally for testing
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e VITE_NEYNAR_API_KEY=your_key \
  token-feedback-hub

# Deploy to your container platform
docker push your-registry/token-feedback-hub
```

### 4. Railway

Railway provides simple deployment with automatic HTTPS.

#### Setup Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway deploy
   ```

3. **Set environment variables**
   ```bash
   railway variables set VITE_SUPABASE_URL=your_url
   railway variables set VITE_SUPABASE_ANON_KEY=your_key
   railway variables set VITE_NEYNAR_API_KEY=your_key
   ```

## Database Setup

### Supabase Configuration

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Deploy the database schema**
   - Open the SQL editor in Supabase
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

3. **Verify setup**
   - Check that all tables are created
   - Verify RLS policies are enabled
   - Test database connections

### Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- **Users**: Can view all profiles, update own profile
- **Feedback**: Anyone can view, authenticated users can create
- **Votes**: Anyone can view, authenticated users can vote

## API Integration

### Neynar API Setup

1. **Get API access**
   - Sign up at [neynar.com](https://neynar.com)
   - Create a new API key
   - Note the key for environment variables

2. **Configure frame validation**
   - Set up webhook endpoints for frame validation
   - Configure CORS for your domain

3. **Optional: Set up cast posting**
   - Create a signer for posting casts
   - Configure signer UUID in environment

## Domain Configuration

### DNS Setup

1. **Configure DNS records**
   ```
   Type: A
   Name: @
   Value: [Your platform's IP]
   
   Type: CNAME
   Name: www
   Value: your-domain.com
   ```

2. **SSL Certificate**
   - Most platforms handle SSL automatically
   - Verify HTTPS is working
   - Test frame functionality with HTTPS URLs

### Frame URLs

Ensure all frame URLs use HTTPS:

```env
VITE_FRAME_BASE_URL=https://your-domain.com
```

## Performance Optimization

### Build Optimization

1. **Enable build optimizations**
   ```json
   {
     "build": {
       "rollupOptions": {
         "output": {
           "manualChunks": {
             "vendor": ["react", "react-dom"],
             "supabase": ["@supabase/supabase-js"]
           }
         }
       }
     }
   }
   ```

2. **Enable compression**
   - Most platforms enable gzip automatically
   - Verify compression is working

### CDN Configuration

1. **Static asset caching**
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

2. **API response caching**
   ```
   Cache-Control: public, max-age=300, s-maxage=600
   ```

## Monitoring and Analytics

### Error Tracking

Consider integrating error tracking:

```bash
npm install @sentry/react @sentry/vite-plugin
```

### Performance Monitoring

Monitor key metrics:
- Page load times
- API response times
- Frame interaction success rates
- Database query performance

## Security Considerations

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use platform-specific secret management
- ✅ Rotate API keys regularly
- ✅ Use least-privilege access

### CORS Configuration

```javascript
// Ensure proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Rate Limiting

Implement rate limiting for API endpoints:

```javascript
// Example rate limiting configuration
const rateLimits = {
  feedback: '5 per minute',
  voting: '10 per minute',
  general: '100 per minute'
}
```

## Testing Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] API keys valid and working
- [ ] HTTPS enabled
- [ ] Frame URLs accessible
- [ ] CORS configured correctly

### Post-deployment Testing

1. **Basic functionality**
   - [ ] Application loads correctly
   - [ ] Feedback submission works
   - [ ] Upvoting functions properly
   - [ ] User authentication works

2. **Frame integration**
   - [ ] Frame metadata loads
   - [ ] Button interactions work
   - [ ] Images generate correctly
   - [ ] Farcaster client compatibility

3. **Performance**
   - [ ] Page load times < 3 seconds
   - [ ] API responses < 1 second
   - [ ] No console errors
   - [ ] Mobile responsiveness

## Troubleshooting

### Common Issues

**Build fails with environment variable errors**
- Ensure all required variables are set
- Check variable names match exactly
- Verify values are properly escaped

**Frame interactions don't work**
- Verify HTTPS is enabled
- Check CORS configuration
- Validate Neynar API key
- Test frame URLs are publicly accessible

**Database connection fails**
- Verify Supabase URL and key
- Check RLS policies are enabled
- Ensure database schema is deployed

**Upvotes don't update**
- Check database triggers are installed
- Verify RLS policies allow voting
- Test API endpoints directly

### Getting Help

If you encounter issues:

1. Check the [troubleshooting guide](../README.md#common-issues)
2. Review deployment logs
3. Test API endpoints directly
4. Contact support with specific error messages

## Maintenance

### Regular Tasks

- [ ] Monitor error rates and performance
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review and update RLS policies
- [ ] Backup database regularly

### Updates and Migrations

1. **Code updates**
   - Test in staging environment
   - Deploy during low-traffic periods
   - Monitor for errors post-deployment

2. **Database migrations**
   - Always backup before migrations
   - Test migrations in staging
   - Plan rollback procedures

---

**Need help with deployment? Contact our support team or check the community Discord.**
