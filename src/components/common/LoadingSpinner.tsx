import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
}