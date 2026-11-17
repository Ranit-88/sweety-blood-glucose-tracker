import React, { useState, useEffect } from 'react';
import ReportCard from '../components/ReportCard';
import { getDailyReport, getMonthToDateReport, getMonthlyReport } from '../services/api';

function Reports() {
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [daily, setDaily] = useState(null);
  const [monthToDate, setMonthToDate] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReports = async (date) => {
    setLoading(true);
    setError('');
    try {
      const [dailyRes, mtdRes, monthlyRes] = await Promise.all([
        getDailyReport(date),
        getMonthToDateReport(date),
        getMonthlyReport(date)
      ]);
      setDaily(dailyRes.data);
      setMonthToDate(mtdRes.data);
      setMonthly(monthlyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  return (
    <div className="reports-page">
      <h1>Reports</h1>
      <div className="date-selector">
        <label>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          max={getToday()}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <p>Loading reports...</p>}

      {!loading && (
        <div className="reports-grid">
          {daily && (
            <ReportCard
              title="Daily Report"
              period={daily.period}
              stats={daily.stats}
              readings={daily.readings}
              message={daily.message}
            />
          )}
          {monthToDate && (
            <ReportCard
              title="Month-to-Date Report"
              period={monthToDate.period}
              stats={monthToDate.stats}
              readings={monthToDate.readings}
              message={monthToDate.message}
            />
          )}
          {monthly && (
            <ReportCard
              title="Previous Month Report"
              period={monthly.period}
              stats={monthly.stats}
              readings={monthly.readings}
              message={monthly.message}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Reports;
