from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # Allow React frontend to talk to Flask backend

# ===== Root Route =====
@app.route("/")
def home():
    return jsonify({"message": "Hello from Flask backend 🚀"})

# ===== Core Task 2: CSV Upload & Preview =====
@app.route("/upload_csv", methods=["POST"])
def upload_csv():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    df = pd.read_csv(file)
    preview = df.head(10).to_dict(orient="records")
    all_data = df.to_dict(orient="records")
    columns = df.columns.tolist()
    return jsonify({"preview": preview, "all": all_data, "columns": columns})

# ===== Core Task 1: Simulated Bluetooth Communication =====
@app.route("/simulate_bluetooth", methods=["POST"])
def simulate_bluetooth():
    data = request.get_json()
    text = data.get("text", "")
    ack = f"✅ Acknowledged: {text}"
    return jsonify({"ack": ack})

# ===== Extra Route: Send Text =====
@app.route("/send-text", methods=["POST"])
def send_text():
    data = request.get_json()
    text = data.get("text", "")
    ack = f"✅ Acknowledged: {text}"
    return jsonify({"ack": ack})

# ===== Entry Point =====
if __name__ == "__main__":
    app.run(debug=True, port=5000)
