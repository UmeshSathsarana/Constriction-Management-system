// UserList.js
import React, { useState, useEffect } from "react";

export default function UserList({ onEdit, onView }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/users");
      const data = await res.json();
      const usersArray = Array.isArray(data) ? data : data.users || [];
      setUsers(usersArray);
    } catch {
      setUsers([]);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e1e5e9'
      }}>
        <h3 style={{
          color: '#003366',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '20px',
          margin: '0 0 20px 0'
        }}>All Users</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: '#f8f9ff',
            border: '1px solid #cce0ff',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h4 style={{
              color: '#003366',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Total Users</h4>
            <p style={{
              color: '#0066cc',
              fontSize: '32px',
              fontWeight: '700',
              margin: '0'
            }}>{users.length}</p>
          </div>
        </div>

        <div style={{
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid #e1e5e9'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #e1e5e9'
              }}>
                <th style={{
                  padding: '15px 20px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#003366',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Name</th>
                <th style={{
                  padding: '15px 20px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#003366',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Email</th>
                <th style={{
                  padding: '15px 20px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#003366',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Role</th>
                <th style={{
                  padding: '15px 20px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: '#003366',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{
                    textAlign: "center",
                    padding: '40px 20px',
                    color: '#666666',
                    fontSize: '16px'
                  }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u, index) => (
                  <tr key={u._id || u.id} style={{
                    borderBottom: '1px solid #e1e5e9',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.closest('tr').style.backgroundColor = '#f0f4ff'}
                  onMouseOut={(e) => e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                  >
                    <td style={{
                      padding: '15px 20px',
                      color: '#003366',
                      fontWeight: '500'
                    }}>
                      <span
                        style={{
                          color: '#0066cc',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontWeight: '600',
                          transition: 'color 0.3s ease'
                        }}
                        onClick={() => onView(u)}
                        onMouseOver={(e) => e.target.style.color = '#004499'}
                        onMouseOut={(e) => e.target.style.color = '#0066cc'}
                      >
                        {u.name}
                      </span>
                    </td>
                    <td style={{
                      padding: '15px 20px',
                      color: '#666666'
                    }}>{u.email}</td>
                    <td style={{
                      padding: '15px 20px',
                      color: '#666666'
                    }}>{u.role}</td>
                    <td style={{
                      padding: '15px 20px'
                    }}>
                      <button
                        onClick={() => onEdit(u)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#003366',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e0a800'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ffc107'}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
