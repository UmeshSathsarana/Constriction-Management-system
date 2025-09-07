import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Dashboard/admin-dashboard.css';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/clients');
        setClients(response.data.clients);
      } catch (err) {
        setError('Error fetching clients');
      }
    };

    fetchClients();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1 className="admin-header h1">Client Management</h1>
          <p className="admin-header p">Manage your client relationships</p>
        </div>
        <Link to="/create-client">
          <button className="add-user-btn">+ Add New Client</button>
        </Link>
      </div>

      <div className="user-management">
        <div className="user-stats-grid">
          <div className="user-stat-card">
            <h4>Total Clients</h4>
            <p className="user-stat-number">{clients.length}</p>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td>{client.company || "-"}</td>
                  <td>{client.email || "-"}</td>
                  <td>{client.phone || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/client/${client._id}`}>
                        <button className="action-btn view">View</button>
                      </Link>
                      <Link to={`/edit-client/${client._id}`}>
                        <button className="action-btn edit">Edit</button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientList;
