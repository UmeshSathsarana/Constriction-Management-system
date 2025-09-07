// components/Notifications/Notifications.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const Notifications = ({ authUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchClients();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get("/clients");
      setClients(res.data.clients);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/notifications", {
        clientId: selectedClient,
        message,
        sender: authUser._id,
      });
      setMessage("");
      fetchNotifications();
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  return (
    <div className="notifications-container">
      <h2>Client Communications</h2>

      {/* Send Notification Form */}
      <form onSubmit={sendNotification} className="notification-form">
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          required
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.name} - {client.company}
            </option>
          ))}
        </select>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          required
          rows="4"
        />

        <button type="submit">Send Message</button>
      </form>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div key={notification._id} className="notification-card">
            <h4>To: {notification.client.name}</h4>
            <p>{notification.message}</p>
            <small>
              Sent on: {new Date(notification.createdAt).toLocaleDateString()}
              by {notification.sender.name}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
