# Setup Guide for TV Shows API

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd tcss460-group5-tv-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
API_KEY=your-secret-api-key-here
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/tvshows_db
NODE_ENV=development
```

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb tvshows_db
```

2. Run the initialization script:
```bash
psql tvshows_db < project_files/Initialize_TVShowdatabase.sql
```

3. (Optional) Import CSV data into the database

## Running the Application

Start the server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

Once running, visit:
- `http://localhost:3000` - Health check
- `http://localhost:3000/api-docs` - Swagger UI documentation

## Testing

Import the Postman collection from `Testing/postman/postman.json`:
1. Open Postman
2. Import -> File -> Select `Testing/postman/postman.json`
3. Update the `base_url` and `api_key` variables in Postman
4. Run the collection tests

## Production Deployment

### Heroku Deployment

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables:
```bash
heroku config:set API_KEY=your-production-api-key
```

4. Deploy:
```bash
git push heroku main
```

5. Run database migrations on Heroku:
```bash
heroku pg:psql < project_files/Initialize_TVShowdatabase.sql
```

## API Key Usage

All API endpoints (except root and `/api-docs`) require an API key in the request header:
```
x-api-key: your-api-key-here
```

Example using cURL:
```bash
curl -H "x-api-key: your-api-key-here" http://localhost:3000/api/v1/shows
```

## Environment Variables

- `API_KEY`: Secret key for API authentication
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)
