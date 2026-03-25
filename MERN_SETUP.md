# Backend + MySQL Setup Instructions

## MySQL Setup Options

### Option 1: Local MySQL Installation
1. Install MySQL Server 8.x.
2. Create a database named `clarity`.
3. Create an application user with permissions on the `clarity` database.

### Option 2: Docker MySQL (Alternative)
```bash
docker run --name clarity-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=clarity -p 3306:3306 -d mysql:8
```

## Current Setup
- The backend is configured for MySQL connectivity.
- MySQL connection bootstrap is implemented in `server/mysql.ts`.
- API includes a MySQL health endpoint: `GET /api/db-health`.

## Environment Variables Required
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=clarity
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

## Testing the Setup
1. Start the development server: `npm run dev`
2. Verify API health: `GET /api/health`
3. Verify database connectivity: `GET /api/db-health`