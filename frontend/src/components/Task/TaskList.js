import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../Dashboard/project.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/tasks');
      setTasks(response.data.tasks || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error fetching tasks');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="task-list-loading">
      <div className="loading-spinner">Loading tasks...</div>
    </div>
  );

  if (error) return (
    <div className="task-list-error">
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>All Tasks</h2>
        <Link to="/create-task" className="task-list-create-btn">Create New Task</Link>
      </div>

      {tasks.length === 0 ? (
        <div className="task-list-empty">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="task-list-table-container">
          <table className="task-list-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td className="task-title-cell">{task.title}</td>
                  <td>{task.project?.name || 'N/A'}</td>
                  <td>{task.assignedTo?.name || 'Unassigned'}</td>
                  <td>
                    <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${task.priority.toLowerCase().replace(' ', '-')}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="task-actions">
                      <Link to={`/task/${task._id}`} className="task-action-link view-link">View</Link>
                      <Link to={`/edit-task/${task._id}`} className="task-action-link edit-link">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
