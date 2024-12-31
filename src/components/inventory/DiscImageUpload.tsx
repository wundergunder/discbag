import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DiscImageUploadProps {
  discId: string;
  onImageUploaded: (urls: { front_url?: string; back_url?: string }) => void;
  existingImages?: {
    front_url?: string;
    back_url?: string;
  };
}

export function DiscImageUpload({ discId, onImageUploaded, existingImages }: DiscImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, side: 'front' | 'back') => {
    setLoading(true);
    setError(null);

    const fileExt = file.name.split('.').pop();
    const fileName = `${discId}-${side}.${fileExt}`;
    const filePath = `disc-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('disc-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError('Error uploading image. Please try again.');
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('disc-images')
      .getPublicUrl(filePath);

    onImageUploaded({ [`${side}_url`]: publicUrl });
    setLoading(false);
  };

  const removeImage = async (side: 'front' | 'back') => {
    const fileName = existingImages?.[`${side}_url`]?.split('/').pop();
    if (!fileName) return;

    await supabase.storage
      .from('disc-images')
      .remove([`disc-images/${fileName}`]);

    onImageUploaded({ [`${side}_url`]: undefined });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Front Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Front View
          </label>
          {existingImages?.front_url ? (
            <div className="relative">
              <img
                src={existingImages.front_url}
                alt="Disc front"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage('front')}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Upload front image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'front');
                }}
                disabled={loading}
              />
            </label>
          )}
        </div>

        {/* Back Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Back View
          </label>
          {existingImages?.back_url ? (
            <div className="relative">
              <img
                src={existingImages.back_url}
                alt="Disc back"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage('back')}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Upload back image</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, 'back');
                }}
                disabled={loading}
              />
            </label>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}