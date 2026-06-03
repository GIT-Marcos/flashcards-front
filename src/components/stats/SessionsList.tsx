import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/api/sessions.api';
import { Card } from '@/components/ui/Card';
import { PaginationLoader } from '@/components/shared/PaginationLoader';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatDateTime, formatDuration, formatPercentage } from '@/lib/utils';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { SessionResponse } from '@/types/session.types';
import type { PaginationParams } from '@/types/api.types';

export function SessionsList() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [cursor, setCursor] = useState<PaginationParams>({ pageSize: DEFAULT_PAGE_SIZE, direction: 'DESC' });
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['sessions', cursor],
    queryFn: async () => {
      const data = await getSessions(cursor);
      if (isInitialLoad) {
        setSessions(data.content);
        setIsInitialLoad(false);
      } else {
        setSessions((prev) => [...prev, ...data.content]);
      }
      setHasNext(data.hasNext);
      return data;
    },
  });

  const handleLoadMore = () => {
    if (sessions.length === 0) return;
    const last = sessions[sessions.length - 1];
    setCursor((prev) => ({
      ...prev,
      lastId: last.id,
      cursorValue: last.startTime,
    }));
  };

  if (isLoading && isInitialLoad) return <SkeletonList count={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title="No study sessions yet"
        description="Start studying to see your session history!"
      />
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Sessions</h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-medium text-slate-900">{formatDateTime(session.startTime)}</p>
                <p className="text-sm text-slate-500">
                  Duration: {formatDuration(session.durationSeconds)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-600">
                  <span className="font-semibold">{session.cardsReviewed}</span> cards
                </span>
                <span className="text-emerald-600 font-semibold">
                  {formatPercentage(session.accuracyRate)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <PaginationLoader hasNext={hasNext} isLoading={isFetching && !isInitialLoad} onLoadMore={handleLoadMore} />
    </div>
  );
}
