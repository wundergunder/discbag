import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AddDiscButton() {
  return (
    <Link
      to="/inventory/add"
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <PlusCircle size={20} />
      <span>Add Disc</span>
    </Link>
  );
}