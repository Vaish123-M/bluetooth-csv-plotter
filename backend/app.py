"""
Bluetooth CSV Plotter - Backend API Server

This Flask application provides API endpoints for:
1. CSV file upload and parsing
2. Bluetooth communication simulation
3. Data visualization support

Author: Thryv Mobility Assignment
Date: September 2025
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow React frontend to communicate with Flask backend

# ===== Root Route =====
@app.route("/")
def home():
    """
    Health check endpoint to verify server is running.
    
    Returns:
        JSON response with welcome message
    """
    return jsonify({"message": "Hello from Flask backend 🚀"})

# ===== Core Task 2: CSV Upload & Preview =====
@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    """
    Handle CSV file upload and parsing for data visualization.
    
    Accepts multipart/form-data with 'file' field containing CSV.
    Uses pandas to parse CSV and returns structured data for plotting.
    
    Returns:
        JSON response containing:
        - preview: First 10 rows for quick preview
        - all: Complete dataset for plotting
        - columns: List of column names for chart configuration
        
    Error Responses:
        400: No file uploaded or invalid CSV format
    """
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        # Parse CSV using pandas for robust handling
        df = pd.read_csv(file)
        
        # Prepare data in different formats for frontend use
        preview = df.head(10).to_dict(orient="records")  # First 10 rows for preview
        all_data = df.to_dict(orient="records")           # Complete dataset for plotting
        columns = df.columns.tolist()                     # Column names for chart configuration
        
        return jsonify({
            "preview": preview, 
            "all": all_data, 
            "columns": columns
        })
    except Exception as e:
        return jsonify({"error": f"CSV parsing failed: {str(e)}"}), 400

# ===== Core Task 1: Simulated Bluetooth Communication =====
@app.route("/simulate_bluetooth", methods=["POST"])
def simulate_bluetooth():
    """
    Simulate Bluetooth device acknowledgment for testing purposes.
    
    In a real implementation, this would interface with actual Bluetooth hardware.
    For demo purposes, it echoes back an acknowledgment message.
    
    Request Body:
        JSON with 'text' field containing message to acknowledge
        
    Returns:
        JSON response with acknowledgment message
    """
    data = request.get_json()
    text = data.get("text", "")
    ack = f"✅ Acknowledged: {text}"
    return jsonify({"ack": ack})

# ===== Extra Route: Send Text =====
@app.route("/send-text", methods=["POST"])
def send_text():
    """
    Alternative endpoint for sending text messages.
    
    Provides same functionality as simulate_bluetooth for compatibility.
    Can be used by different frontend components or testing tools.
    
    Request Body:
        JSON with 'text' field containing message to process
        
    Returns:
        JSON response with acknowledgment message
    """
    data = request.get_json()
    text = data.get("text", "")
    ack = f"✅ Acknowledged: {text}"
    return jsonify({"ack": ack})

# ===== Entry Point =====
if __name__ == "__main__":
    """
    Start the Flask development server.
    
    Configuration:
    - Debug mode: Enabled for development (auto-reload on code changes)
    - Port: 5000 (default Flask port)
    - Host: localhost (127.0.0.1)
    
    For production deployment, use a WSGI server like Gunicorn.
    """
    app.run(debug=True, port=5000)
