import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const tabId = getOrCreateTabId();

  function getOrCreateTabId() {
    let id = sessionStorage.getItem("tabId");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tabId", id);
    }
    return id;
  }

  const enforceTabLock = () => {
    const activeTabId = localStorage.getItem("activeTabId");
    const token = localStorage.getItem("token");
    if (token && activeTabId && tabId !== activeTabId) {
      forceLogout("Logged out: Only one tab allowed");
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:4000/login", { tabId });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("activeTabId", tabId);
      setIsLoggedIn(true);
      setMessage("Logged in successfully");
    } catch (error) {
      setMessage("Login failed");
    }
  };

  const logout = () => {
    forceLogout("Logged out manually");
  };

  const forceLogout = (msg) => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeTabId");
    sessionStorage.removeItem("tabId");
    setIsLoggedIn(false);
    setMessage(msg);
  };

  const fetchProtected = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:4000/protected", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tab-id": tabId,
        },
      });
      setMessage(res.data.message);
    } catch (error) {
      forceLogout("Session expired or unauthorized. Logging out.");
    }
  };

  useEffect(() => {
    enforceTabLock();

    const token = localStorage.getItem("token");
    const activeTabId = localStorage.getItem("activeTabId");
    if (token && activeTabId && tabId === activeTabId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const onFocus = () => {
      enforceTabLock();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
       <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", textAlign: "center", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ color: "#333", marginBottom: "1.5rem" }}>Single Tab Session Enforcement</h2>
      {!isLoggedIn ? (
        <button 
          onClick={login} 
          style={{ padding: "0.5rem 1rem", fontSize: "1rem", color: "#fff", backgroundColor: "#007BFF", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Login
        </button>
      ) : (
        <>
          <button 
            onClick={fetchProtected} 
            style={{ padding: "0.5rem 1rem", fontSize: "1rem", color: "#fff", backgroundColor: "#28A745", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "1rem" }}
          >
            Fetch Protected Data
          </button>
          <button 
            onClick={logout} 
            style={{ padding: "0.5rem 1rem", fontSize: "1rem", color: "#fff", backgroundColor: "#DC3545", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Logout
          </button>
        </>
      )}
      <h3 style={{ textDecoration:"bold", marginTop: "1.5rem", color: "#555", fontSize: "1rem" }}>{message}</h3>
    </div>
  );
};

export default App;
