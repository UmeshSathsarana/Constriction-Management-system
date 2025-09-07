// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import io from "socket.io-client";

// const CreateProjectEnhanced = () => {
//   const navigate = useNavigate();
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [clients, setClients] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showClientModal, setShowClientModal] = useState(false);
//   const [selectedClient, setSelectedClient] = useState(null);

//   const [projectData, setProjectData] = useState({
//     pid: "",
//     name: "",
//     description: "",
//     location: "",
//     startDate: "",
//     endDate: "",
//     budget: "",
//     client: "",
//     projectManager: "",
//     siteSupervisor: "",
//     financeManager: "",
//   });

//   // New client form for quick client creation
//   const [newClientForm, setNewClientForm] = useState({
//     name: "",
//     company: "",
//     email: "",
//     phone: "",
//     address: "",
//     contactPerson: "",
//   });

//   useEffect(() => {
//     // Initialize socket connection
//     const newSocket = io("http://localhost:5000", {
//       transports: ["websocket", "polling"],
//       timeout: 20000,
//     });

//     newSocket.on("connect", () => {
//       console.log("Connected to server for project creation");
//       setConnected(true);
//     });

//     newSocket.on("disconnect", () => {
//       console.log("Disconnected from server");
//       setConnected(false);
//     });

//     // Listen for new client creation
//     newSocket.on("client-created", (data) => {
//       console.log("New client created:", data);
//       fetchClients(); // Refresh clients list
//     });

//     setSocket(newSocket);
//     fetchData();

//     return () => {
//       newSocket.close();
//     };
//   }, []);

//   const fetchData = async () => {
//     try {
//       // Fetch clients
//       const clientsRes = await axios.get("http://localhost:5000/clients");
//       setClients(clientsRes.data.clients || []);

//       // Fetch users for role assignment
//       const usersRes = await axios.get("http://localhost:5000/users");
//       setUsers(usersRes.data.users || []);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const clientsRes = await axios.get("http://localhost:5000/clients");
//       setClients(clientsRes.data.clients || []);
//     } catch (error) {
//       console.error("Error fetching clients:", error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProjectData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleClientChange = (e) => {
//     const clientId = e.target.value;
//     setProjectData((prev) => ({ ...prev, client: clientId }));

//     // Find and set selected client for display
//     const client = clients.find((c) => c._id === clientId);
//     setSelectedClient(client);
//   };

//   const handleNewClientChange = (e) => {
//     const { name, value } = e.target;
//     setNewClientForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCreateClient = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/clients",
//         newClientForm
//       );
//       const newClient = response.data.client;

//       // Add to clients list and select it
//       setClients((prev) => [newClient, ...prev]);
//       setProjectData((prev) => ({ ...prev, client: newClient._id }));
//       setSelectedClient(newClient);

//       // Reset form and close modal
//       setNewClientForm({
//         name: "",
//         company: "",
//         email: "",
//         phone: "",
//         address: "",
//         contactPerson: "",
//       });
//       setShowClientModal(false);

//       alert("Client created successfully!");
//     } catch (error) {
//       console.error("Error creating client:", error);
//       alert(
//         "Error creating client: " +
//           (error.response?.data?.message || error.message)
//       );
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Prepare project data
//       const submitData = {
//         ...projectData,
//         budget: parseFloat(projectData.budget) || 0,
//       };

//       // Remove empty fields
//       Object.keys(submitData).forEach((key) => {
//         if (submitData[key] === "") {
//           delete submitData[key];
//         }
//       });

//       const response = await axios.post(
//         "http://localhost:5000/projects",
//         submitData
//       );
//       console.log("Project created:", response.data);

//       alert("Project created successfully!");
//       navigate("/projects");
//     } catch (err) {
//       console.error("Error:", err);
//       setError(err.response?.data?.message || "Error creating project");
//       setLoading(false);
//     }
//   };

//   const getUsersByRole = (role) => {
//     return users.filter((user) => user.role === role && user.isActive);
//   };

//   return (
//     <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
//       {/* Connection Status */}
//       <div
//         style={{
//           position: "fixed",
//           top: 10,
//           right: 10,
//           zIndex: 1000,
//           padding: "5px 10px",
//           borderRadius: 5,
//           backgroundColor: connected ? "#4caf50" : "#f44336",
//           color: "white",
//           fontSize: 12,
//         }}
//       >
//         {connected ? "🟢 Connected" : "🔴 Disconnected"}
//       </div>

//       <div style={{ marginBottom: 30 }}>
//         <h1>Create New Project</h1>
//         {error && (
//           <div
//             style={{
//               color: "red",
//               backgroundColor: "#ffebee",
//               padding: 10,
//               borderRadius: 4,
//               marginBottom: 20,
//             }}
//           >
//             {error}
//           </div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit}>
//         {/* Basic Project Information */}
//         <div
//           style={{
//             border: "1px solid #ddd",
//             borderRadius: 8,
//             padding: 20,
//             marginBottom: 20,
//             backgroundColor: "#fff",
//           }}
//         >
//           <h3 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>
//             Basic Information
//           </h3>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: 20,
//               marginBottom: 20,
//             }}
//           >
//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Project ID *
//               </label>
//               <input
//                 type="text"
//                 name="pid"
//                 value={projectData.pid}
//                 onChange={handleChange}
//                 placeholder="e.g., PROJ-2024-001"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>

//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Project Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={projectData.name}
//                 onChange={handleChange}
//                 placeholder="Enter project name"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>
//           </div>

//           <div className="form-group" style={{ marginBottom: 20 }}>
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={projectData.description}
//               onChange={handleChange}
//               placeholder="Project description..."
//               rows="4"
//               style={{
//                 width: "100%",
//                 padding: 10,
//                 borderRadius: 4,
//                 border: "1px solid #ddd",
//                 fontSize: 14,
//                 resize: "vertical",
//               }}
//             />
//           </div>

//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
//           >
//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Location *
//               </label>
//               <input
//                 type="text"
//                 name="location"
//                 value={projectData.location}
//                 onChange={handleChange}
//                 placeholder="Project location"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>

//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Budget *
//               </label>
//               <input
//                 type="number"
//                 name="budget"
//                 value={projectData.budget}
//                 onChange={handleChange}
//                 placeholder="Project budget"
//                 min="0"
//                 step="0.01"
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Timeline */}
//         <div
//           style={{
//             border: "1px solid #ddd",
//             borderRadius: 8,
//             padding: 20,
//             marginBottom: 20,
//             backgroundColor: "#fff",
//           }}
//         >
//           <h3 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>
//             Project Timeline
//           </h3>

//           <div
//             style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
//           >
//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Start Date *
//               </label>
//               <input
//                 type="date"
//                 name="startDate"
//                 value={projectData.startDate}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>

//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 End Date *
//               </label>
//               <input
//                 type="date"
//                 name="endDate"
//                 value={projectData.endDate}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Client Selection */}
//         <div
//           style={{
//             border: "1px solid #ddd",
//             borderRadius: 8,
//             padding: 20,
//             marginBottom: 20,
//             backgroundColor: "#fff",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 20,
//             }}
//           >
//             <h3 style={{ margin: 0, color: "#333" }}>Client Information</h3>
//             <button
//               type="button"
//               onClick={() => setShowClientModal(true)}
//               style={{
//                 backgroundColor: "#2196f3",
//                 color: "white",
//                 border: "none",
//                 padding: "8px 16px",
//                 borderRadius: 4,
//                 cursor: "pointer",
//                 fontSize: 14,
//               }}
//             >
//               + Add New Client
//             </button>
//           </div>

//           <div className="form-group" style={{ marginBottom: 20 }}>
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Select Client
//             </label>
//             <select
//               name="client"
//               value={projectData.client}
//               onChange={handleClientChange}
//               style={{
//                 width: "100%",
//                 padding: 10,
//                 borderRadius: 4,
//                 border: "1px solid #ddd",
//                 fontSize: 14,
//               }}
//             >
//               <option value="">Select a client...</option>
//               {clients.map((client) => (
//                 <option key={client._id} value={client._id}>
//                   {client.name} {client.company ? `(${client.company})` : ""}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Selected Client Details */}
//           {selectedClient && (
//             <div
//               style={{
//                 backgroundColor: "#f8f9fa",
//                 padding: 15,
//                 borderRadius: 4,
//                 border: "1px solid #e9ecef",
//               }}
//             >
//               <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>
//                 Client Details
//               </h4>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 15,
//                 }}
//               >
//                 <div>
//                   <p style={{ margin: "5px 0" }}>
//                     <strong>Name:</strong> {selectedClient.name}
//                   </p>
//                   <p style={{ margin: "5px 0" }}>
//                     <strong>Company:</strong> {selectedClient.company || "N/A"}
//                   </p>
//                   <p style={{ margin: "5px 0" }}>
//                     <strong>Email:</strong> {selectedClient.email}
//                   </p>
//                 </div>
//                 <div>
//                   <p style={{ margin: "5px 0" }}>
//                     <strong>Phone:</strong> {selectedClient.phone || "N/A"}
//                   </p>
//                   <p style={{ margin: "5px 0" }}>
//                     <strong>Contact Person:</strong>{" "}
//                     {selectedClient.contactPerson || "N/A"}
//                   </p>
//                   {selectedClient.budgetInfo?.totalBudget && (
//                     <p style={{ margin: "5px 0" }}>
//                       <strong>Client Budget:</strong> $
//                       {selectedClient.budgetInfo.totalBudget.toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               {selectedClient.address && (
//                 <p style={{ margin: "10px 0 5px 0" }}>
//                   <strong>Address:</strong> {selectedClient.address}
//                 </p>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Team Assignment */}
//         <div
//           style={{
//             border: "1px solid #ddd",
//             borderRadius: 8,
//             padding: 20,
//             marginBottom: 20,
//             backgroundColor: "#fff",
//           }}
//         >
//           <h3 style={{ marginTop: 0, marginBottom: 20, color: "#333" }}>
//             Team Assignment
//           </h3>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: 20,
//               marginBottom: 20,
//             }}
//           >
//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Project Manager
//               </label>
//               <select
//                 name="projectManager"
//                 value={projectData.projectManager}
//                 onChange={handleChange}
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               >
//                 <option value="">Select Project Manager...</option>
//                 {getUsersByRole("Project Manager").map((user) => (
//                   <option key={user._id} value={user._id}>
//                     {user.name} ({user.email})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: 5,
//                   fontWeight: "bold",
//                 }}
//               >
//                 Site Supervisor
//               </label>
//               <select
//                 name="siteSupervisor"
//                 value={projectData.siteSupervisor}
//                 onChange={handleChange}
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   borderRadius: 4,
//                   border: "1px solid #ddd",
//                   fontSize: 14,
//                 }}
//               >
//                 <option value="">Select Site Supervisor...</option>
//                 {getUsersByRole("Site Supervisor").map((user) => (
//                   <option key={user._id} value={user._id}>
//                     {user.name} ({user.email})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="form-group">
//             <label
//               style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
//             >
//               Finance Manager
//             </label>
//             <select
//               name="financeManager"
//               value={projectData.financeManager}
//               onChange={handleChange}
//               style={{
//                 width: "100%",
//                 padding: 10,
//                 borderRadius: 4,
//                 border: "1px solid #ddd",
//                 fontSize: 14,
//               }}
//             >
//               <option value="">Select Finance Manager...</option>
//               {getUsersByRole("Financial Manager").map((user) => (
//                 <option key={user._id} value={user._id}>
//                   {user.name} ({user.email})
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Submit Button */}
//         <div style={{ textAlign: "center", paddingTop: 20 }}>
//           <button
//             type="button"
//             onClick={() => navigate("/projects")}
//             style={{
//               backgroundColor: "#9e9e9e",
//               color: "white",
//               border: "none",
//               padding: "12px 24px",
//               borderRadius: 4,
//               cursor: "pointer",
//               fontSize: 16,
//               marginRight: 15,
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               backgroundColor: loading ? "#ccc" : "#4caf50",
//               color: "white",
//               border: "none",
//               padding: "12px 24px",
//               borderRadius: 4,
//               cursor: loading ? "not-allowed" : "pointer",
//               fontSize: 16,
//             }}
//           >
//             {loading ? "Creating Project..." : "Create Project"}
//           </button>
//         </div>
//       </form>

//       {/* New Client Modal */}
//       {showClientModal && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               backgroundColor: "white",
//               padding: 30,
//               borderRadius: 8,
//               maxWidth: 600,
//               width: "90%",
//               maxHeight: "80%",
//               overflow: "auto",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 20,
//               }}
//             >
//               <h2 style={{ margin: 0 }}>Add New Client</h2>
//               <button
//                 onClick={() => setShowClientModal(false)}
//                 style={{
//                   backgroundColor: "transparent",
//                   border: "none",
//                   fontSize: 24,
//                   cursor: "pointer",
//                   color: "#666",
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <form onSubmit={handleCreateClient}>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 15,
//                   marginBottom: 15,
//                 }}
//               >
//                 <div className="form-group">
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: 5,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Client Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={newClientForm.name}
//                     onChange={handleNewClientChange}
//                     required
//                     style={{
//                       width: "100%",
//                       padding: 8,
//                       borderRadius: 4,
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: 5,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Company
//                   </label>
//                   <input
//                     type="text"
//                     name="company"
//                     value={newClientForm.company}
//                     onChange={handleNewClientChange}
//                     style={{
//                       width: "100%",
//                       padding: 8,
//                       borderRadius: 4,
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 15,
//                   marginBottom: 15,
//                 }}
//               >
//                 <div className="form-group">
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: 5,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Email *
//                   </label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={newClientForm.email}
//                     onChange={handleNewClientChange}
//                     required
//                     style={{
//                       width: "100%",
//                       padding: 8,
//                       borderRadius: 4,
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label
//                     style={{
//                       display: "block",
//                       marginBottom: 5,
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Phone
//                   </label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={newClientForm.phone}
//                     onChange={handleNewClientChange}
//                     style={{
//                       width: "100%",
//                       padding: 8,
//                       borderRadius: 4,
//                       border: "1px solid #ddd",
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="form-group" style={{ marginBottom: 15 }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: 5,
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Contact Person
//                 </label>
//                 <input
//                   type="text"
//                   name="contactPerson"
//                   value={newClientForm.contactPerson}
//                   onChange={handleNewClientChange}
//                   style={{
//                     width: "100%",
//                     padding: 8,
//                     borderRadius: 4,
//                     border: "1px solid #ddd",
//                   }}
//                 />
//               </div>

//               <div className="form-group" style={{ marginBottom: 20 }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: 5,
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Address
//                 </label>
//                 <textarea
//                   name="address"
//                   value={newClientForm.address}
//                   onChange={handleNewClientChange}
//                   rows="3"
//                   style={{
//                     width: "100%",
//                     padding: 8,
//                     borderRadius: 4,
//                     border: "1px solid #ddd",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => setShowClientModal(false)}
//                   style={{
//                     backgroundColor: "#9e9e9e",
//                     color: "white",
//                     border: "none",
//                     padding: "10px 20px",
//                     borderRadius: 4,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   style={{
//                     backgroundColor: "#4caf50",
//                     color: "white",
//                     border: "none",
//                     padding: "10px 20px",
//                     borderRadius: 4,
//                     cursor: "pointer",
//                   }}
//                 >
//                   Create Client
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CreateProjectEnhanced;
