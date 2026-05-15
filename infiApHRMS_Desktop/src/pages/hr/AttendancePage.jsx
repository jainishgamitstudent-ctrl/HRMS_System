import { useState, useEffect } from "react";
import { hrService } from "../../services/hr.service";

export default function AttendancePage() {
  const [overview, setOverview] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      // Fetch both in parallel
      const [overviewData, recordsData] = await Promise.all([
        hrService.getAttendanceDailyOverview(),
        hrService.getCheckInRecords({ page: 1, limit: 30 }),
      ]);
      setOverview(overviewData.data);
      setRecords(recordsData.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCorrection = async (correctionId) => {
    try {
      await hrService.reviewCorrectionRequest(correctionId, "Approved", "Looks good");
      // Refresh list after approval
      loadAttendanceData();
    } catch (err) {
      alert("Failed to approve: " + err.response?.data?.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Today's Attendance</h2>
      <p>Present: {overview?.presentToday}</p>
      <p>Absent: {overview?.absent}</p>
      <p>Late: {overview?.lateArrivals}</p>
      <p>WFH: {overview?.wfh}</p>

      <table>
        <thead>
          <tr>
            <th>Employee</th><th>In Time</th><th>Out Time</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.employeeId}>
              <td>{r.name}</td>
              <td>{r.inTime ? new Date(r.inTime).toLocaleTimeString() : "—"}</td>
              <td>{r.outTime ? new Date(r.outTime).toLocaleTimeString() : "—"}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
