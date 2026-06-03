import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDecks, getDueDecks } from '@/api/decks.api';
import { DeckCard } from '@/components/shared/DeckCard';
import { PaginationLoader } from '@/components/shared/PaginationLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { DeckResponse } from '@/types/deck.types';
import type { PaginationParams } from '@/types/api.types';

export function DeckListPage() {
  const navigate = useNavigate();

  // Due decks
  const dueQuery = useQuery({
    queryKey: ['decks', 'due'],
    queryFn: () => getDueDecks({ pageSize: 50, direction: 'ASC' }),
  });

  // All decks with cursor pagination
  const [allDecks, setAllDecks] = useState<DeckResponse[]>([]);
  const [cursor, setCursor] = useState<PaginationParams>({ pageSize: DEFAULT_PAGE_SIZE, direction: 'DESC' });
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const allQuery = useQuery({
    queryKey: ['decks', 'all', cursor],
    queryFn: async () => {
      const data = await getDecks(cursor);
      if (isInitialLoad) {
        setAllDecks(data.content);
        setIsInitialLoad(false);
      } else {
        setAllDecks((prev) => [...prev, ...data.content]);
      }
      setHasNext(data.hasNext);
      return data;
    },
  });

  const handleLoadMore = () => {
    if (allDecks.length === 0) return;
    const last = allDecks[allDecks.length - 1];
    setCursor((prev) => ({
      ...prev,
      lastId: last.id,
      cursorValue: last.createdAt,
    }));
  };

  const dueDecks = dueQuery.data?.content || [];
  const isLoading = allQuery.isLoading && isInitialLoad;
  const isError = allQuery.isError && isInitialLoad;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Decks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and study your flashcard decks</p>
        </div>
        <Button onClick={() => navigate('/decks/new')}>
          + New Deck
        </Button>
      </div>

      {/* Due Decks Section */}
      {dueDecks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" role="img" aria-hidden="true">🔥</span>
            <h2 className="text-lg font-semibold text-slate-900">Ready to study</h2>
            <span className="text-sm text-slate-400">({dueDecks.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueDecks.map((deck) => (
              <DeckCard key={`due-${deck.id}`} deck={deck} />
            ))}
          </div>
        </section>
      )}

      {/* All Decks Section */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Decks</h2>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {isError && <ErrorState onRetry={() => allQuery.refetch()} />}

        {!isLoading && !isError && allDecks.length === 0 && (
          <EmptyState
            icon="📚"
            title="No decks yet"
            description="Create your first deck to start studying with flashcards."
            actionLabel="Create first deck"
            onAction={() => navigate('/decks/new')}
          />
        )}

        {!isLoading && allDecks.length > 0 && (
          <>
            {allQuery.isRefetching && !allQuery.isLoading && (
              <div className="flex justify-center mb-4">
                <div className="h-1 w-24 bg-indigo-200 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-indigo-500 animate-pulse" />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDecks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
            <PaginationLoader
              hasNext={hasNext}
              isLoading={allQuery.isFetching && !isInitialLoad}
              onLoadMore={handleLoadMore}
            />
          </>
        )}
      </section>
    </div>
  );
}
