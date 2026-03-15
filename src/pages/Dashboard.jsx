import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Building2, FileKey, Users, ClipboardCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { complianceTasks as mockTasks, licenses as mockLicenses, incidents as mockIncidents, training as mockTraining, trainingRecords as mockTrainingRecords, facilities as mockFacilities, staff as mockStaff } from '../data/mockData';
import { useAccreditation } from '../hooks/useAccreditation';
import { useSharePointData } from '../hooks/useSharePointData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { filterByBody, body, bodyLabels } = useAccreditation();

  // All data through hooks — never read mock imports directly for display
  const { data: complianceTasks } = useSharePointData('ComplianceTasks', mockTasks);
  const { data: licenses } = useSharePointData('Licenses', mockLicenses);
  const { data: incidents } = useSharePointData('Incidents', mockIncidents);
  const { data: training } = useSharePointData('Training', mockTraining);
  const { data: trainingRecordsList } = useSharePointData('TrainingRecords', mockTrainingRecords);
  const { data: facilitiesList } = useSharePointData('Facilities', mockFacilities);
  const { data: staffList } = useSharePointData('Personnel', mockStaff);

  // Filter data by selected accreditation body
  const filteredTasks = filterByBody(complianceTasks);
  const filteredIncidents = filterByBody(incidents);
  const filteredTraining = filterByBody(training);
  const filteredTrainingNames = new Set(filteredTraining.map(t => t.course || t.title));
  const filteredRecords = trainingRecordsList.filter(r => filteredTrainingNames.has(r.course));

  // Compute filtered stats
  const expiredLicenses = licenses.filter(l => l.status === "Expired").length;
  const expiringSoon = licenses.filter(l => l.daysLeft > 0 && l.daysLeft <= 90).length;
  const openIncidents = filteredIncidents.filter(i => i.investigationStatus !== "Resolved" && i.investigationStatus !== "Closed").length;
  const overdueTrainings = filteredRecords.filter(t => t.status === "Overdue").length;
  const overdueTasks = filteredTasks.filter(t => t.status === "Overdue").length;
  const completedTasks = filteredTasks.filter(t => t.status === "Complete").length;
  const totalTasks = filteredTasks.length;

  const healthScore = totalTasks > 0
    ? Math.round(((completedTasks / totalTasks) * 40) + ((1 - (overdueTasks / totalTasks)) * 30) + ((1 - (expiredLicenses / licenses.length)) * 30))
    : 100;

  const healthData = [
    { value: healthScore },
    { value: 100 - healthScore },
  ];
  const COLORS = [healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444', '#e2e8f0'];

  const expiringLicenses = licenses.filter(l => l.status === "Expired" || l.status === "Critical" || (l.daysLeft > 0 && l.daysLeft <= 90))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const recentIncidents = [...filteredIncidents].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const attentionTasks = filteredTasks.filter(t => t.status !== "Complete")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const activeLabel = body !== 'all' ? ` — ${bodyLabels[body]}` : '';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Compliance Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time compliance health across all facilities{activeLabel}</p>
      </div>

      {/* Health Score + Alert Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Health Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Compliance Health Score</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={healthData} cx="50%" cy="50%" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
                    {healthData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} strokeWidth={0} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: COLORS[0] }}>{healthScore}%</span>
                <span className="text-xs text-slate-500">Overall Readiness</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            {healthScore >= 80 ? 'On track — maintain current efforts' :
             healthScore >= 60 ? 'Critical items require immediate action' :
             'Urgent attention needed across multiple areas'}
          </p>
        </div>

        {/* Alert Summary — every card navigates to the relevant page */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Alert Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/licenses')} className="bg-red-50 rounded-lg p-4 border border-red-100 text-left hover:bg-red-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-2xl font-bold text-red-600">{expiredLicenses}</span>
              </div>
              <p className="text-xs text-red-600 mt-1">Expired Licenses →</p>
            </button>
            <button onClick={() => navigate('/licenses')} className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-left hover:bg-amber-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">{expiringSoon}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Expiring Soon (90d) →</p>
            </button>
            <button onClick={() => navigate('/incidents')} className="bg-red-50 rounded-lg p-4 border border-red-100 text-left hover:bg-red-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-2xl font-bold text-red-600">{openIncidents}</span>
              </div>
              <p className="text-xs text-red-600 mt-1">Open Incidents →</p>
            </button>
            <button onClick={() => navigate('/training')} className="bg-amber-50 rounded-lg p-4 border border-amber-100 text-left hover:bg-amber-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">{overdueTrainings}</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">Overdue Trainings →</p>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Row — all clickable, all from hooks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Facilities" value={facilitiesList.length} icon={Building2} color="indigo" to="/facilities" />
        <StatCard label="Active Licenses" value={licenses.filter(l => l.status === "Active").length} icon={FileKey} color="green" to="/licenses" />
        <StatCard label="Active Staff" value={staffList.filter(s => s.status === "Active").length} icon={Users} color="blue" to="/personnel" />
        <StatCard label="Tasks Due" value={totalTasks - completedTasks} icon={ClipboardCheck} color="amber" to="/standards" />
        <StatCard label="Critical Incidents" value={filteredIncidents.filter(i => i.severity === "Critical").length} icon={AlertCircle} color="red" to="/incidents" />
        <StatCard label="Overdue Tasks" value={overdueTasks} icon={AlertTriangle} color="red" to="/standards" />
      </div>

      {/* Bottom Section — every item navigates to its detail page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Expirations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">License Expirations</h3>
            <button onClick={() => navigate('/licenses')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {expiringLicenses.length > 0 ? expiringLicenses.map(license => (
              <button key={license.id} onClick={() => navigate('/licenses')} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 w-full text-left hover:bg-slate-50 transition-colors rounded px-1 -mx-1 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">{license.name}</p>
                  <p className="text-xs text-slate-500">{license.facility}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={license.status} />
                  <p className="text-xs text-slate-500 mt-1">
                    {license.daysLeft < 0 ? `Expired ${Math.abs(license.daysLeft)} days ago` : `${license.daysLeft} days left`}
                  </p>
                </div>
              </button>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">No license issues</p>
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Incidents</h3>
            <button onClick={() => navigate('/incidents')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {recentIncidents.length > 0 ? recentIncidents.map(incident => (
              <button key={incident.id} onClick={() => navigate('/incidents')} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 w-full text-left hover:bg-slate-50 transition-colors rounded px-1 -mx-1 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">{incident.type}</p>
                  <p className="text-xs text-slate-500">{incident.facility} · {incident.date}</p>
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={incident.severity} />
                  <br />
                  <StatusBadge status={incident.investigationStatus} />
                </div>
              </button>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">No incidents for selected body</p>
            )}
          </div>
        </div>

        {/* Overdue / In-Progress Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Tasks Needing Attention</h3>
            <button onClick={() => navigate('/standards')} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View All →</button>
          </div>
          <div className="space-y-3">
            {attentionTasks.length > 0 ? attentionTasks.slice(0, 5).map(task => (
              <button key={task.id} onClick={() => navigate('/standards')} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 w-full text-left hover:bg-slate-50 transition-colors rounded px-1 -mx-1 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{task.task || task.title || '—'}</p>
                  <p className="text-xs text-slate-500">{task.assignedTo || task.assignedToRole || '—'} · Due {task.dueDate}</p>
                </div>
                <div className="ml-3">
                  <StatusBadge status={task.status} />
                </div>
              </button>
            )) : (
              <p className="text-sm text-slate-400 text-center py-4">No tasks for selected body</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
