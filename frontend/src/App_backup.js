import React, { useEffect, useState } from "react";

function App() {
  const [backendData, setBackendData] = useState("waiting...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/") // Flask backend
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend response:", data); // Debug log
        setBackendData(data.message); // Set the message from backend
      })
      .catch((error) => console.error("Error fetching backend:", error));
  }, []);

  return (
    <div>
      <h1>React + Flask App 🔗</h1>
      <p>Backend says: {backendData}</p>
    </div>
  );
}

export default App;
