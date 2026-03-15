import { useNavigate } from 'react-router-dom';

export default function StatCard({ label, value, icon: Icon, color = 'indigo', to }) {
  const navigate = useNavigate();
  const colorMap = {
    indigo: 'text-indigo-600 bg-indigo-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    slate: 'text-slate-600 bg-slate-50',
  };

  const Wrapper = to ? 'button' : 'div';
  const clickProps = to ? { onClick: () => navigate(to) } : {};

  return (
    <Wrapper {...clickProps} className={`bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between ${to ? 'hover:bg-slate-50 hover:border-indigo-200 transition-colors cursor-pointer' : ''}`}>
      <div>
        <p className="text-sm text-slate-500 text-left">{label}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      )}
    </Wrapper>
  );
}
