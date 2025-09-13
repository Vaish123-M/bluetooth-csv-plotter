# 📡 Bluetooth CSV Plotter Web App

A modern full-stack web application built for the **Thryv Mobility internship assignment**. This project demonstrates Bluetooth communication with a mobile device and interactive CSV data visualization—all within a clean, responsive React interface backed by a Flask server.

---

## ✅ Core Features

### 🔹 Core Task 1: Bluetooth Communication

- Scan and list available Bluetooth devices from the frontend GUI.
- Allow the user to select a phone from the list.
- Establish a Bluetooth connection to the selected phone (assuming it is already paired).
- Implement two-way communication:
  - Send a string message from the system to the phone.
  - Receive an acknowledgment message from the phone and display it in the frontend.

> ✅ Tested using **nRF Connect** (BLE peripheral app) with UART service enabled.

---

### 🔹 Core Task 2: CSV Upload and Plotting

- Upload a CSV file manually from the local file manager.
- Backend parses the CSV using **Pandas**.
- Frontend renders an interactive line/time series plot using **Plotly.js**:
  - Zoom and pan functionality.
  - Toggle visibility of individual columns.

---

## ⚠️ Bonus Task (Partially Attempted)

While the frontend and backend are ready to handle CSV transfer over Bluetooth, **sending a full CSV file from nRF Connect was not feasible** due to app limitations. As a result:

- CSV transfer from phone to system was not fully implemented.
- The rest of the pipeline (receiving, storing, and plotting) is functional and ready.

---

## 🛠️ Tech Stack

| Layer      | Technology Used         |
|------------|--------------------------|
| Frontend   | React, JSX, CSS, Plotly.js |
| Backend    | Flask, Pandas             |
| Bluetooth  | Web Bluetooth API (Chrome/Edge) |
| UI Effects | Custom Canvas Particle Background |

---

## 🚀 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Vaish123-M/bluetooth-csv-plotter.git
cd bluetooth-csv-plotter
