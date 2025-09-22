# 🔌 API Documentation

## Backend Endpoints Reference

### Base URL
```
http://localhost:5000
```

---

## 📡 Health Check

### `GET /`

**Description**: Verify server is running and responsive

**Request**: No parameters required

**Response**:
```json
{
  "message": "Hello from Flask backend 🚀"
}
```

**Status Codes**:
- `200 OK`: Server is running normally

---

## 📁 CSV File Upload

### `POST /upload_csv`

**Description**: Upload and parse CSV file for data visualization

**Content-Type**: `multipart/form-data`

**Request Body**:
```
file: <CSV file> (required)
```

**Example Request** (using curl):
```bash
curl -X POST http://localhost:5000/upload_csv \
  -F "file=@sample_data.csv"
```

**Success Response** (200 OK):
```json
{
  "preview": [
    {"Timestamp": "2023-01-01", "Temperature": 25.5, "Humidity": 60.2},
    {"Timestamp": "2023-01-02", "Temperature": 26.1, "Humidity": 58.7}
    // ... up to 10 rows for preview
  ],
  "all": [
    // Complete dataset - all rows
    {"Timestamp": "2023-01-01", "Temperature": 25.5, "Humidity": 60.2},
    // ... all data rows
  ],
  "columns": ["Timestamp", "Temperature", "Humidity"]
}
```

**Error Responses**:
```json
// 400 Bad Request - No file provided
{
  "error": "No file uploaded"
}

// 400 Bad Request - Invalid CSV format
{
  "error": "CSV parsing failed: [detailed error message]"
}
```

---

## 📱 Bluetooth Communication

### `POST /simulate_bluetooth`

**Description**: Simulate Bluetooth device acknowledgment

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "text": "Hello from phone"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5000/simulate_bluetooth \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message"}'
```

**Success Response** (200 OK):
```json
{
  "ack": "✅ Acknowledged: Test message"
}
```

---

### `POST /send-text`

**Description**: Alternative text message endpoint (same functionality as simulate_bluetooth)

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "text": "Message to acknowledge"
}
```

**Success Response** (200 OK):
```json
{
  "ack": "✅ Acknowledged: Message to acknowledge"
}
```

---

## ⚠️ Missing Endpoint (Known Limitation)

### `POST /upload_csv_text` (NOT IMPLEMENTED)

**Description**: Should handle CSV data received over Bluetooth as text

**Expected Request Body**:
```json
{
  "csv": "Timestamp,Temperature,Humidity\n2023-01-01,25.5,60.2\n..."
}
```

**Expected Response**: Same format as `/upload_csv`

**Status**: Referenced in frontend but not implemented in backend

---

## 🔧 Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid input or missing required parameters
- `404 Not Found`: Endpoint doesn't exist
- `500 Internal Server Error`: Server-side error

Error responses follow this format:
```json
{
  "error": "Descriptive error message"
}
```

---

## 🧪 Testing the API

### Using curl:

```bash
# Test server health
curl http://localhost:5000/

# Upload CSV file
curl -X POST http://localhost:5000/upload_csv \
  -F "file=@your_data.csv"

# Test Bluetooth simulation
curl -X POST http://localhost:5000/simulate_bluetooth \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from curl"}'
```

### Using Python requests:

```python
import requests

# Health check
response = requests.get('http://localhost:5000/')
print(response.json())

# Upload CSV
with open('data.csv', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5000/upload_csv', files=files)
    print(response.json())

# Bluetooth simulation
data = {'text': 'Hello from Python'}
response = requests.post('http://localhost:5000/simulate_bluetooth', json=data)
print(response.json())
```

---

## 📊 Data Format Requirements

### CSV File Format:
- **Headers**: First row should contain column names
- **Encoding**: UTF-8 recommended
- **Separators**: Comma-separated values (standard CSV)
- **Data Types**: Numeric columns for plotting, strings for labels
- **File Size**: Tested up to ~10MB

### Example CSV Structure:
```csv
Timestamp,Temperature,Humidity,Pressure
2023-01-01 00:00:00,25.5,60.2,1013.2
2023-01-01 01:00:00,25.8,59.8,1013.1
2023-01-01 02:00:00,26.1,58.7,1012.9
```

---

## 🔐 CORS Configuration

The server is configured with CORS enabled to allow requests from:
- Frontend development server (`http://localhost:3000`)
- Any origin (for development purposes)

For production, CORS should be restricted to specific domains.

---

*Last Updated: September 22, 2025*