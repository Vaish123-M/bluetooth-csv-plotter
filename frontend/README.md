# 📡 Bluetooth + CSV Web App

A full-stack web application built using React and Flask that enables:

- ✅ CSV upload and interactive plotting
- ✅ Bluetooth communication with a mobile device (simulated)
- 🌟 CSV transfer over Bluetooth (simulated)

---

## 🔧 Technologies Used

- **Frontend**: React, Plotly.js
- **Backend**: Flask, Pandas
- **Bluetooth API**: Web Bluetooth (Chrome/Edge only)
- **Simulation**: Flask endpoints for fallback testing

---

## 🚀 Features

### Core Task 1: Bluetooth Communication

- Scan and list nearby Bluetooth devices
- Connect to selected device (via Web Bluetooth API)
- Send text to device and receive acknowledgment
- ✅ Simulated fallback via Flask for testing without BLE peripheral

### Core Task 2: CSV Upload & Plotting

- Upload CSV file from local system
- Backend parses CSV using Pandas
- Frontend renders interactive Plotly chart
  - Zoom, pan, toggle columns

### Bonus Task: CSV Transfer Over Bluetooth

- Simulated CSV file sent from phone via Flask
- Parsed and plotted using same chart logic

---

## 🧪 Testing Notes

- Web Bluetooth requires Chrome or Edge on desktop
- If your phone does not advertise Nordic UART Service, use the **Simulate Text via Flask** button
- All endpoints tested on `localhost:3000` (React) and `localhost:5000` (Flask)

---

## 📂 Folder Structure



