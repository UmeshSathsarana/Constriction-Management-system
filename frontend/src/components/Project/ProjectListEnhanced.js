// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import io from 'socket.io-client';

// const ProjectListEnhanced = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [showProjectModal, setShowProjectModal] = useState(false);

//   useEffect(() => {
//     // Initialize socket connection
//     const newSocket = io('http://localhost:5000', {
//       transports: ['websocket', 'polling'],
//       timeout: 20000,
//     });

//     newSocket.on('connect', () => {
//       console.log('Connected to server for project list');
//       setConnected(true);
//     });

//     newSocket.on('disconnect', () => {
//       console.log('Disconnected from server');
//       setConnected(false);
//     });

//     // Listen for project updates
//     newSocket.on('project-created', (data) => {
//       console.log('New project created:', data);
//       fetchProjects(); // Refresh projects list
//     });

//     newSocket.on('project-updated', (data) => {
//       console.log('Project updated:', data);
//       fetchProjects(); // Refresh projects list
//     });

//     setSocket(newSocket);
//     fetchProjects();

//     return () => {
//       newSocket.close();
//     };
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       console.log("Fetching projects...");
//       const response = await axios.get("http://localhost:5000/projects");
//       console.log("Response:", response.data);

//       if (response.data && response.data.projects) {
//         setProjects(response.data.projects);
//       } else {
//         setProjects([]);
//       }

//       setLoading(false);
//     } catch (err) {
//       console.error("Error:", err);
//       setError(err.response?.data?.message || err.message);
//       setLoading(false);
//     }
//   };

//   const handleProjectClick = (project) => {
//     setSelectedProject(project);
//     setShowProjectModal(true);
//   };

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

//   const filteredProjects = projects.filter(project => {
//     const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
//     const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          (project.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          (project.client?.company || '').toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   if (loading) return (
//     <div style={{ textAlign: 'center', padding: 50 }}>
//       <div>Loading projects...</div>
//     </div>
//   );

//   if (error) return (
//     <div style={{ textAlign: 'center', padding: 50, color: 'red' }}>
//       Error: {error}
//     </div>
//   );

//   return (
//     <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
//       {/* Connection Status */}
//       <div style={{
//         position: 'fixed',
//         top: 10,
//         right: 10,
//         zIndex: 1000,
//         padding: '5px 10px',
//         borderRadius: 5,
//         backgroundColor: connected ? '#4caf50' : '#f44336',
//         color: 'white',
//         fontSize: 12
//       }}>
//         {connected ? '🟢 Connected' : '🔴 Disconnected'}
//       </div>

//       {/* Header */}
//       <div style={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         marginBottom: 30 
//       }}>
//         <h1>Projects ({filteredProjects.length})</h1>
//         <Link 
//           to="/create-project-enhanced"
//           style={{
//             backgroundColor: '#4caf50',
//             color: 'white',
//             padding: '12px 24px',
//             borderRadius: 4,
//             textDecoration: 'none',
//             fontSize: 16,
//             fontWeight: 'bold'
//           }}
//         >
//           + Create New Project
//         </Link>
//       </div>

//       {/* Filters */}
//       <div style={{ 
//         display: 'flex', 
//         gap: 20, 
//         marginBottom: 30,
//         padding: 20,
//         backgroundColor: '#f8f9fa',
//         borderRadius: 8
//       }}>
//         <div style={{ flex: 1 }}>
//           <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
//             Search Projects
//           </label>
//           <input
//             type="text"
//             placeholder="Search by name, location, or client..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               width: '100%',
//               padding: 10,
//               borderRadius: 4,
//               border: '1px solid #ddd',
//               fontSize: 14
//             }}
//           />
//         </div>

//         <div style={{ minWidth: 200 }}>
//           <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
//             Filter by Status
//           </label>
//           <select
//             value={filterStatus}
//             onChange={(e) => setFilterStatus(e.target.value)}
//             style={{
//               width: '100%',
//               padding: 10,
//               borderRadius: 4,
//               border: '1px solid #ddd',
//               fontSize: 14
//             }}
//           >
//             <option value="all">All Status</option>
//             <option value="Planning">Planning</option>
//             <option value="Active">Active</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Completed">Completed</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         </div>
//       </div>

//       {/* Projects Grid */}
//       {filteredProjects.length === 0 ? (
//         <div style={{ 
//           textAlign: 'center', 
//           padding: 50,
//           backgroundColor: '#f8f9fa',
//           borderRadius: 8,
//           border: '2px dashed #ddd'
//         }}>
//           <h3>No projects found</h3>
//           <p>
//             {searchTerm || filterStatus !== 'all' 
//               ? 'Try adjusting your search or filter criteria.' 
//               : 'Create your first project to get started!'
//             }
//           </p>
//           <Link 
//             to="/create-project-enhanced"
//             style={{
//               backgroundColor: '#4caf50',
//               color: 'white',
//               padding: '10px 20px',
//               borderRadius: 4,
//               textDecoration: 'none',
//               display: 'inline-block',
//               marginTop: 10
//             }}
//           >
//             Create New Project
//           </Link>
//         </div>
//       ) : (
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
//           gap: 20
//         }}>
//           {filteredProjects.map((project) => (
//             <div
//               key={project._id}
//               style={{
//                 border: '1px solid #ddd',
//                 borderRadius: 8,
//                 padding: 20,
//                 backgroundColor: '#fff',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                 cursor: 'pointer',
//                 transition: 'transform 0.2s, box-shadow 0.2s'
//               }}
//               onClick={() => handleProjectClick(project)}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.transform = 'translateY(-2px)';
//                 e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = 'translateY(0)';
//                 e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
//               }}
//             >
//               {/* Project Header */}
//               <div style={{ 
//                 display: 'flex', 
//                 justifyContent: 'space-between', 
//                 alignItems: 'flex-start',
//                 marginBottom: 15 
//               }}>
//                 <div>
//                   <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>
//                     {project.name}
//                   </h3>
//                   <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
//                     ID: {project.pid}
//                   </p>
//                 </div>
//                 <span
//                   style={{
//                     padding: '4px 12px',
//                     borderRadius: 20,
//                     fontSize: 12,
//                     fontWeight: 'bold',
//                     color: 'white',
//                     backgroundColor: getStatusColor(project.status)
//                   }}
//                 >
//                   {project.status}
//                 </span>
//               </div>

//               {/* Project Details */}
//               <div style={{ marginBottom: 15 }}>
//                 <p style={{ margin: '5px 0', fontSize: 14 }}>
//                   <strong>📍 Location:</strong> {project.location}
//                 </p>
//                 <p style={{ margin: '5px 0', fontSize: 14 }}>
//                   <strong>💰 Budget:</strong> ${project.budget?.toLocaleString() || 'N/A'}
//                 </p>
//                 <p style={{ margin: '5px 0', fontSize: 14 }}>
//                   <strong>📊 Progress:</strong> {project.progress || 0}%
//                 </p>
//               </div>

//               {/* Progress Bar */}
//               <div style={{ marginBottom: 15 }}>
//                 <div style={{
//                   width: '100%',
//                   height: 8,
//                   backgroundColor: '#e0e0e0',
//                   borderRadius: 4,
//                   overflow: 'hidden'
//                 }}>
//                   <div style={{
//                     width: `${project.progress || 0}%`,
//                     height: '100%',
//                     backgroundColor: getStatusColor(project.status),
//                     transition: 'width 0.3s ease'
//                   }} />
//                 </div>
//               </div>

//               {/* Client Information */}
//               {project.client && (
//                 <div style={{ 
//                   backgroundColor: '#f8f9fa', 
//                   padding: 10, 
//                   borderRadius: 4,
//                   marginBottom: 15
//                 }}>
//                   <p style={{ margin: '2px 0', fontSize: 13, fontWeight: 'bold' }}>
//                     👤 Client: {project.client.name}
//                   </p>
//                   {project.client.company && (
//                     <p style={{ margin: '2px 0', fontSize: 13 }}>
//                       🏢 Company: {project.client.company}
//                     </p>
//                   )}
//                   <p style={{ margin: '2px 0', fontSize: 13 }}>
//                     📧 Email: {project.client.email}
//                   </p>
//                 </div>
//               )}

//               {/* Team Information */}
//               <div style={{ fontSize: 13, color: '#666' }}>
//                 {project.projectManager && (
//                   <p style={{ margin: '2px 0' }}>
//                     👨‍💼 PM: {project.projectManager.name}
//                   </p>
//                 )}
//                 {project.siteSupervisor && (
//                   <p style={{ margin: '2px 0' }}>
//                     👷 Supervisor: {project.siteSupervisor.name}
//                   </p>
//                 )}
//                 {project.financeManager && (
//                   <p style={{ margin: '2px 0' }}>
//                     💼 Finance: {project.financeManager.name}
//                   </p>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div style={{ 
//                 display: 'flex', 
//                 gap: 10, 
//                 marginTop: 15,
//                 paddingTop: 15,
//                 borderTop: '1px solid #eee'
//               }}>
//                 <Link
//                   to={`/project/${project._id}`}
//                   style={{
//                     flex: 1,
//                     textAlign: 'center',
//                     padding: '8px 12px',
//                     backgroundColor: '#2196f3',
//                     color: 'white',
//                     textDecoration: 'none',
//                     borderRadius: 4,
//                     fontSize: 13
//                   }}
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   View Details
//                 </Link>
//                 <Link
//                   to={`/edit-project/${project._id}`}
//                   style={{
//                     flex: 1,
//                     textAlign: 'center',
//                     padding: '8px 12px',
//                     backgroundColor: '#ff9800',
//                     color: 'white',
//                     textDecoration: 'none',
//                     borderRadius: 4,
//                     fontSize: 13
//                   }}
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   Edit
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Project Details Modal */}
//       {showProjectModal && selectedProject && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             padding: 30,
//             borderRadius: 8,
//             maxWidth: 700,
//             width: '90%',
//             maxHeight: '80%',
//             overflow: 'auto'
//           }}>
//             <div style={{ 
//               display: 'flex', 
//               justifyContent: 'space-between', 
//               alignItems: 'center', 
//               marginBottom: 20 
//             }}>
//               <h2 style={{ margin: 0 }}>{selectedProject.name}</h2>
//               <button
//                 onClick={() => setShowProjectModal(false)}
//                 style={{
//                   backgroundColor: 'transparent',
//                   border: 'none',
//                   fontSize: 24,
//                   cursor: 'pointer',
//                   color: '#666'
//                 }}
//               >
//                 ×
//               </button>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
//               {/* Project Information */}
//               <div>
//                 <h3>Project Information</h3>
//                 <p><strong>ID:</strong> {selectedProject.pid}</p>
//                 <p><strong>Location:</strong> {selectedProject.location}</p>
//                 <p><strong>Status:</strong> 
//                   <span style={{
//                     padding: '2px 8px',
//                     borderRadius: 4,
//                     backgroundColor: getStatusColor(selectedProject.status),
//                     color: 'white',
//                     fontSize: 12,
//                     marginLeft: 5
//                   }}>
//                     {selectedProject.status}
//                   </span>
//                 </p>
//                 <p><strong>Budget:</strong> ${selectedProject.budget?.toLocaleString()}</p>
//                 <p><strong>Progress:</strong> {selectedProject.progress || 0}%</p>
//                 <p><strong>Start Date:</strong> {new Date(selectedProject.startDate).toLocaleDateString()}</p>
//                 <p><strong>End Date:</strong> {new Date(selectedProject.endDate).toLocaleDateString()}</p>
//                 {selectedProject.description && (
//                   <div>
//                     <strong>Description:</strong>
//                     <p style={{ backgroundColor: '#f8f9fa', padding: 10, borderRadius: 4, marginTop: 5 }}>
//                       {selectedProject.description}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Client & Team Information */}
//               <div>
//                 {/* Client Information */}
//                 {selectedProject.client && (
//                   <div style={{ marginBottom: 20 }}>
//                     <h3>Client Information</h3>
//                     <div style={{ backgroundColor: '#f8f9fa', padding: 15, borderRadius: 4 }}>
//                       <p><strong>Name:</strong> {selectedProject.client.name}</p>
//                       {selectedProject.client.company && (
//                         <p><strong>Company:</strong> {selectedProject.client.company}</p>
//                       )}
//                       <p><strong>Email:</strong> {selectedProject.client.email}</p>
//                       {selectedProject.client.phone && (
//                         <p><strong>Phone:</strong> {selectedProject.client.phone}</p>
//                       )}
//                       {selectedProject.client.address && (
//                         <p><strong>Address:</strong> {selectedProject.client.address}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Team Information */}
//                 <div>
//                   <h3>Team</h3>
//                   <div style={{ backgroundColor: '#f8f9fa', padding: 15, borderRadius: 4 }}>
//                     {selectedProject.projectManager && (
//                       <p><strong>Project Manager:</strong> {selectedProject.projectManager.name}</p>
//                     )}
//                     {selectedProject.siteSupervisor && (
//                       <p><strong>Site Supervisor:</strong> {selectedProject.siteSupervisor.name}</p>
//                     )}
//                     {selectedProject.financeManager && (
//                       <p><strong>Finance Manager:</strong> {selectedProject.financeManager.name}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div style={{ 
//               display: 'flex', 
//               justifyContent: 'flex-end', 
//               gap: 10, 
//               marginTop: 30,
//               paddingTop: 20,
//               borderTop: '1px solid #eee'
//             }}>
//               <Link
//                 to={`/project/${selectedProject._id}`}
//                 style={{
//                   backgroundColor: '#2196f3',
//                   color: 'white',
//                   padding: '10px 20px',
//                   borderRadius: 4,
//                   textDecoration: 'none'
//                 }}
//               >
//                 View Full Details
//               </Link>
//               <Link
//                 to={`/edit-project/${selectedProject._id}`}
//                 style={{
//                   backgroundColor: '#ff9800',
//                   color: 'white',
//                   padding: '10px 20px',
//                   borderRadius: 4,
//                   textDecoration: 'none'
//                 }}
//               >
//                 Edit Project
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProjectListEnhanced;