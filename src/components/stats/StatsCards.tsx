import { Card } from '@/components/ui/Card';
import { formatPercentage } from '@/lib/utils';
import type { UserStatsResponse } from '@/types/session.types';

interface StatsCardsProps {
  stats: UserStatsResponse;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    { label: 'Total Reviews', value: stats.totalReviews.toLocaleString(), icon: '📝', color: 'text-indigo-600' },
    { label: 'Accuracy Rate', value: formatPercentage(stats.globalAccuracyRate), icon: '🎯', color: 'text-emerald-600' },
    { label: 'Total Sessions', value: stats.totalSessions.toLocaleString(), icon: '📅', color: 'text-amber-600' },
    { label: 'Cards Reviewed', value: stats.totalCardsReviewed.toLocaleString(), icon: '🃏', color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="text-center">
          <span className="text-3xl block mb-2" role="img" aria-hidden="true">{item.icon}</span>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-sm text-slate-500 mt-1">{item.label}</p>
        </Card>
      ))}
    </div>
  );
}
