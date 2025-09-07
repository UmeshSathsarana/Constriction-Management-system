import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const TaskDetails = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(`/tasks/${id}`);
        setTask(response.data.task);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching task:", err);
        setError(err.response?.data?.message || "Error fetching task details");
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div>
      <h2>{task.title}</h2>
      <p>
        <strong>Description:</strong> {task.description || "No description"}
      </p>
      <p>
        <strong>Project:</strong> {task.project.name}
      </p>
      <p>
        <strong>Assigned To:</strong> {task.assignedTo?.name || "Unassigned"}
      </p>
      <p>
        <strong>Status:</strong> {task.status}
      </p>
      <p>
        <strong>Priority:</strong> {task.priority}
      </p>
      <p>
        <strong>Start Date:</strong>{" "}
        {new Date(task.startDate).toLocaleDateString()}
      </p>
      <p>
        <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
      </p>

      <div style={{ marginTop: "20px" }}>
        <Link to={`/edit-task/${task._id}`}>
          <button>Edit Task</button>
        </Link>
        <Link to="/tasks" style={{ marginLeft: "10px" }}>
          <button>Back to List</button>
        </Link>
      </div>
    </div>
  );
};

export default TaskDetails;
