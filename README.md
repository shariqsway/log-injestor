# Log Ingestion and Querying System

A full-stack TypeScript application for ingesting, storing, and querying log data in real-time. Built with Express.js, React, Socket.IO, and Docker for modern log management and analysis.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express)
![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=flat&logo=socket.io&badgeColor=010101)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Features

### Core Functionality

- **Log Ingestion**: REST API endpoint for accepting structured log entries with validation
- **Advanced Filtering**: Search and filter logs by level, message, resource, timestamp, trace ID, span ID, and commit hash
- **Real-time Updates**: WebSocket-powered live log streaming and system notifications
- **Analytics Dashboard**: Visual insights with interactive charts and statistics
- **JSON File Storage**: Simple, reliable file-based persistence as per requirements

### Technical Highlights

- **Full TypeScript**: Type-safe development across frontend and backend
- **Real-time WebSockets**: Live log updates, connection status, and system notifications
- **Modern React**: Functional components with custom hooks and optimized state management
- **Comprehensive Testing**: Unit and integration tests with Jest for critical application logic
- **Docker Ready**: Complete containerization with multi-stage builds and docker-compose
- **Professional UI**: Clean, responsive interface with TailwindCSS and visual log level indicators

### Bonus Features Implemented

- **Real-Time Log Ingestion**: WebSocket implementation with Socket.IO
- **Basic Analytics View**: Interactive charts showing log distribution and timeline
- **Containerization**: Docker and docker-compose for full-stack deployment
- **Unit Testing**: Comprehensive test suite for backend logic

## Requirements

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for containerized deployment)

## Installation & Setup

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd log-ingestion-system
   ```

2. **Start the application**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **Health Check**: http://localhost:3001/health

### Option 2: Local Development

1. **Backend Setup**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup** (in a new terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001

## API Documentation

### POST /logs

Ingest a new log entry with automatic timestamp generation.

**Request Body Schema:**

```json
{
  "level": "error",
  "message": "Database connection failed after 3 retries",
  "resourceId": "api-server-01",
  "traceId": "trace-abc-123",
  "spanId": "span-db-456",
  "commit": "a1b2c3d",
  "metadata": {
    "error_code": "DB_CONNECTION_TIMEOUT",
    "retry_count": 3,
    "database": "users_db"
  }
}
```

**Success Response (201 Created):**

```json
{
  "level": "error",
  "message": "Database connection failed after 3 retries",
  "resourceId": "api-server-01",
  "timestamp": "2025-07-07T12:00:00.000Z",
  "traceId": "trace-abc-123",
  "spanId": "span-db-456",
  "commit": "a1b2c3d",
  "metadata": {
    "error_code": "DB_CONNECTION_TIMEOUT",
    "retry_count": 3,
    "database": "users_db"
  }
}
```

**Error Responses:**

- **400 Bad Request**: Invalid request body or schema validation failure
- **500 Internal Server Error**: Server-side processing or persistence failure

### GET /logs

Retrieve logs with comprehensive filtering support. All filters use AND logic when combined.

**Query Parameters:**

- `level` (string): Filter by log level (error, warn, info, debug)
- `message` (string): Case-insensitive full-text search in message field
- `resourceId` (string): Filter by resource identifier
- `timestamp_start` (ISO 8601): Start of timestamp range
- `timestamp_end` (ISO 8601): End of timestamp range
- `traceId` (string): Filter by trace identifier
- `spanId` (string): Filter by span identifier
- `commit` (string): Filter by commit hash

**Example Requests:**

```bash
# Get all error logs
GET /logs?level=error

# Search for database-related logs
GET /logs?message=database

# Get logs from last hour
GET /logs?timestamp_start=2025-07-07T11:00:00Z

# Combined filters: error logs from server-01 containing "database"
GET /logs?level=error&resourceId=server-01&message=database
```

**Success Response (200 OK):**

```json
[
  {
    "level": "error",
    "message": "Database connection failed",
    "resourceId": "api-server-01",
    "timestamp": "2025-07-07T12:00:00.000Z",
    "traceId": "trace-abc-123",
    "spanId": "span-db-456",
    "commit": "a1b2c3d",
    "metadata": { "error_code": "DB_CONNECTION_TIMEOUT" }
  }
]
```

### GET /logs/stats

Get analytics and statistics about stored logs for the dashboard.

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalLogs": 150,
    "logsByLevel": {
      "error": 12,
      "warn": 25,
      "info": 98,
      "debug": 15
    },
    "recentActivity": {
      "last24Hours": 45,
      "errorRate": 8.0
    }
  }
}
```

### GET /health

Health check endpoint for monitoring and Docker health checks.

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2025-07-07T12:00:00.000Z",
  "connectedClients": 3
}
```

## Usage Examples

### Adding Sample Logs

```bash
# Add an error log
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "error",
    "message": "Failed to connect to database",
    "resourceId": "server-01",
    "traceId": "trace-123",
    "spanId": "span-456",
    "commit": "abc123",
    "metadata": {"attempts": 3}
  }'

# Add an info log
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User login successful",
    "resourceId": "auth-service",
    "traceId": "trace-789",
    "spanId": "span-101",
    "commit": "def456",
    "metadata": {"userId": "user123"}
  }'

# Add a warning log
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "warn",
    "message": "API rate limit approaching threshold",
    "resourceId": "api-gateway",
    "traceId": "trace-456",
    "spanId": "span-789",
    "commit": "ghi789",
    "metadata": {"current_requests": 950, "limit": 1000}
  }'
```

### Querying Logs

```bash
# Get all error logs
curl "http://localhost:3001/logs?level=error"

# Search for database-related logs
curl "http://localhost:3001/logs?message=database"

# Get logs from the last hour
curl "http://localhost:3001/logs?timestamp_start=2025-07-07T11:00:00Z"

# Combined filters: error logs from server-01 containing "database"
curl "http://localhost:3001/logs?level=error&resourceId=server-01&message=database"

# Get logs within a specific time range
curl "http://localhost:3001/logs?timestamp_start=2025-07-07T09:00:00Z&timestamp_end=2025-07-07T12:00:00Z"

# Filter by trace ID
curl "http://localhost:3001/logs?traceId=trace-123"
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch
```

### Test Coverage

The comprehensive test suite includes:

- **Unit tests** for LogService with mocked dependencies
- **Integration tests** with actual file operations and data persistence
- **API endpoint testing** with various filter combinations and edge cases
- **Error handling** and validation testing
- **Performance testing** for filtering operations

**Example test scenarios:**

- Log creation with automatic timestamp generation
- Complex filtering with multiple criteria (AND logic)
- Edge cases like empty filters and invalid data
- File persistence and data integrity
- WebSocket connection and message broadcasting

## Architecture

### Project Structure

```
log-ingestion-system/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Request handlers and route logic
│   │   ├── services/        # Business logic and data processing
│   │   │   ├── logService.ts      # Core log operations
│   │   │   ├── storageService.ts  # File persistence logic
│   │   │   └── websocketService.ts # Real-time features
│   │   ├── middleware/      # Express middleware
│   │   │   ├── errorHandler.ts    # Global error handling
│   │   │   └── validation.ts      # Request validation
│   │   ├── routes/          # API route definitions
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions and helpers
│   │   └── __tests__/       # Test files
│   ├── data/                # JSON file storage
│   │   └── logs.json        # Log data persistence
│   ├── Dockerfile           # Container configuration
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── analytics/   # Analytics dashboard components
│   │   │   ├── common/      # Shared/reusable components
│   │   │   ├── filters/     # Filter control components
│   │   │   └── logs/        # Log display components
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useLogs.ts         # Log data management
│   │   │   ├── useFilters.ts      # Filter state management
│   │   │   └── useWebSocket.ts    # Real-time connections
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── Dockerfile           # Container configuration
│   └── package.json
├── docker-compose.yml       # Multi-service orchestration
└── README.md               # This file
```

### Backend Architecture

- **Controllers**: Handle HTTP requests, input validation, and response formatting
- **Services**: Implement business logic, data processing, and external integrations
- **Middleware**: Provide cross-cutting concerns like error handling and request validation
- **Storage**: JSON file-based persistence with atomic write operations
- **WebSocket**: Real-time communication for live updates and notifications

### Frontend Architecture

- **Components**: Modular React components with clear separation of concerns
- **Hooks**: Custom hooks for state management and side effects
- **Services**: API integration layer with proper error handling
- **Types**: Comprehensive TypeScript definitions for type safety

## Design Decisions & Trade-offs

### Data Persistence: JSON File Storage

**Decision**: Use a single JSON file for data storage as required by the assignment.

**Implementation Details:**

- **Atomic Writes**: Safe file operations using temporary files and atomic moves
- **Error Handling**: Graceful degradation with file corruption recovery
- **Performance**: In-memory filtering for fast query responses
- **Scalability**: Suitable for development and moderate production loads

**Trade-offs:**

- **Pros**: Simple setup, no external dependencies, easy to debug and backup
- **Cons**: Limited concurrent write performance, manual data management

### Real-time Features: Socket.IO

**Decision**: Implement WebSocket-based real-time updates for enhanced user experience.

**Implementation Details:**

- **Connection Management**: Auto-reconnection with exponential backoff
- **Event Broadcasting**: New logs, statistics updates, and system notifications
- **Health Monitoring**: Ping/pong heartbeat for connection stability

**Trade-offs:**

- **Pros**: Excellent real-time experience, robust connection handling
- **Cons**: Additional complexity, memory usage for persistent connections

### Filtering Implementation: In-Memory Processing

**Decision**: Process all filtering operations in memory using JavaScript Array methods.

**Implementation Details:**

- **Combined Filters**: AND logic for multiple simultaneous filter criteria
- **Case-insensitive Search**: User-friendly text searching across log messages
- **Timestamp Range**: Flexible date/time filtering with ISO 8601 support
- **Performance Optimization**: Efficient array operations with early termination

**Trade-offs:**

- **Pros**: Fast response times, flexible filtering logic, easy to extend
- **Cons**: Memory usage grows with dataset size, full dataset loading required

### Frontend State Management: Custom Hooks

**Decision**: Use custom React hooks instead of global state management libraries.

**Implementation Details:**

- **useLogs**: Manages log data fetching, filtering, and caching
- **useFilters**: Handles filter state with debounced API calls
- **useWebSocket**: Manages real-time connections and message handling

**Trade-offs:**

- **Pros**: Lightweight, no external dependencies, component-level isolation
- **Cons**: Manual state synchronization, potential prop drilling for complex apps

## Docker Configuration

### Multi-Stage Builds

The application uses optimized Docker builds for production deployment:

**Backend Dockerfile Features:**

- **Build Stage**: Install all dependencies and compile TypeScript
- **Production Stage**: Copy built artifacts and install only production dependencies
- **Security**: Non-root user execution and minimal attack surface
- **Health Checks**: Built-in health monitoring for orchestration

**Frontend Dockerfile Features:**

- **Build Stage**: React application compilation with Vite
- **Production Stage**: Nginx-based static file serving
- **Performance**: Gzip compression and optimized caching headers

### Docker Compose Orchestration

```yaml
# Key features of docker-compose.yml:
- Multi-service coordination with dependency management
- Health check dependencies (frontend waits for backend)
- Named volumes for data persistence
- Environment variable configuration
- Network isolation between services
```

## Security & Performance Features

### Security Measures

- **Helmet.js**: Security headers for XSS, CSRF, and clickjacking protection
- **CORS**: Configured cross-origin policies for API access
- **Input Validation**: Request body validation with detailed error messages
- **Error Handling**: No sensitive data exposure in error responses
- **Non-root Containers**: Docker containers run with restricted privileges

### Performance Optimizations

- **Debounced Search**: Prevents excessive API calls during user typing
- **Efficient Filtering**: Optimized array operations with short-circuit evaluation
- **Connection Pooling**: WebSocket connection management and reuse
- **Gzip Compression**: Reduced payload sizes for faster transfers
- **Static Asset Optimization**: Minified builds with proper caching headers

## Analytics Features

### Real-time Dashboard

- **Log Level Distribution**: Interactive bar charts showing error/warn/info/debug counts
- **Timeline Visualization**: Hourly activity charts with stacked log levels
- **Statistics Cards**: Total logs, error rates, and activity metrics
- **Live Updates**: Real-time chart updates via WebSocket connections

### Chart Components

- **LogLevelChart**: Horizontal bar chart with percentage breakdowns
- **TimelineChart**: Time-series visualization with hover tooltips
- **Responsive Design**: Adapts to different screen sizes and orientations

## Deployment

### Production Deployment

```bash
# Build and start in production mode
docker-compose up -d --build

# View service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitor health status
curl http://localhost:3001/health

# Stop services
docker-compose down
```

### Environment Variables

```bash
# Backend Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000

# Frontend Configuration
VITE_API_URL=http://localhost:3001
```

### Scaling Considerations

For production deployment at scale, consider:

- **Database Migration**: Replace JSON file with PostgreSQL or MongoDB
- **Load Balancing**: Multiple backend instances behind a load balancer
- **Caching**: Redis for session management and frequently accessed data
- **Monitoring**: Application performance monitoring (APM) integration
- **Logging**: Structured logging with external log aggregation

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Run tests**: `npm test` in both frontend and backend directories
4. **Commit changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Submit a pull request**

### Development Guidelines

- **TypeScript**: Maintain strict type safety with no `any` types
- **Testing**: Add tests for new functionality (aim for >80% coverage)
- **Code Style**: Follow ESLint rules and Prettier formatting
- **Documentation**: Update README and code comments for significant changes
