# LMS Architecture - Shopify + Express + MongoDB

## Overview

This LMS uses a **hybrid architecture** that leverages Shopify for commerce and authentication, while using a custom Express + MongoDB backend for learning management functionality.

## Architecture Diagram

```
┌─────────────────┐
│   Shopify       │
│   Marketplace   │
│                 │
│ • User Auth     │
│ • Products      │
│ • Orders        │
│ • Payments      │
└────────┬────────┘
         │
         │ Redirect with token
         │
┌────────▼─────────────────────────┐
│   Next.js React Frontend (LMS)   │
│                                   │
│ • Dashboard                      │
│ • Course Player                  │
│ • Progress Tracking              │
└────────┬──────────────────┬───────┘
         │                  │
         │                  │
    ┌────▼────┐      ┌──────▼──────┐
    │ Shopify │      │ Express API │
    │  API    │      │  + MongoDB  │
    └─────────┘      └─────────────┘
```

## Data Flow & Responsibilities

### 🛒 **Shopify (Commerce Layer)**

**What Shopify Handles:**
- ✅ **User Authentication** - Shopify Customer Accounts
- ✅ **Product Catalog** - Course products, descriptions, pricing
- ✅ **Order Management** - Purchase history, order status
- ✅ **Payment Processing** - Stripe, PayPal, etc.
- ✅ **Customer Data** - Name, email, address (basic profile)

**Why Shopify:**
- Robust e-commerce infrastructure
- Built-in payment processing
- Customer account management
- Product management UI
- Order fulfillment tracking

**API Integration:**
- Use Shopify Admin API to fetch products
- Use Shopify Customer API for user info
- Use Shopify Orders API for purchase history

### 🎓 **Express + MongoDB (LMS Layer)**

**What Your Backend Handles:**
- ✅ **Course Enrollment** - Link Shopify orders to course access
- ✅ **Learning Progress** - SCORM progress, completion status
- ✅ **Course Metadata** - SCORM URLs, admission IDs, course structure
- ✅ **Certificates** - Generate and store completion certificates
- ✅ **Learning Analytics** - Time spent, quiz scores, progress tracking
- ✅ **SCORM Tracking** - Detailed SCORM data (bookmarks, scores, etc.)

**Why Custom Backend:**
- Shopify doesn't support SCORM/LMS features natively
- Need custom data models for learning progress
- Real-time progress tracking requirements
- Complex learning analytics

**Database Schema (MongoDB):**
```javascript
// Users (synced from Shopify)
{
  shopifyCustomerId: String,
  email: String,
  name: String,
  createdAt: Date
}

// Enrollments (created when order is placed)
{
  userId: ObjectId,
  shopifyOrderId: String,
  shopifyProductId: String,
  courseId: String,
  enrolledAt: Date,
  status: 'active' | 'completed' | 'expired'
}

// Course Progress
{
  enrollmentId: ObjectId,
  courseId: String,
  progress: Number, // 0-100
  completed: Boolean,
  lastAccessedAt: Date,
  scormData: {
    score: Number,
    timeSpent: Number,
    bookmarks: Array,
    // ... other SCORM data
  }
}

// Courses (metadata)
{
  shopifyProductId: String,
  title: String,
  scormUrl: String,
  admissionId: String,
  thumbnail: String,
  description: String
}
```

### ⚛️ **Next.js Frontend (Presentation Layer)**

**What React Handles:**
- ✅ **UI/UX** - Dashboard, course player, progress visualization
- ✅ **Authentication Flow** - Handle Shopify redirect, store session
- ✅ **Data Aggregation** - Combine Shopify + Express data
- ✅ **SCORM Player** - Embed and track SCORM packages

## Integration Flow

### 1. User Purchase Flow
```
User buys course on Shopify
    ↓
Shopify webhook → Express backend
    ↓
Backend creates enrollment record
    ↓
User redirected to LMS with token
    ↓
LMS fetches enrollment from Express API
```

### 2. User Login Flow
```
User clicks "My Courses" on Shopify
    ↓
Shopify redirects to LMS with auth token
    ↓
LMS validates token with Shopify
    ↓
LMS fetches user's enrollments from Express API
    ↓
LMS displays courses with progress
```

### 3. Course Access Flow
```
User clicks course
    ↓
LMS checks enrollment status (Express API)
    ↓
If enrolled → Load SCORM player
    ↓
SCORM sends progress updates → Express API
    ↓
Express stores progress in MongoDB
```

## API Endpoints Needed

### Express Backend Endpoints

**Authentication:**
- `POST /api/auth/shopify-verify` - Verify Shopify token
- `POST /api/auth/sync-user` - Sync user from Shopify

**Courses:**
- `GET /api/courses` - List all courses (from Shopify products)
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/:id/progress` - Get user's progress

**Enrollments:**
- `GET /api/enrollments` - Get user's enrollments
- `POST /api/enrollments` - Create enrollment (webhook)
- `GET /api/enrollments/:id` - Get enrollment details

**Progress:**
- `POST /api/progress` - Update course progress (SCORM)
- `GET /api/progress/:enrollmentId` - Get progress data

**Webhooks:**
- `POST /api/webhooks/shopify/order-created` - Handle new orders
- `POST /api/webhooks/shopify/order-updated` - Handle order updates

## What NOT to Use Shopify For

❌ **Don't use Shopify for:**
- Course progress tracking (no SCORM support)
- Learning analytics (not designed for LMS)
- Certificate generation (no custom document generation)
- SCORM data storage (not an LMS platform)
- Real-time progress updates (not optimized for this)

## Security Considerations

1. **Token Validation**: Always validate Shopify tokens server-side
2. **Webhook Security**: Verify Shopify webhook signatures
3. **CORS**: Configure CORS properly for API access
4. **Rate Limiting**: Implement rate limiting on Express API
5. **Data Privacy**: Encrypt sensitive learning data

## Migration Path

1. **Phase 1**: Set up Express + MongoDB backend
2. **Phase 2**: Implement Shopify OAuth integration
3. **Phase 3**: Create webhook handlers for orders
4. **Phase 4**: Build enrollment sync system
5. **Phase 5**: Implement SCORM progress tracking
6. **Phase 6**: Add certificate generation

## Summary

✅ **Use Shopify for**: Commerce, payments, basic user data, product catalog
✅ **Use Express + MongoDB for**: Learning progress, SCORM tracking, certificates, analytics
✅ **Use React for**: UI, data aggregation, SCORM player

This hybrid approach gives you the best of both worlds: Shopify's robust commerce platform and your custom LMS functionality.
