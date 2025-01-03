import type { DiscModel, DiscManufacturer } from '../../types/database';

interface DiscModelGridProps {
  models: Array<DiscModel & { manufacturer: DiscManufacturer }>;
  onSelect: (model: DiscModel & { manufacturer: DiscManufacturer }) => void;
}

export function DiscModelGrid({ models, onSelect }: DiscModelGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelect(model)}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left hover:border-blue-500 transition-colors"
        >
          <h3 className="text-lg font-semibold">
            {model.manufacturer.name} {model.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{model.type}</p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Flight Numbers</p>
            <p className="font-medium">
              {model.speed} | {model.glide} | {model.turn} | {model.fade}
            </p>
          </div>
          {model.description && (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">{model.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}