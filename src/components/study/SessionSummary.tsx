import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface SessionSummaryProps {
  cardsReviewed: number;
  correctCount: number;
  deckId: number;
}

export function SessionSummary({ cardsReviewed, correctCount, deckId }: SessionSummaryProps) {
  const navigate = useNavigate();
  const accuracy = cardsReviewed > 0 ? ((correctCount / cardsReviewed) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-md mx-auto text-center">
      <span className="text-6xl mb-4 block" role="img" aria-hidden="true">
        🎉
      </span>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Deck complete!</h2>
      <p className="text-slate-500 mb-8">Great job! Here's your summary of the deck:</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <p className="text-3xl font-bold text-indigo-600">{cardsReviewed}</p>
          <p className="text-sm text-slate-500 mt-1">Cards reviewed</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-emerald-600">{accuracy}%</p>
          <p className="text-sm text-slate-500 mt-1">Accuracy</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-emerald-600">{correctCount}</p>
          <p className="text-sm text-slate-500 mt-1">Correct</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-red-500">{cardsReviewed - correctCount}</p>
          <p className="text-sm text-slate-500 mt-1">To review again</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={() => navigate(`/decks/${deckId}`)}>Back to deck</Button>
        <Button variant="secondary" onClick={() => navigate('/decks')}>
          All decks
        </Button>
        <Button variant="secondary" onClick={() => navigate('/reviews')}>
          Go to Reviews
        </Button>
      </div>
    </div>
  );
}
