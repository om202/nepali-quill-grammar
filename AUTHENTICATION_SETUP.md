# Supabase Authentication Setup

This project now uses **Supabase's built-in authentication system** following best practices instead of custom JWT implementation.

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# No longer needed (removed custom JWT)
# JWT_SECRET=your_jwt_secret
```

### 2. Database Migration

Run the migration to set up the proper database schema:

```bash
# If using Supabase CLI
supabase db push

# Or run the SQL manually in your Supabase dashboard
# File: supabase/migrations/001_setup_auth_and_profiles.sql
```

### 3. Supabase Dashboard Configuration

1. **Enable Email Authentication**:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations" if you want email verification
   - Configure email templates if needed

2. **Configure Auth Settings**:
   - Set JWT expiry time (default 1 hour is recommended)
   - Configure password requirements
   - Set up redirect URLs for your frontend

## 🏗️ Architecture

### Authentication Flow

1. **Signup**: Uses `supabase.auth.signUp()`
   - Creates user in `auth.users` table
   - Automatically creates profile in `public.profiles` via trigger
   - Returns Supabase session with access/refresh tokens

2. **Login**: Uses `supabase.auth.signInWithPassword()`
   - Validates credentials against `auth.users`
   - Returns Supabase session

3. **Token Verification**: Uses `supabase.auth.getUser(token)`
   - Verifies JWT using Supabase's built-in verification
   - No custom JWT secret needed

### Database Schema

```sql
-- Supabase manages this automatically
auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  raw_user_meta_data JSONB,
  -- ... other Supabase fields
)

-- We manage this
public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to access their own data
- Allow anonymous access for sessions (for non-logged-in users)
- Inherit permissions through foreign key relationships

## 📡 API Endpoints

### Authentication Routes

```bash
# Signup
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe" // optional
}

# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

# Get Profile (requires auth)
GET /api/v1/auth/profile
Authorization: Bearer <supabase_access_token>

# Update Profile (requires auth)
PUT /api/v1/auth/profile
Authorization: Bearer <supabase_access_token>
{
  "name": "Updated Name"
}

# Logout (requires auth)
POST /api/v1/auth/logout
Authorization: Bearer <supabase_access_token>
```

### Response Format

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_at": 1234567890,
    "token_type": "bearer",
    "user": { /* Supabase user object */ }
  }
}
```

## 🔐 Security Features

### What Supabase Handles Automatically

- ✅ Password hashing (bcrypt)
- ✅ JWT token generation and verification
- ✅ Token refresh mechanism
- ✅ Email verification (if enabled)
- ✅ Rate limiting
- ✅ Session management
- ✅ Password reset flows

### What We Implemented

- ✅ Row Level Security policies
- ✅ Profile management
- ✅ Integration with existing session system
- ✅ Proper error handling
- ✅ Optional authentication for anonymous users

## 🔄 Migration from Custom Auth

### Changes Made

1. **Removed Dependencies**:
   - `bcryptjs` (Supabase handles password hashing)
   - `jsonwebtoken` (Supabase handles JWT)

2. **Updated Database**:
   - Removed custom `users` table
   - Added `profiles` table referencing `auth.users`
   - Added RLS policies

3. **Updated Services**:
   - `AuthService` now uses Supabase Auth methods
   - Middleware uses `supabase.auth.getUser()`
   - Controllers return Supabase sessions

### Frontend Integration

Use the Supabase JavaScript client:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Use session token for API calls
fetch('/api/v1/auth/profile', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

## 🚀 Benefits of This Approach

1. **Security**: Leverages Supabase's battle-tested auth system
2. **Maintenance**: Less custom code to maintain
3. **Features**: Built-in email verification, password reset, etc.
4. **Scalability**: Supabase handles auth infrastructure
5. **Standards**: Follows OAuth 2.0 and JWT standards
6. **Integration**: Seamless with Supabase ecosystem

## 🔍 Testing

```bash
# Test signup
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Test protected route
curl -X GET http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

This implementation now follows Supabase best practices and provides a robust, secure authentication system! 