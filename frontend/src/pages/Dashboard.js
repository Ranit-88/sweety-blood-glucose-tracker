import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReadingForm from '../components/ReadingForm';
import ReadingList from '../components/ReadingList';
import { getReadings, addReading, updateReading, deleteReading } from '../services/api';

function Dashboard({ user }) {
  const [readings, setReadings] = useState([]);
  const [editingReading, setEditingReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await getReadings();
      setReadings(res.data.readings || []);
    } catch (err) {
      setError('Failed to load readings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleAddOrUpdate = async ({ date, slot, value }) => {
    setMessage('');
    setError('');
    try {
      if (editingReading) {
        await updateReading(editingReading.id, date, slot, value);
        setMessage('Reading updated successfully!');
        setEditingReading(null);
      } else {
        await addReading(date, slot, value);
        setMessage('Reading added successfully!');
      }
      await fetchReadings();
    } catch (err) {
      throw err; 
    }
  };

  const handleEdit = (reading) => {
    setEditingReading(reading);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reading?')) {
      return;
    }
    setMessage('');
    setError('');
    try {
      await deleteReading(id);
      setMessage('Reading deleted successfully!');
      if (editingReading && editingReading.id === id) {
        setEditingReading(null);
      }
      await fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete reading.');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <p className="today-date">Today is {today}</p>
        <Link to="/reports" className="btn-link">View Reports →</Link>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <ReadingForm
        onSubmit={handleAddOrUpdate}
        editingReading={editingReading}
        onCancel={handleCancelEdit}
      />

      {loading ? (
        <p>Loading readings...</p>
      ) : (
        <ReadingList
          readings={readings}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Dashboard;
