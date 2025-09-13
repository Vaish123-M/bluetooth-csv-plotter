import React, { useState, useRef } from "react";
import ParticleBackground from "./ParticleBackground";
// Removed react-router-dom imports; using anchor links for navigation
import Plot from "react-plotly.js";
import "./App.css"; // Make sure this CSS file exists

const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

function App() {
  const [csvFile, setCsvFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceName, setDeviceName] = useState(null);
  const [status, setStatus] = useState("Not connected");
  const [received, setReceived] = useState("");
  const [csvFromBluetooth, setCsvFromBluetooth] = useState("");
  const [csvReceiving, setCsvReceiving] = useState(false);
  const [csvReady, setCsvReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const writeCharRef = useRef(null);
  const deviceRef = useRef(null);

  // Help/About Modal state
  const [showModal, setShowModal] = useState(false);


  const handleFileChange = (e) => setCsvFile(e.target.files[0]);

  const handleUpload = () => {
    if (!csvFile) return alert("Please select a CSV file first!");
    const formData = new FormData();
    formData.append("file", csvFile);

    fetch("http://127.0.0.1:5000/upload_csv", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => console.error("Error uploading CSV:", err));
  };

  // Bluetooth helpers
  const logStatus = (s) => {
    console.log("[BT]", s);
    setStatus(s);
  };

  const scanForDevice = async () => {
    try {
      logStatus("🔍 Scanning...");
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [NUS_SERVICE],
      });
      setDevices((prev) => [...prev, device]);

      logStatus("Device found. Click to connect.");
    } catch (err) {
      console.error(err);
      logStatus("❌ Error: " + (err.message || err));
    }
  };

  const connectToDevice = async (device) => {
    try {
      deviceRef.current = device;
      setDeviceName(device.name || device.id);
      logStatus("🔗 Connecting...");
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(NUS_SERVICE);

      const rxChar = await service.getCharacteristic(NUS_RX);
      await rxChar.startNotifications();
      rxChar.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        const decoded = new TextDecoder().decode(value);
        // CSV receive mode: accumulate CSV data
        if (csvReceiving) {
          if (decoded.includes("__CSV_END__")) {
            setCsvFromBluetooth((prev) => prev + decoded.replace("__CSV_END__", ""));
            setCsvReceiving(false);
            setCsvReady(true);
            logStatus("✅ CSV received. Ready to upload.");
          } else {
            setCsvFromBluetooth((prev) => prev + decoded);
          }
        } else {
          setReceived((r) => r + decoded);
        }
      });

      const txChar = await service.getCharacteristic(NUS_TX);
      writeCharRef.current = txChar;

      logStatus("✅ Connected and ready");
    } catch (err) {
      console.error(err);
      logStatus("❌ Connection error: " + (err.message || err));
    }
  };
  // Start CSV receive mode
  const startCsvReceive = () => {
    setCsvFromBluetooth("");
    setCsvReceiving(true);
    setCsvReady(false);
    logStatus("🟡 Waiting for CSV data over Bluetooth...");
  };

  // Send accumulated CSV to backend
  const uploadCsvFromBluetooth = () => {
    if (!csvFromBluetooth) return alert("No CSV data received!");
    fetch("http://127.0.0.1:5000/upload_csv_text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvFromBluetooth })
    })
      .then((res) => res.json())
      .then((data) => setChartData(data))
      .catch((err) => alert("Error uploading CSV from Bluetooth: " + err));
  };

  const sendText = async (text) => {
    try {
      if (!writeCharRef.current) return logStatus("⚠️ Not connected");
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      await writeCharRef.current.writeValue(data);
      logStatus("📤 Sent: " + text);
    } catch (err) {
      console.error(err);
      logStatus("❌ Send error: " + (err.message || err));
    }
  };

  const disconnect = async () => {
    try {
      const d = deviceRef.current;
      if (d?.gatt?.connected) {
        d.gatt.disconnect();
        logStatus("🔌 Disconnected");
      } else {
        logStatus("⚠️ No device to disconnect");
      }
    } catch (err) {
      console.error(err);
      logStatus("❌ Disconnect error");
    }
  };

  // Set dark mode class on body
  React.useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);


  // Return main JSX
  return (
    <>
      {/* Help/About Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">×</button>
            <h2>About This App</h2>
            <p>
              <b>Bluetooth Communication & CSV Plotter</b> is a modern web app for visualizing CSV data and communicating with Bluetooth LE devices.<br/>
              <ul style={{marginTop:8,marginBottom:8}}>
                <li>Upload CSV files and plot data instantly</li>
                <li>Scan, connect, and communicate with BLE devices (e.g., your phone)</li>
                <li>Send/receive text and CSV over Bluetooth</li>
                <li>Works best in Chrome/Edge on desktop</li>
              </ul>
            </p>
            <h3>Help & Contact</h3>
            <p>
              <b>Having trouble?</b> Ensure Bluetooth is enabled and use a BLE app like <em>nRF Connect</em> on your phone.<br/>
              For support, contact: <a href="mailto:support@example.com">support@example.com</a>
            </p>
            <h3>Credits</h3>
            <p>
              UI/UX by Thryv Mobility Team.<br/>
              Built with React, Plotly.js, and Web Bluetooth API.
            </p>
          </div>
        </div>
      )}

  {/* Live Particle Background */}
  <ParticleBackground />

      {/* Landing Section with centered navbar and info directly in app-container */}
      <div className="app-container" id="landing">
        {/* Confetti animation */}
        <div className="confetti">
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
          <div className="confetti-piece"></div>
        </div>
        <div className="landing-content">
          <h1 className="thryv-header">Thryv Mobility</h1>
          <nav className="main-navbar landing-navbar" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20}}>
            <button className="nav-btn" onClick={() => document.getElementById('landing').scrollIntoView({behavior:'smooth'})}>Home</button>
            <button className="nav-btn" onClick={() => document.getElementById('upload-section').scrollIntoView({behavior:'smooth'})}>CSV Upload</button>
            <button className="nav-btn" onClick={() => document.getElementById('bluetooth-section').scrollIntoView({behavior:'smooth'})}>Bluetooth Comm</button>
            <button className="nav-btn" onClick={() => setDarkMode((d) => !d)} aria-label="Toggle dark mode">
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button className="nav-btn" onClick={() => setShowModal(true)}>❓ Help/About</button>
          </nav>
          <h2 className="landing-heading">Welcome to the Bluetooth Communication & CSV Plotter App</h2>
          <p className="landing-welcome-desc" style={{maxWidth:'700px',margin:'18px auto 0 auto',fontSize:'1.13em',color:'var(--text-color)'}}>
            Welcome to the Bluetooth Communication & CSV Plotter Web App—a simple yet powerful tool designed to streamline your workflow. Whether you're visualizing sensor data from CSV files or testing Bluetooth connectivity with your phone, this platform offers a clean, intuitive interface that works seamlessly in modern browsers. Built for speed, clarity, and convenience, it’s the perfect companion for developers, testers, and data enthusiasts working with BLE and real-time data.
          </p>
          <p className="landing-desc">
            This website allows you to upload CSV files for quick data visualization and also provides a modern interface for Bluetooth communication with your phone.
          </p>
          <div className="task-card-row">
            <div className="task-card">
              <span className="task-card-num">1</span>
              <div>From the frontend GUI, <b>scan and list available Bluetooth devices</b>.</div>
            </div>
            <div className="task-card">
              <span className="task-card-num">2</span>
              <div>Allow the user to <b>select a phone from the list</b>.</div>
            </div>
            <div className="task-card">
              <span className="task-card-num">3</span>
              <div><b>Establish a Bluetooth connection</b> to the selected phone.</div>
            </div>
          </div>
          <span className="scroll-cue">↓</span>
        </div>
      </div>



      {/* CSV Upload & Plotting Section */}
      <div className="app-container" id="upload-section">
        <header className="header">
          <h1>📁 CSV Upload & 📊 Plotting</h1>
          <div className="upload-section">
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="csv-upload" className="custom-file-label">
              {csvFile ? "Change File" : "Choose File"}
            </label>
            {csvFile && (
              <span className="file-chosen" style={{marginLeft:10, fontWeight:500, color:"var(--accent-color)"}}>
                {csvFile.name}
              </span>
            )}
            <button onClick={handleUpload}>Upload & Plot</button>
          </div>
        </header>
        {chartData && (
          <div className="plot-section">
            <h2>📈 Full Data Plot</h2>
            <Plot
              data={chartData.columns
                .filter((col) => col !== "Timestamp")
                .map((col) => ({
                  x: (chartData.all || chartData.preview).map((row) => row.Timestamp),
                  y: (chartData.all || chartData.preview).map((row) => row[col]),
                  type: "scatter",
                  mode: "lines+markers",
                  name: col,
                }))}
              layout={{
                width: 1100,
                height: 500,
                title: "CSV Data Plot",
                paper_bgcolor: "#f9f9f9",
                plot_bgcolor: "#ffffff",
              }}
            />
          </div>
        )}
      </div>



      {/* Bluetooth Communication Section */}
      <div className="app-container" id="bluetooth-section">
        <section className="bluetooth-section">
          <div className="bt-header-box">
            <h1 className="bt-header">📡 Bluetooth Communication</h1>
          </div>
         <div className="bt-info-row">
  <div className="bt-info-box">
    <span className="bt-info-label">Device:</span>
    <span className="bt-info-value">{deviceName || "—"}</span>
  </div>
  <div className="bt-info-box">
    <span className="bt-info-label">Status:</span>
    <span className="bt-info-value">{status}</span>
  </div>
</div>
<div className="bt-buttons">
  <button className="gradient-btn" type="button" onClick={scanForDevice}>🔍 Scan</button>
  <button className="gradient-btn" type="button" onClick={disconnect}>🔌 Disconnect</button>
</div>

          {devices.length > 0 && (
            <div className="device-list">
              <h3>🧭 Available Devices</h3>
              <ul>
                {devices.map((d, i) => (
                  <li key={i}>
                    <button className="nav-btn" onClick={() => connectToDevice(d)}>
                      {d.name || "Unknown"} ({d.id})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        <div className="send-section bt-send-section">
  <div className="bt-input-wrapper">
    <input id="bt-text" placeholder="Type a message..." className="bt-text-input" />
  </div>
  <div className="bt-button-group">
    <button className="nav-btn" type="button" onClick={() => {
      const v = document.getElementById("bt-text").value || "hello";
      sendText(v);
    }}>
      📤 Send
    </button>
    <button className="nav-btn" type="button" onClick={startCsvReceive} disabled={csvReceiving}>
      {csvReceiving ? "Receiving CSV..." : "Start CSV Receive"}
    </button>
    <button className="nav-btn" type="button" onClick={uploadCsvFromBluetooth} disabled={!csvReady}>
      Upload CSV to Plot
    </button>
  </div>
</div>

          {csvReceiving && (
            <div className="note">Receiving CSV data over Bluetooth... Waiting for end marker <code>__CSV_END__</code></div>
          )}
          {csvFromBluetooth && (
            <div className="note" style={{marginTop:8, maxHeight:120, overflow:'auto', background:'#f7f7f7'}}>
              <b>CSV Data (preview):</b>
              <pre style={{whiteSpace:'pre-wrap', wordBreak:'break-all'}}>{csvFromBluetooth.slice(0, 500)}{csvFromBluetooth.length > 500 ? "..." : ""}</pre>
            </div>
          )}
            <div className="bt-received-device-box">
  <h4>📡 Receiving From:</h4>
  <p>{deviceName || "No device connected"}</p>


    {deviceName && (
  <div className="bt-received-device-box">
    <h4>📡 Receiving From:</h4>
    <p>{deviceName}</p>
  </div>
)}

  </div>

  
          <p className="note">
            📝 Works only in Chrome/Edge. Use a BLE peripheral app like <em>nRF Connect</em> with UART enabled.
          </p>
        </section>
      </div>
    </>
  );
}

export default App;
