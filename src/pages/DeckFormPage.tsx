import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDeck, updateDeck, getDecks } from '@/api/decks.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { deckSchema, type DeckFormData } from '@/lib/validators';
import { sanitizeHtml } from '@/lib/sanitize';
import { toast } from 'sonner';
import type { DeckResponse } from '@/types/deck.types';

export function DeckFormPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!deckId;

  const [form, setForm] = useState<DeckFormData>({ name: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof DeckFormData, string>>>({});

  // For edit mode, find the deck from cache or refetch
  const { data: existingDeck } = useQuery({
    queryKey: ['decks', 'edit', deckId],
    queryFn: async () => {
      // Try to find from cache first
      const cached = queryClient.getQueryData<{ content: DeckResponse[] }>(['decks', 'all', { pageSize: 15, direction: 'DESC' }]);
      const found = cached?.content.find((d) => d.id === Number(deckId));
      if (found) return found;
      // Otherwise fetch all and search
      const data = await getDecks({ pageSize: 100 });
      return data.content.find((d) => d.id === Number(deckId)) || null;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingDeck) {
      setForm({ name: existingDeck.name });
    }
  }, [existingDeck]);

  const createMutation = useMutation({
    mutationFn: (data: DeckFormData) => createDeck({ name: sanitizeHtml(data.name) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      toast.success('Deck created!');
      navigate('/decks');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DeckFormData) => updateDeck(Number(deckId), { name: sanitizeHtml(data.name) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      toast.success('Deck updated!');
      navigate(`/decks/${deckId}`);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = deckSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof DeckFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof DeckFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEditing) {
      updateMutation.mutate(result.data);
    } else {
      createMutation.mutate(result.data);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        {isEditing ? 'Edit Deck' : 'Create New Deck'}
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Deck Name"
            placeholder="e.g., Spanish Vocabulary"
            value={form.name}
            onChange={(e) => {
              setForm({ name: e.target.value });
              setErrors({});
            }}
            error={errors.name}
            disabled={isPending}
            autoFocus
            maxLength={100}
          />

          <div className="flex gap-3">
            <Button type="submit" isLoading={isPending} className="flex-1">
              {isEditing ? 'Save Changes' : 'Create Deck'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
