// frontend/src/BluetoothPanel.js
import React, { useState, useRef } from "react";

const NUS_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const NUS_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // write -> peripheral
const NUS_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // notify <- peripheral

export default function BluetoothPanel() {
  const [deviceName, setDeviceName] = useState(null);
  const [status, setStatus] = useState("Not connected");
  const [received, setReceived] = useState("");
  const writeCharRef = useRef(null);
  const deviceRef = useRef(null);

  const logStatus = (s) => {
    console.log("[BT]", s);
    setStatus(s);
  };

  const scanAndConnect = async () => {
    try {
      logStatus("Requesting device...");
      const device = await navigator.bluetooth.requestDevice({
        // acceptAllDevices true is fine for testing; for production prefer filters.
        acceptAllDevices: true,
        optionalServices: [NUS_SERVICE],
      });
      deviceRef.current = device;
      setDeviceName(device.name || device.id);
      logStatus("Connecting to GATT...");
      const server = await device.gatt.connect();
      logStatus("Getting service...");
      const service = await server.getPrimaryService(NUS_SERVICE);

      // notification characteristic (peripheral -> central)
      const rxChar = await service.getCharacteristic(NUS_RX);
      await rxChar.startNotifications();
      rxChar.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        const decoded = new TextDecoder().decode(value);
        setReceived((r) => r + decoded);
      });

      // write characteristic (central -> peripheral)
      const txChar = await service.getCharacteristic(NUS_TX);
      writeCharRef.current = txChar;

      logStatus("Connected and ready");
    } catch (err) {
      console.error(err);
      logStatus("Error: " + (err.message || err));
    }
  };

  const sendText = async (text) => {
    try {
      if (!writeCharRef.current) {
        logStatus("Not connected to writable characteristic");
        return;
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      await writeCharRef.current.writeValue(data);
      logStatus("Sent: " + text);
    } catch (err) {
      console.error(err);
      logStatus("Send error: " + (err.message || err));
    }
  };

  const disconnect = async () => {
    try {
      const d = deviceRef.current;
      if (d && d.gatt && d.gatt.connected) {
        d.gatt.disconnect();
        logStatus("Disconnected");
      } else {
        logStatus("No device to disconnect");
      }
    } catch (err) {
      console.error(err);
      logStatus("Disconnect error");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h2>Bluetooth Panel</h2>
      <p>Device: {deviceName || "—"}</p>
      <p>Status: {status}</p>

      <div style={{ margin: 8 }}>
        <button onClick={scanAndConnect}>Scan & Connect</button>{" "}
        <button onClick={disconnect}>Disconnect</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <input id="bt-text" placeholder="Text to send" style={{ width: 300 }} />
        <button
          onClick={() => {
            const v = document.getElementById("bt-text").value || "hello";
            sendText(v);
          }}
          style={{ marginLeft: 8 }}
        >
          Send Text
        </button>

        
      </div>

      <div style={{ marginTop: 12 }}>
        <h4>Received (from device):</h4>
        <pre style={{ maxHeight: 150, overflow: "auto", textAlign: "left" }}>
          {received || "—"}
        </pre>
      </div>

      <small>
        Note: Use Chrome/Edge on desktop (localhost allowed). For phone to respond,
        run a BLE peripheral app (e.g. nRF Connect / nRF UART) and enable the UART
        (Nordic) service.
      </small>
    </div>
  );
}
