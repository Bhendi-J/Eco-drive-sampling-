# EcoDrive Arena - API Documentation

## Backend Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Running the Backend

```bash
python app.py
```

The server will start on `http://localhost:5000`

---

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-15T23:45:00.000000"
}
```

---

### 2. Get Eco Score
**POST** `/get_score`

Calculate eco-driving score based on game telemetry.

**Request Body:**
```json
{
  "rpm_var": 1500,
  "braking_hits": 2,
  "fuel_usage": 7.5,
  "smoothness_val": 0.85
}
```

**Response:**
```json
{
  "eco_score": 78.3,
  "status": "Warning: High Braking!",
  "timestamp": "2026-02-15T23:45:00.000000"
}
```

**Status Messages:**
- `"Critical: Excessive Braking!"` - More than 3 braking hits
- `"Warning: High Braking!"` - 1-3 braking hits
- `"Excellent: Perfect Smoothness!"` - Smoothness > 0.9
- `"Smooth Driving"` - Normal driving

---

### 3. Save Game Session
**POST** `/save_session`

Save a completed game session to the database.

**Request Body:**
```json
{
  "mode": "highway",
  "final_score": 85.2,
  "duration": 180,
  "fuel_remaining": 45.5,
  "collisions": 3,
  "player_name": "Player1"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": 42,
  "message": "Session saved successfully"
}
```

---

### 4. Get Leaderboard
**GET** `/leaderboard?mode={mode}&limit={limit}`

Retrieve top scores leaderboard.

**Query Parameters:**
- `mode` (optional): `"all" | "city" | "highway"` (default: `"all"`)
- `limit` (optional): Number of entries (default: `10`)

**Response:**
```json
{
  "leaderboard": [
    {
      "player_name": "Player1",
      "score": 95.5,
      "mode": "highway",
      "timestamp": "2026-02-15T23:30:00.000000"
    },
    {
      "player_name": "Player2",
      "score": 92.1,
      "mode": "city",
      "timestamp": "2026-02-15T23:25:00.000000"
    }
  ],
  "count": 2
}
```

---

### 5. Get Overall Statistics
**GET** `/stats`

Get aggregate statistics across all game sessions.

**Response:**
```json
{
  "total_sessions": 150,
  "average_score": 78.5,
  "best_score": 96.2,
  "total_playtime": 27000,
  "city_sessions": 75,
  "highway_sessions": 75
}
```

---

### 6. Get Player Statistics
**GET** `/player_stats?name={playerName}`

Get statistics for a specific player.

**Query Parameters:**
- `name` (required): Player name

**Response:**
```json
{
  "player_name": "Player1",
  "total_sessions": 25,
  "average_score": 82.3,
  "best_score": 95.5,
  "recent_sessions": [
    {
      "id": 42,
      "mode": "highway",
      "final_score": 85.2,
      "duration": 180,
      "fuel_remaining": 45.5,
      "collisions": 3,
      "player_name": "Player1",
      "timestamp": "2026-02-15T23:30:00.000000"
    }
  ]
}
```

---

### 7. Get Recent Sessions
**GET** `/recent_sessions?limit={limit}`

Get the most recent game sessions.

**Query Parameters:**
- `limit` (optional): Number of sessions (default: `10`)

**Response:**
```json
{
  "sessions": [
    {
      "id": 42,
      "mode": "highway",
      "final_score": 85.2,
      "duration": 180,
      "fuel_remaining": 45.5,
      "collisions": 3,
      "player_name": "Player1",
      "timestamp": "2026-02-15T23:30:00.000000"
    }
  ],
  "count": 1
}
```

---

## Frontend Integration

### Setup

The frontend uses a TypeScript API client located in `/frontend/src/lib/api.ts`.

### Usage Example

```typescript
import { api } from '@/lib/api';

// Get eco score
const score = await api.getEcoScore({
  rpm_var: 1500,
  braking_hits: 2,
  fuel_usage: 7.5,
  smoothness_val: 0.85
});

// Save game session
await api.saveSession({
  mode: 'highway',
  final_score: 85.2,
  duration: 180,
  fuel_remaining: 45.5,
  collisions: 3,
  player_name: 'Player1'
});

// Get leaderboard
const leaderboard = await api.getLeaderboard('highway', 10);

// Get statistics
const stats = await api.getStats();
```

### Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## Machine Learning Model

The backend uses a **Random Forest Regressor** trained on eco-driving data with the following features:

1. **rpm_variation**: Engine RPM variability
2. **harsh_braking_count**: Number of hard braking events
3. **idling_time**: Time spent idling (currently set to 0 during active gameplay)
4. **fuel_consumption**: Fuel usage rate
5. **acceleration_smoothness**: Smoothness of acceleration (0-1 scale)

The model predicts an **eco_score** from 0-100 based on these metrics.

---

## Development Notes

- The backend currently uses in-memory storage. In production, integrate a proper database (PostgreSQL, MongoDB, etc.)
- CORS is enabled for all origins (`CORS(app)`) - restrict this in production
- The ML model is trained on startup from `eco_driving_score.csv` (820KB dataset)
- Leaderboard is limited to top 100 entries to prevent memory overflow

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Success
- `400 Bad Request`: Invalid request parameters
- `500 Internal Server Error`: Server error

The frontend API client includes try-catch error handling and will fall back gracefully if the backend is unavailable.
