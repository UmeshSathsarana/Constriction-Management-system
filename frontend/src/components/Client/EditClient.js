// components/Client/EditClient.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/clients/${id}`);
        const client = response.data.client;
        setClientData({
          name: client.name || "",
          company: client.company || "",
          email: client.email || "",
          phone: client.phone || "",
          address: client.address || "",
          contactPerson: client.contactPerson || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Error fetching client data");
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/clients/${id}`, clientData);
      alert("Client updated successfully");
      navigate(`/client/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating client");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Client</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={clientData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Company:</label>
          <input
            type="text"
            name="company"
            value={clientData.company}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={clientData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={clientData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address:</label>
          <textarea
            name="address"
            value={clientData.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Contact Person:</label>
          <input
            type="text"
            name="contactPerson"
            value={clientData.contactPerson}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Client</button>
        <button type="button" onClick={() => navigate(`/client/${id}`)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditClient;
