# Token Feedback Hub API Documentation

## Overview

The Token Feedback Hub provides a comprehensive API for managing community feedback within Farcaster frames. This documentation covers all available endpoints, data models, and integration patterns.

## Base URL

```
Production: https://your-app-domain.com
Development: http://localhost:5173
```

## Authentication

The API uses Farcaster frame validation for authentication. All frame interactions are validated using the Neynar API to ensure authenticity.

### Headers

```
Content-Type: application/json
Accept: application/json
```

## Data Models

### User

```typescript
interface User {
  userId: string;           // UUID
  farcasterId: string;      // Farcaster ID
  displayName: string;      // Display name
  avatarUrl?: string;       // Profile picture URL
}
```

### Feedback

```typescript
interface Feedback {
  feedbackId: string;       // UUID
  userId: string;           // User UUID
  title: string;            // Feedback title (max 255 chars)
  description: string;      // Detailed description
  proposedSolution?: string; // Optional solution
  impact?: string;          // Expected impact
  upvotes: number;          // Current upvote count
  hasUpvoted: boolean;      // Whether current user has upvoted
  createdAt: string;        // ISO timestamp
  castHash?: string;        // Optional Farcaster cast hash
  user: User;               // User who submitted feedback
}
```

### Vote

```typescript
interface Vote {
  voteId: string;           // UUID
  feedbackId: string;       // Feedback UUID
  userId: string;           // User UUID
  createdAt: string;        // ISO timestamp
}
```

## REST API Endpoints

### Feedback Management

#### GET /api/feedback

Retrieve all feedback items, sorted by creation date (newest first).

**Query Parameters:**
- `userId` (optional): Filter to show vote status for specific user
- `limit` (optional): Number of items to return (default: 50)
- `offset` (optional): Number of items to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "feedbackId": "uuid",
      "userId": "uuid",
      "title": "Improve Mobile Responsiveness",
      "description": "The current interface doesn't work well on mobile devices...",
      "proposedSolution": "Implement responsive design...",
      "impact": "Would make the platform accessible to mobile users...",
      "upvotes": 15,
      "hasUpvoted": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "userId": "uuid",
        "displayName": "Alice Chen",
        "avatarUrl": "https://example.com/avatar.jpg"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/feedback

Submit new feedback.

**Request Body:**
```json
{
  "title": "Feedback title",
  "description": "Detailed description of the issue or suggestion",
  "proposedSolution": "Optional solution description",
  "impact": "Expected impact of implementing this feedback",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "new-uuid",
    "userId": "user-uuid",
    "title": "Feedback title",
    "description": "Detailed description...",
    "proposedSolution": "Optional solution...",
    "impact": "Expected impact...",
    "upvotes": 0,
    "hasUpvoted": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "user": {
      "userId": "user-uuid",
      "displayName": "User Name",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

#### GET /api/feedback/:feedbackId

Get specific feedback item by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid",
    "userId": "uuid",
    "title": "Feedback title",
    "description": "Description...",
    "proposedSolution": "Solution...",
    "impact": "Impact...",
    "upvotes": 15,
    "hasUpvoted": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "user": {
      "userId": "uuid",
      "displayName": "User Name",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

#### DELETE /api/feedback/:feedbackId

Delete feedback (only by original author).

**Headers:**
```
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

### Voting

#### POST /api/feedback/:feedbackId/upvote

Upvote a feedback item.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid",
    "upvotes": 16,
    "hasUpvoted": true
  }
}
```

#### DELETE /api/feedback/:feedbackId/upvote

Remove upvote from a feedback item.

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedbackId": "uuid",
    "upvotes": 15,
    "hasUpvoted": false
  }
}
```

### User Management

#### GET /api/users/:userId

Get user profile information.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "farcasterId": "12345",
    "displayName": "User Name",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

#### PUT /api/users/:userId

Update user profile (only by the user themselves).

**Request Body:**
```json
{
  "displayName": "New Display Name",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "farcasterId": "12345",
    "displayName": "New Display Name",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }
}
```

## Farcaster Frame API

### Frame Endpoints

#### GET /api/frame

Main frame entry point. Returns HTML with frame metadata.

**Response:** HTML with Farcaster frame metadata

#### POST /api/frame/action

Handle frame button interactions.

**Request Body:**
```json
{
  "untrustedData": {
    "fid": 12345,
    "url": "https://example.com/api/frame",
    "messageHash": "0x...",
    "timestamp": 1234567890,
    "network": 1,
    "buttonIndex": 1,
    "inputText": "Optional input text",
    "castId": {
      "fid": 12345,
      "hash": "0x..."
    }
  },
  "trustedData": {
    "messageBytes": "0x..."
  }
}
```

**Response:** HTML with updated frame metadata

#### GET /api/frame/image/:type

Generate frame images for different states.

**Parameters:**
- `type`: Image type (`hub`, `submit`, `feedback`, `success`, `error`)

**Query Parameters:**
- Various parameters depending on image type

**Response:** PNG image

### Frame Image Types

1. **hub**: Main feedback hub view
2. **submit**: Feedback submission form
3. **feedback**: Individual feedback item view
4. **success**: Success confirmation
5. **error**: Error message display

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Feedback submission**: 5 requests per minute per user
- **Voting**: 10 requests per minute per user
- **General API**: 100 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Webhooks

### Feedback Events

Subscribe to feedback events by configuring webhook URLs in your environment:

```env
WEBHOOK_FEEDBACK_CREATED=https://your-app.com/webhooks/feedback-created
WEBHOOK_FEEDBACK_UPVOTED=https://your-app.com/webhooks/feedback-upvoted
```

#### Feedback Created

Triggered when new feedback is submitted.

**Payload:**
```json
{
  "event": "feedback.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "feedbackId": "uuid",
    "userId": "uuid",
    "title": "Feedback title",
    "description": "Description...",
    "user": {
      "userId": "uuid",
      "displayName": "User Name",
      "farcasterId": "12345"
    }
  }
}
```

#### Feedback Upvoted

Triggered when feedback receives an upvote.

**Payload:**
```json
{
  "event": "feedback.upvoted",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "feedbackId": "uuid",
    "voterId": "uuid",
    "totalUpvotes": 16,
    "feedback": {
      "title": "Feedback title",
      "userId": "uuid"
    }
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { TokenFeedbackHub } from '@token-feedback-hub/sdk'

const client = new TokenFeedbackHub({
  baseUrl: 'https://your-app-domain.com',
  apiKey: 'your-api-key' // Optional for public endpoints
})

// Get all feedback
const feedback = await client.feedback.list()

// Submit new feedback
const newFeedback = await client.feedback.create({
  title: 'Improve mobile experience',
  description: 'The mobile interface needs better touch targets',
  proposedSolution: 'Increase button sizes and improve spacing',
  impact: 'Better mobile user experience'
})

// Upvote feedback
await client.feedback.upvote(feedbackId, userId)
```

### cURL Examples

```bash
# Get all feedback
curl -X GET "https://your-app-domain.com/api/feedback" \
  -H "Accept: application/json"

# Submit feedback
curl -X POST "https://your-app-domain.com/api/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Improve mobile experience",
    "description": "The mobile interface needs better touch targets",
    "userId": "user-uuid"
  }'

# Upvote feedback
curl -X POST "https://your-app-domain.com/api/feedback/feedback-uuid/upvote" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'
```

## Integration Guide

### Setting Up Supabase

1. Create a new Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Configure Row Level Security policies
4. Set up environment variables

### Configuring Neynar API

1. Sign up for Neynar API access
2. Get your API key
3. Set up webhook endpoints for frame validation
4. Configure signer for posting casts (optional)

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Neynar API
VITE_NEYNAR_API_KEY=your_neynar_api_key
VITE_NEYNAR_BASE_URL=https://api.neynar.com/v2

# Application
VITE_APP_NAME=Token Feedback Hub
VITE_APP_URL=https://your-app-domain.com
VITE_FRAME_BASE_URL=https://your-app-domain.com
```

## Support

For API support and questions:

- Documentation: [Link to full documentation]
- GitHub Issues: [Link to GitHub repository]
- Discord: [Link to Discord server]
- Email: support@your-domain.com
