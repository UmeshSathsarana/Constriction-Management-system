import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const CreateProgress = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [progressData, setProgressData] = useState({
    project: projectId,
    workCompleted: '',
    percentageComplete: 0,
    date: new Date().toISOString().split('T')[0],
    reportedBy: localStorage.getItem('userId') || ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/progress', progressData);
      navigate('/progress');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating progress report');
    }
  };

  return (
    <div className="create-progress">
      <h2>Create Progress Report</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={progressData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Work Completed *</label>
          <textarea
            name="workCompleted"
            value={progressData.workCompleted}
            onChange={handleChange}
            rows="4"
            required
            placeholder="Describe the work completed..."
          />
        </div>

        <div className="form-group">
          <label>Progress Percentage *</label>
          <input
            type="number"
            name="percentageComplete"
            value={progressData.percentageComplete}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Submit Report</button>
          <button type="button" onClick={() => navigate('/progress')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProgress;
