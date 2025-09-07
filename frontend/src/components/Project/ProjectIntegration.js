// // ProjectIntegration.js - Example of how to integrate client details in existing project components

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Example: Enhanced Project Card Component with Client Details
// export const ProjectCardWithClient = ({ project, onProjectClick }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Completed': return '#4caf50';
//       case 'Active': 
//       case 'In Progress': return '#2196f3';
//       case 'Planning': return '#ff9800';
//       case 'Cancelled': return '#f44336';
//       default: return '#9e9e9e';
//     }
//   };

//   return (
//     <div
//       style={{
//         border: '1px solid #ddd',
//         borderRadius: 8,
//         padding: 20,
//         backgroundColor: '#fff',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//         cursor: 'pointer',
//         transition: 'transform 0.2s, box-shadow 0.2s'
//       }}
//       onClick={() => onProjectClick && onProjectClick(project)}
//     >
//       {/* Project Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'flex-start',
//         marginBottom: 15 
//       }}>
//         <div>
//           <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
//             {project.name}
//           </h3>
//           <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
//             ID: {project.pid}
//           </p>
//         </div>
//         <span
//           style={{
//             padding: '4px 12px',
//             borderRadius: 20,
//             fontSize: 12,
//             fontWeight: 'bold',
//             color: 'white',
//             backgroundColor: getStatusColor(project.status)
//           }}
//         >
//           {project.status}
//         </span>
//       </div>

//       {/* Project Details */}
//       <div style={{ marginBottom: 15 }}>
//         <p style={{ margin: '5px 0', fontSize: 14 }}>
//           <strong>📍 Location:</strong> {project.location}
//         </p>
//         <p style={{ margin: '5px 0', fontSize: 14 }}>
//           <strong>💰 Budget:</strong> ${project.budget?.toLocaleString() || 'N/A'}
//         </p>
//         <p style={{ margin: '5px 0', fontSize: 14 }}>
//           <strong>📊 Progress:</strong> {project.progress || 0}%
//         </p>
//       </div>

//       {/* CLIENT DETAILS - NEW ADDITION */}
//       {project.client && (
//         <div style={{ 
//           backgroundColor: '#f8f9fa', 
//           padding: 10, 
//           borderRadius: 4,
//           marginBottom: 15,
//           border: '1px solid #e9ecef'
//         }}>
//           <p style={{ margin: '2px 0', fontSize: 13, fontWeight: 'bold', color: '#495057' }}>
//             👤 Client: {project.client.name}
//           </p>
//           {project.client.company && (
//             <p style={{ margin: '2px 0', fontSize: 13, color: '#6c757d' }}>
//               🏢 Company: {project.client.company}
//             </p>
//           )}
//           <p style={{ margin: '2px 0', fontSize: 13, color: '#6c757d' }}>
//             📧 Email: {project.client.email}
//           </p>
//           {project.client.phone && (
//             <p style={{ margin: '2px 0', fontSize: 13, color: '#6c757d' }}>
//               📞 Phone: {project.client.phone}
//             </p>
//           )}
//         </div>
//       )}

//       {/* Team Information */}
//       <div style={{ fontSize: 13, color: '#666' }}>
//         {project.projectManager && (
//           <p style={{ margin: '2px 0' }}>
//             👨‍💼 PM: {project.projectManager.name}
//           </p>
//         )}
//         {project.siteSupervisor && (
//           <p style={{ margin: '2px 0' }}>
//             👷 Supervisor: {project.siteSupervisor.name}
//           </p>
//         )}
//         {project.financeManager && (
//           <p style={{ margin: '2px 0' }}>
//             💼 Finance: {project.financeManager.name}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// // Example: Client Selection Component for Project Forms
// export const ClientSelector = ({ 
//   selectedClientId, 
//   onClientChange, 
//   onCreateNewClient,
//   clients = [],
//   loading = false 
// }) => {
//   const [showClientDetails, setShowClientDetails] = useState(false);
//   const selectedClient = clients.find(c => c._id === selectedClientId);

//   return (
//     <div style={{ marginBottom: 20 }}>
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: 10 
//       }}>
//         <label style={{ fontWeight: 'bold', fontSize: 16 }}>
//           Select Client
//         </label>
//         <button
//           type="button"
//           onClick={onCreateNewClient}
//           style={{
//             backgroundColor: '#2196f3',
//             color: 'white',
//             border: 'none',
//             padding: '8px 16px',
//             borderRadius: 4,
//             cursor: 'pointer',
//             fontSize: 14
//           }}
//         >
//           + Add New Client
//         </button>
//       </div>

//       <select
//         value={selectedClientId || ''}
//         onChange={(e) => onClientChange(e.target.value)}
//         disabled={loading}
//         style={{ 
//           width: '100%', 
//           padding: 12, 
//           borderRadius: 4, 
//           border: '1px solid #ddd',
//           fontSize: 14,
//           backgroundColor: loading ? '#f5f5f5' : 'white'
//         }}
//       >
//         <option value="">
//           {loading ? 'Loading clients...' : 'Select a client...'}
//         </option>
//         {clients.map(client => (
//           <option key={client._id} value={client._id}>
//             {client.name} {client.company ? `(${client.company})` : ''}
//           </option>
//         ))}
//       </select>

//       {/* CLIENT DETAILS DISPLAY - NEW ADDITION */}
//       {selectedClient && (
//         <div style={{ 
//           marginTop: 15,
//           backgroundColor: '#f8f9fa', 
//           padding: 15, 
//           borderRadius: 4, 
//           border: '1px solid #e9ecef' 
//         }}>
//           <div style={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             alignItems: 'center',
//             marginBottom: 10
//           }}>
//             <h4 style={{ margin: 0, color: '#495057' }}>Client Details</h4>
//             <button
//               type="button"
//               onClick={() => setShowClientDetails(!showClientDetails)}
//               style={{
//                 backgroundColor: 'transparent',
//                 border: 'none',
//                 color: '#007bff',
//                 cursor: 'pointer',
//                 fontSize: 12
//               }}
//             >
//               {showClientDetails ? 'Hide Details' : 'Show Details'}
//             </button>
//           </div>
          
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
//             <div>
//               <p style={{ margin: '5px 0', fontSize: 14 }}>
//                 <strong>Name:</strong> {selectedClient.name}
//               </p>
//               <p style={{ margin: '5px 0', fontSize: 14 }}>
//                 <strong>Company:</strong> {selectedClient.company || 'N/A'}
//               </p>
//               <p style={{ margin: '5px 0', fontSize: 14 }}>
//                 <strong>Email:</strong> {selectedClient.email}
//               </p>
//             </div>
//             <div>
//               <p style={{ margin: '5px 0', fontSize: 14 }}>
//                 <strong>Phone:</strong> {selectedClient.phone || 'N/A'}
//               </p>
//               <p style={{ margin: '5px 0', fontSize: 14 }}>
//                 <strong>Contact Person:</strong> {selectedClient.contactPerson || 'N/A'}
//               </p>
//               {selectedClient.budgetInfo?.totalBudget && (
//                 <p style={{ margin: '5px 0', fontSize: 14 }}>
//                   <strong>Client Budget:</strong> ${selectedClient.budgetInfo.totalBudget.toLocaleString()}
//                 </p>
//               )}
//             </div>
//           </div>
          
//           {showClientDetails && selectedClient.address && (
//             <p style={{ margin: '10px 0 5px 0', fontSize: 14 }}>
//               <strong>Address:</strong> {selectedClient.address}
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Example: Hook for fetching clients with real-time updates
// export const useClientsWithRealTime = () => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchClients = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/clients');
//         setClients(response.data.clients || []);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchClients();

//     // Set up real-time updates (if socket is available)
//     const socket = window.socket; // Assuming socket is available globally
//     if (socket) {
//       socket.on('client-created', () => {
//         fetchClients(); // Refresh clients when new client is created
//       });

//       socket.on('client-updated', () => {
//         fetchClients(); // Refresh clients when client is updated
//       });

//       return () => {
//         socket.off('client-created');
//         socket.off('client-updated');
//       };
//     }
//   }, []);

//   return { clients, loading, error, refetch: () => fetchClients() };
// };

// // Example: How to integrate client details in existing project creation form
// export const IntegrateClientInExistingForm = () => {
//   const [projectData, setProjectData] = useState({
//     name: '',
//     location: '',
//     budget: '',
//     client: '', // ADD THIS FIELD
//     // ... other existing fields
//   });

//   const { clients, loading: clientsLoading } = useClientsWithRealTime();
//   const [showNewClientModal, setShowNewClientModal] = useState(false);

//   const handleClientChange = (clientId) => {
//     setProjectData(prev => ({ ...prev, client: clientId }));
//   };

//   return (
//     <form>
//       {/* Your existing form fields */}
      
//       {/* ADD CLIENT SELECTION */}
//       <ClientSelector
//         selectedClientId={projectData.client}
//         onClientChange={handleClientChange}
//         onCreateNewClient={() => setShowNewClientModal(true)}
//         clients={clients}
//         loading={clientsLoading}
//       />

//       {/* Your existing form fields continue... */}
//     </form>
//   );
// };

// /*
// USAGE INSTRUCTIONS:

// 1. To add client details to existing project components:
//    - Import the ProjectCardWithClient component
//    - Replace your existing project cards with this enhanced version
//    - The client details will automatically display if project.client exists

// 2. To add client selection to existing forms:
//    - Import the ClientSelector component
//    - Add it to your form where you want client selection
//    - Add 'client' field to your project data state
//    - Handle the client selection in your form submission

// 3. To use real-time client updates:
//    - Import and use the useClientsWithRealTime hook
//    - It automatically handles fetching and real-time updates

// 4. Integration examples:
   
//    // In your existing ProjectList component:
//    import { ProjectCardWithClient } from './ProjectIntegration';
   
//    // Replace your project mapping with:
//    {projects.map(project => (
//      <ProjectCardWithClient 
//        key={project._id} 
//        project={project} 
//        onProjectClick={handleProjectClick}
//      />
//    ))}

//    // In your existing CreateProject component:
//    import { ClientSelector, useClientsWithRealTime } from './ProjectIntegration';
   
//    const { clients, loading } = useClientsWithRealTime();
   
//    // Add to your form:
//    <ClientSelector
//      selectedClientId={projectData.client}
//      onClientChange={(clientId) => setProjectData({...projectData, client: clientId})}
//      clients={clients}
//      loading={loading}
//    />

// This approach allows you to add client details to your existing project components 
// without completely rewriting them, maintaining backward compatibility while adding 
// the new client functionality.
// */