export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const DEFAULT_PAGE_SIZE = 15;

export const QUALITY_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'No recordé nada', color: 'bg-red-600 hover:bg-red-700 text-white' },
  1: { label: 'Incorrecta, pero me sonaba', color: 'bg-red-500 hover:bg-red-600 text-white' },
  2: { label: 'Incorrecta, pero era fácil', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  3: { label: 'Correcta con dificultad', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  4: { label: 'Correcta después de dudar', color: 'bg-emerald-400 hover:bg-emerald-500 text-white' },
  5: { label: 'Perfecta, inmediata', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
};

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])[^\s]{8,20}$/;

export const SESSION_THRESHOLD_MIN = 5;
export const SESSION_THRESHOLD_MAX = 360;
export const START_OF_DAY_MIN = 0;
export const START_OF_DAY_MAX = 23;
