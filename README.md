# Nepali Text Enhancement Backend

A production-ready backend service for enhancing Nepali text with AI-powered suggestions. This service analyzes Nepali text, provides grammar, spelling, and style suggestions, and allows users to accept or reject these enhancements.

## Features

- RESTful API for text analysis and enhancement
- Nepali text normalization and tokenization
- Integration with Anthropic Claude for AI-powered suggestions
- Supabase database for persistence
- **Supabase Authentication** with Row Level Security
- Comprehensive error handling and logging
- Support for both authenticated and anonymous users

## Tech Stack

- Node.js v20+ with TypeScript (strict mode)
- Express.js for the API server
- **Supabase for database and built-in authentication**
- Anthropic Claude for AI text analysis
- Zod for request validation
- Jest for testing

## API Endpoints

### Text Analysis
- `POST /api/v1/analyze` - Analyze text and get suggestions
- `PATCH /api/v1/suggestions/:sessionId` - Accept or reject suggestions
- `GET /api/v1/sessions/:sessionId` - Get session details with suggestions

### Authentication
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/forgot-password` - Send password reset email
- `GET /api/v1/auth/verify-reset-token` - Verify password reset token
- `POST /api/v1/auth/reset-password` - Reset password with token
- `GET /api/v1/auth/profile` - Get user profile (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)
- `POST /api/v1/auth/change-password` - Change password (protected)
- `POST /api/v1/auth/logout` - Logout user (protected)

## Setup Instructions

### Prerequisites

- Node.js v20+
- A Supabase account
- An Anthropic API key

### Supabase Setup

1. Create a new Supabase project
2. **Enable Email Authentication**:
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable email authentication
   - Configure email templates if needed
3. Create the database schema:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Run the SQL migration script from `supabase/migrations/001_setup_auth_and_profiles.sql`
4. Get your Supabase URL, anon key, and service role key from the API settings

### Local Development Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Frontend URL (for password reset redirects)
FRONTEND_URL=http://localhost:3000

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. Start the development server:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

## Authentication

This project uses **Supabase's built-in authentication system** following best practices:

- ✅ Secure password hashing (handled by Supabase)
- ✅ JWT token management (handled by Supabase)
- ✅ Email verification support
- ✅ Row Level Security (RLS) for data protection
- ✅ Support for both authenticated and anonymous users

For detailed authentication setup and usage, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md).

## Database Schema

The service uses the following database tables:

### Supabase Managed
- `auth.users`: User accounts (managed by Supabase)

### Application Tables
- `profiles`: User profile information (references auth.users)
- `sessions`: Stores the original text and user information
- `tokens`: Contains tokenized segments of the text
- `suggestions`: Stores AI-generated enhancement suggestions
- `actions`: Records user actions (accept/reject) on suggestions

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
src/
├── config/            # Configuration files (Supabase, etc.)
├── controllers/       # Route controllers
├── middleware/        # Express middleware (auth, validation, etc.)
├── routes/            # API routes
├── schemas/           # Zod validation schemas
├── services/          # Business logic
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── __tests__/         # Test files
```

## Production Deployment

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

3. Ensure your production environment variables are set correctly in your hosting platform.

## License

MIT