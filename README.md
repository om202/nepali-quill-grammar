# Nepali Text Enhancement Backend

A production-ready backend service for enhancing Nepali text with AI-powered suggestions. This service analyzes Nepali text, provides grammar, spelling, and style suggestions, and allows users to accept or reject these enhancements.

## Features

- RESTful API for text analysis and enhancement
- Nepali text normalization and tokenization
- Integration with Anthropic Claude for AI-powered suggestions
- Supabase database for persistence
- JWT-based authentication (optional)
- Comprehensive error handling and logging

## Tech Stack

- Node.js v20+ with TypeScript (strict mode)
- Express.js for the API server
- Supabase for database and authentication
- Anthropic Claude for AI text analysis
- Zod for request validation
- Jest for testing

## API Endpoints

- `POST /api/v1/analyze` - Analyze text and get suggestions
- `PATCH /api/v1/suggestions/:sessionId` - Accept or reject suggestions
- `GET /api/v1/sessions/:sessionId` - Get session details with suggestions

## Setup Instructions

### Prerequisites

- Node.js v20+
- A Supabase account
- An Anthropic API key

### Supabase Setup

1. Create a new Supabase project
2. Create the database schema:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Run the SQL migration script from `supabase/migrations/create_initial_schema.sql`
3. Get your Supabase URL and anon key from the API settings

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
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

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

## Database Schema

The service uses the following database tables:

- `sessions`: Stores the original text and user information
- `tokens`: Contains tokenized segments of the text
- `suggestions`: Stores AI-generated enhancement suggestions
- `actions`: Records user actions (accept/reject) on suggestions

## Project Structure

```
src/
├── config/            # Configuration files
├── controllers/       # Route controllers
├── middleware/        # Express middleware
├── models/            # Data models
├── routes/            # API routes
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

## License

MIT