# EGX Investment API

A fullstack backend application for collecting and serving investment data from the Egyptian Stock Exchange (EGX) with Shariah compliance features.

## Features

- **Data Collection**: Real-time EGX stock data from Twelve Data, EODHD, and yfinance
- **Shariah Compliance**: Halal/haram stock classification based on EGX 33 Shariah Compliant Index
- **Portfolio Recommendations**: AI-powered portfolio suggestions with risk assessment
- **Scheduled Updates**: Automatic data updates during EGX trading hours
- **API Key Authentication**: Secure API endpoints

## Tech Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with async SQLAlchemy
- **Scheduler**: APScheduler
- **Data Sources**: Twelve Data, EODHD, yfinance
- **AI**: Together.ai (Qwen3-Next-80B-A3B-Instruct)

## Project Structure

```
investment_fullstack/
|-- app/
|   |-- __init__.py
|   |-- main.py              # FastAPI application entry point
|   |-- config.py            # Configuration and API keys
|   |-- database.py          # PostgreSQL async session
|   |-- scheduler.py         # APScheduler for data updates
|   |-- models/
|   |   |-- __init__.py
|   |   |-- models.py        # SQLAlchemy models
|   |-- schemas/
|   |   |-- __init__.py
|   |   |-- schemas.py       # Pydantic schemas
|   |-- services/
|   |   |-- __init__.py
|   |   |-- data_service.py  # Stock data fetching
|   |   |-- portfolio_service.py
|   |   |-- external_apis.py # Twelve Data & EODHD
|   |   |-- ai_service.py    # Together.ai AI service
|   |-- routes/
|   |   |-- __init__.py
|   |   |-- stocks.py
|   |   |-- portfolio.py
|   |   |-- market.py
|   |-- middleware/
|       |-- __init__.py
|       |-- auth.py
|-- scripts/
|   |-- init_db.py           # Database initialization
|-- requirements.txt
|-- Dockerfile
|-- docker-compose.yml
|-- .env.example
|-- README.md
|-- run_server.py
|-- .gitignore
```

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Virtual environment (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd investment_fullstack
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python scripts/init_db.py
   ```

6. **Run the server**
   ```bash
   python run_server.py
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Initialize database**
   ```bash
   docker-compose exec api python scripts/init_db.py
   ```

## API Endpoints

### Stocks

- `GET /stocks/{ticker}` - Get stock data with Shariah compliance
- `GET /stocks` - List all stocks
- `GET /stocks/search?query=keyword` - Search stocks

### Portfolio

- `GET /portfolio/recommend?capital=amount&risk=low/medium/high&halal_only=true/false` - Get portfolio recommendations
- `GET /portfolio/halal-stocks` - List all halal stocks
- `GET /portfolio/haram-stocks` - List all haram stocks

### Market

- `GET /market/overview` - Market overview
- `GET /market/indices` - Market indices
- `GET /market/status` - EGX trading status

## Authentication

All API endpoints require an API key in the `X-API-Key` header.

```bash
curl -H "X-API-Key: your_api_key" http://localhost:8010/stocks/ETEL.CA
```

## Shariah Compliance

Stocks are classified based on the EGX 33 Shariah Compliant Index:

- **Halal**: ETEL, ABUK, JUFO, and other EGX 33 components
- **Haram**: COMI, CIEB, and others with non-compliant activities

Each stock response includes:
- `compliance_status`: "halal", "haram", or "unknown"
- `compliance_note`: Detailed explanation

## Trading Hours

EGX trading hours (Cairo time):
- Sunday to Thursday
- 10:00 AM - 2:30 PM

Data updates are scheduled every 15 minutes during trading hours.

## API Keys

The application uses the following external APIs:

- **Twelve Data**: Real-time stock data
- **EODHD**: Historical data and fundamentals
- **Together.ai**: AI-powered analysis

## License

MIT License

## Support

For issues and feature requests, please open a GitHub issue.