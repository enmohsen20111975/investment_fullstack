# EGX Investment Platform - Node.js Version

A fullstack investment platform for the Egyptian Stock Exchange (EGX) with Shariah compliance features.

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite (development) / PostgreSQL (production) with Sequelize ORM
- **Frontend**: Vanilla JavaScript with TailwindCSS
- **Authentication**: API Key + JWT

## Project Structure

```
project/
├── backend/
│   ├── config.js           # Application configuration
│   ├── database.js         # Database connection
│   ├── logger.js           # Winston logger
│   ├── middleware/
│   │   ├── auth.js         # Authentication middleware
│   │   └── monitoring.js   # Request monitoring
│   ├── models/
│   │   ├── index.js        # Model exports and associations
│   │   ├── enums/          # Enumerations
│   │   ├── Stock.js
│   │   ├── User.js
│   │   └── ...             # Other models
│   └── routes/
│       ├── auth.js         # Authentication routes
│       ├── stocks.js       # Stock data routes
│       ├── market.js       # Market overview routes
│       ├── portfolio.js    # Portfolio recommendation routes
│       └── user.js         # User data routes
├── frontend/
│   ├── index.html
│   ├── js/
│   │   ├── api.js          # API client
│   │   ├── app.js          # Main application
│   │   └── modules/        # Feature modules
│   └── css/
├── scripts/
│   └── init_db.js          # Database initialization
├── server.js               # Main entry point
├── package.json
└── .env                    # Environment variables
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Initialize the database:
```bash
npm run init:db
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get API key
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Stocks
- `GET /api/stocks` - List all stocks
- `GET /api/stocks/:ticker` - Get stock by ticker
- `GET /api/stocks/:ticker/history` - Get stock price history
- `GET /api/stocks/:ticker/recommendation` - Get AI recommendation
- `GET /api/stocks/search/:query` - Search stocks

### Market
- `GET /api/market/overview` - Market overview
- `GET /api/market/indices` - Market indices
- `GET /api/market/status` - Market status

### Portfolio
- `GET /api/portfolio/recommend` - Get recommendations
- `POST /api/portfolio/recommend/advanced` - Advanced recommendations
- `GET /api/portfolio/halal-stocks` - List halal stocks
- `GET /api/portfolio/haram-stocks` - List haram stocks

### User Data
- `GET /api/user/watchlist` - Get watchlist
- `POST /api/user/watchlist` - Add to watchlist
- `GET /api/user/assets` - Get user assets
- `POST /api/user/assets` - Create asset
- `GET /api/user/income-expense` - Get transactions
- `POST /api/user/share-portfolio` - Share portfolio

## Authentication

All API endpoints require an API key in the `X-API-Key` header:

```javascript
fetch('/api/stocks', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
})
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | Database connection string | sqlite://./egx_investment.db |
| SECRET_KEY | JWT secret key | (change in production) |
| API_KEYS | Static API keys | default-api-key-change-in-production |
| CORS_ORIGINS | Allowed CORS origins | * |
| DEBUG | Enable debug mode | false |

## Features

- **Stock Data**: Real-time EGX stock prices and historical data
- **Shariah Compliance**: Halal/Haram classification for stocks
- **Portfolio Recommendations**: AI-powered investment suggestions
- **User Portfolios**: Track your investments
- **Market Analysis**: Market overview and indices
- **Watchlist**: Monitor specific stocks

## Migrating from Python/FastAPI

This Node.js version maintains API compatibility with the original Python/FastAPI backend. The frontend should work without changes.

Key differences:
1. Uses Sequelize ORM instead of SQLAlchemy
2. Express.js instead of FastAPI
3. Winston for logging instead of Python's logging module
4. bcryptjs for password hashing

## License

MIT