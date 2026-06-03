import { Button } from '@/components/ui/Button';

interface PaginationLoaderProps {
  hasNext: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function PaginationLoader({ hasNext, isLoading, onLoadMore }: PaginationLoaderProps) {
  if (!hasNext) return null;

  return (
    <div className="flex justify-center py-6">
      <Button variant="secondary" onClick={onLoadMore} isLoading={isLoading}>
        Load more
      </Button>
    </div>
  );
}
