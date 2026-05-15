import { useState, useEffect } from "react";
import { hrService } from "../../services/hr.service";

export default function LeavesPage() {
  const [stats, setStats] = useState({});
  const [pendingLeaves, setPendingLeaves] = useState([]);

  useEffect(() => {
    Promise.all([
      hrService.getLeaveStats(),
      hrService.getPendingLeaves(),
    ]).then(([statsRes, leavesRes]) => {
      setStats(statsRes.data);
      setPendingLeaves(leavesRes.data);
    });
  }, []);

  const handleAction = async (leaveId, action) => {
    // action: "Approved" or "Rejected"
    try {
      await hrService.approveLeave(leaveId, action);
      // Remove from pending list
      setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <div>
      <div className="stats-row">
        <div>Pending: {stats.pending}</div>
        <div>Approved: {stats.approved}</div>
        <div>On Leave Today: {stats.onLeaveToday}</div>
      </div>

      {pendingLeaves.map((leave) => (
        <div key={leave.id} className="leave-card">
          <p>{leave.employeeName} — {leave.leaveType}</p>
          <p>{new Date(leave.startDate).toDateString()} to {new Date(leave.endDate).toDateString()}</p>
          <p>Reason: {leave.reason}</p>
          <button onClick={() => handleAction(leave.id, "Approved")}>✅ Approve</button>
          <button onClick={() => handleAction(leave.id, "Rejected")}>❌ Reject</button>
        </div>
      ))}
    </div>
  );
}
