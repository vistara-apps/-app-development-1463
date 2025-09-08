# Technical Specifications

## Overview

Token Feedback Hub is a production-ready Farcaster mini-app built with React, Supabase, and integrated with the Neynar API for Farcaster frame functionality. This document outlines the complete technical architecture, implementation details, and production requirements.

## Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Farcaster     │    │   React App     │    │   Supabase      │
│   Clients       │◄──►│   (Frontend)    │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Neynar API    │
                       │   (Farcaster)   │
                       └─────────────────┘
```

### Component Architecture

```
src/
├── components/              # React UI Components
│   ├── FrameHeader.jsx     # Navigation header
│   ├── FeedbackForm.jsx    # Feedback submission form
│   └── FeedbackListItem.jsx # Individual feedback display
├── services/               # Business logic services
│   ├── feedbackService.js  # Feedback CRUD operations
│   ├── userService.js      # User management
│   └── frameService.js     # Farcaster frame handling
├── config/                 # Configuration
│   └── supabase.js        # Database configuration
└── App.jsx                # Main application component
```

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farcaster_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Feedback Table
```sql
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cast_hash VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    proposed_solution TEXT,
    impact TEXT,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Votes Table
```sql
CREATE TABLE votes (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES feedback(feedback_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feedback_id, user_id)
);
```

### TypeScript Interfaces

```typescript
interface User {
  userId: string;
  farcasterId: string;
  displayName: string;
  avatarUrl?: string;
}

interface Feedback {
  feedbackId: string;
  userId: string;
  title: string;
  description: string;
  proposedSolution?: string;
  impact?: string;
  upvotes: number;
  hasUpvoted: boolean;
  createdAt: string;
  castHash?: string;
  user: User;
}

interface Vote {
  voteId: string;
  feedbackId: string;
  userId: string;
  createdAt: string;
}
```

## API Specifications

### REST Endpoints

#### Feedback Management

**GET /api/feedback**
- Purpose: Retrieve all feedback items
- Parameters: `userId` (optional), `limit`, `offset`
- Response: Paginated list of feedback items
- Caching: 5 minutes

**POST /api/feedback**
- Purpose: Submit new feedback
- Body: `{ title, description, proposedSolution?, impact?, userId }`
- Response: Created feedback item
- Rate limit: 5 requests/minute per user

**POST /api/feedback/:id/upvote**
- Purpose: Upvote feedback item
- Body: `{ userId }`
- Response: Updated feedback with new upvote count
- Rate limit: 10 requests/minute per user

#### User Management

**GET /api/users/:userId**
- Purpose: Get user profile
- Response: User profile information
- Caching: 15 minutes

**PUT /api/users/:userId**
- Purpose: Update user profile
- Body: `{ displayName?, avatarUrl? }`
- Response: Updated user profile
- Authentication: Required (self only)

### Farcaster Frame API

**GET /api/frame**
- Purpose: Main frame entry point
- Response: HTML with frame metadata
- Headers: Frame-specific meta tags

**POST /api/frame/action**
- Purpose: Handle frame button interactions
- Body: Farcaster frame message
- Response: HTML with updated frame state
- Validation: Neynar API signature verification

**GET /api/frame/image/:type**
- Purpose: Generate frame images
- Parameters: `type` (hub, submit, feedback, success, error)
- Response: PNG image (1200x630px)
- Caching: 1 hour

## Service Layer

### FeedbackService

```javascript
class FeedbackService {
  async getFeedback(userId?: string): Promise<Feedback[]>
  async submitFeedback(data: FeedbackInput): Promise<Feedback>
  async upvoteFeedback(feedbackId: string, userId: string): Promise<Feedback>
  async removeFeedback(feedbackId: string, userId: string): Promise<boolean>
}
```

**Key Features:**
- Automatic fallback to mock data when Supabase unavailable
- Real-time upvote count updates via database triggers
- Comprehensive error handling and logging
- Vote status tracking per user

### UserService

```javascript
class UserService {
  async getCurrentUser(fid?: number): Promise<User>
  async getUserProfile(userId: string): Promise<UserProfile>
  async fetchUserFromNeynar(fid: number): Promise<NeynarUser>
  async updateUserProfile(userId: string, updates: UserUpdates): Promise<boolean>
}
```

**Key Features:**
- Automatic user creation from Farcaster data
- Neynar API integration for profile fetching
- Graceful fallback for missing API keys
- Profile caching and updates

### FrameService

```javascript
class FrameService {
  generateFrameMetadata(page: string, data?: object): FrameMetadata
  async validateFrameMessage(message: string): Promise<ValidationResult>
  async handleFrameAction(validatedMessage: ValidationResult): Promise<ActionResult>
  async postFeedbackAsCast(feedback: Feedback, userFid: number): Promise<string>
  generateFrameResponse(metadata: FrameMetadata, content?: string): string
}
```

**Key Features:**
- Complete Farcaster frame protocol implementation
- Neynar API integration for validation and casting
- Dynamic frame image generation
- Multi-state frame navigation

## Security Implementation

### Row Level Security (RLS)

**Users Table Policies:**
```sql
-- Users can view all profiles
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);
```

**Feedback Table Policies:**
```sql
-- Anyone can view feedback
CREATE POLICY "Anyone can view feedback" ON feedback
    FOR SELECT USING (true);

-- Authenticated users can create feedback
CREATE POLICY "Authenticated users can create feedback" ON feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Votes Table Policies:**
```sql
-- Anyone can view votes
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

-- Authenticated users can create votes
CREATE POLICY "Authenticated users can create votes" ON votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Input Validation

```javascript
const feedbackValidation = {
  title: {
    required: true,
    maxLength: 255,
    sanitize: true
  },
  description: {
    required: true,
    maxLength: 2000,
    sanitize: true
  },
  proposedSolution: {
    required: false,
    maxLength: 1000,
    sanitize: true
  },
  impact: {
    required: false,
    maxLength: 500,
    sanitize: true
  }
}
```

### Rate Limiting

```javascript
const rateLimits = {
  feedback_submission: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: 'Too many feedback submissions'
  },
  voting: {
    windowMs: 60 * 1000,
    max: 10,
    message: 'Too many vote attempts'
  },
  general_api: {
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many API requests'
  }
}
```

## Performance Specifications

### Frontend Performance

**Bundle Size Targets:**
- Initial bundle: < 500KB gzipped
- Vendor chunk: < 300KB gzipped
- Application chunk: < 200KB gzipped

**Loading Performance:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

**Runtime Performance:**
- Frame interactions: < 200ms response time
- Feedback submission: < 1s end-to-end
- Upvote actions: < 500ms response time

### Backend Performance

**Database Performance:**
- Feedback queries: < 100ms average
- User lookups: < 50ms average
- Vote operations: < 75ms average
- Connection pool: 10-20 connections

**API Response Times:**
- GET /api/feedback: < 200ms
- POST /api/feedback: < 500ms
- POST /api/feedback/:id/upvote: < 300ms
- Frame image generation: < 1s

### Caching Strategy

**Browser Caching:**
```
Static assets: Cache-Control: public, max-age=31536000, immutable
API responses: Cache-Control: public, max-age=300, s-maxage=600
Frame images: Cache-Control: public, max-age=3600
```

**Database Caching:**
- User profiles: 15 minutes
- Feedback lists: 5 minutes
- Vote counts: Real-time (no caching)

## Error Handling

### Error Types

```javascript
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR'
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "reason": "Title is required"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### Fallback Mechanisms

1. **Database Unavailable:** Fall back to mock data
2. **Neynar API Down:** Disable frame validation, continue with basic functionality
3. **Image Generation Fails:** Serve static placeholder images
4. **Network Errors:** Retry with exponential backoff

## Monitoring and Observability

### Key Metrics

**Application Metrics:**
- Active users (DAU/MAU)
- Feedback submissions per day
- Upvote interactions per day
- Frame interaction success rate

**Performance Metrics:**
- API response times (p50, p95, p99)
- Database query performance
- Error rates by endpoint
- Frame image generation times

**Business Metrics:**
- User engagement rate
- Feedback quality scores
- Community participation
- Feature adoption rates

### Logging Strategy

```javascript
const logLevels = {
  ERROR: 'error',    // System errors, API failures
  WARN: 'warn',      // Degraded performance, fallbacks
  INFO: 'info',      // User actions, system events
  DEBUG: 'debug'     // Detailed debugging information
}
```

**Log Structure:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "feedback-service",
  "action": "submit_feedback",
  "userId": "user-123",
  "feedbackId": "feedback-456",
  "duration": 245,
  "success": true
}
```

## Deployment Specifications

### Environment Requirements

**Production Environment:**
- Node.js 18+ LTS
- Memory: 512MB minimum, 1GB recommended
- CPU: 1 vCPU minimum, 2 vCPU recommended
- Storage: 10GB minimum
- Network: HTTPS required, CDN recommended

**Database Requirements:**
- PostgreSQL 14+ (via Supabase)
- Connection pooling enabled
- Row Level Security configured
- Automated backups enabled

### Configuration Management

**Environment Variables:**
```env
# Required
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_NEYNAR_API_KEY=NEYNAR_API_...
VITE_APP_URL=https://your-domain.com

# Optional
VITE_NEYNAR_BASE_URL=https://api.neynar.com/v2
VITE_FRAME_BASE_URL=https://your-domain.com
VITE_APP_NAME=Token Feedback Hub
```

### Build Configuration

**Vite Configuration:**
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

## Testing Strategy

### Unit Testing

**Coverage Targets:**
- Services: 90% coverage
- Components: 80% coverage
- Utilities: 95% coverage
- Overall: 85% coverage

**Test Structure:**
```javascript
describe('FeedbackService', () => {
  describe('getFeedback', () => {
    it('should return feedback list with vote status')
    it('should handle database errors gracefully')
    it('should fall back to mock data when offline')
  })
})
```

### Integration Testing

**API Testing:**
- All endpoints tested with real database
- Frame validation with Neynar API
- Error scenarios and edge cases
- Rate limiting behavior

**Database Testing:**
- RLS policy enforcement
- Trigger functionality
- Data integrity constraints
- Performance under load

### End-to-End Testing

**User Flows:**
1. Submit feedback → Verify in database → Check UI update
2. Upvote feedback → Verify count update → Check vote tracking
3. Frame interaction → Validate with Neynar → Process action

**Frame Testing:**
- Frame metadata generation
- Button interaction handling
- Image generation and caching
- Cross-client compatibility

## Compliance and Standards

### Web Standards

- **Accessibility:** WCAG 2.1 AA compliance
- **Performance:** Core Web Vitals targets met
- **Security:** OWASP Top 10 protections
- **Privacy:** GDPR/CCPA compliant data handling

### Farcaster Standards

- **Frame Protocol:** Full v2 compliance
- **Image Specifications:** 1200x630px, PNG format
- **Button Limits:** Maximum 4 buttons per frame
- **Input Handling:** Text input validation and sanitization

### Code Quality

- **ESLint:** Airbnb configuration with React rules
- **Prettier:** Consistent code formatting
- **TypeScript:** Strict mode enabled
- **Husky:** Pre-commit hooks for quality checks

---

This technical specification serves as the definitive guide for implementing, maintaining, and scaling the Token Feedback Hub application. All implementation details should align with these specifications to ensure consistency and reliability.
