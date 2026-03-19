import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { useToast } from '../contexts/ToastContext';
import { MoodBoardSkeleton } from '../components/Skeleton';
import { validators, getErrorMessage } from '../utils/validation';

interface MoodBoardProps {
  userRole: 'planner' | 'couple';
}

export const MoodBoard: React.FC<MoodBoardProps> = ({ userRole }) => {
  const { moodBoardImages, deleteMoodBoardImage, loading } = useWedding();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        await deleteMoodBoardImage(id);
        addToast('Image deleted successfully', 'success');
      } catch (error) {
        addToast(getErrorMessage(error), 'error');
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image
    const validationErrors = validators.validateImage(file, { maxSizeMB: 5 });

    if (validationErrors.length > 0) {
      addToast(validationErrors[0].message, 'error');
      return;
    }

    try {
      setUploading(true);
      // Simulate image upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addToast('Image uploaded successfully', 'success');
      event.target.value = ''; // Reset file input
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <MoodBoardSkeleton userRole={userRole} />;
  }

  const categories = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'flowers', label: 'Flowers', icon: '🌹' },
    { id: 'dress', label: 'Dress', icon: '👗' },
    { id: 'decor', label: 'Décor', icon: '🎀' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'cake', label: 'Cake', icon: '🍰' },
    { id: 'other', label: 'Other', icon: '💫' },
  ];

  const categoryIcons: Record<string, string> = {
    flowers: '🌹',
    dress: '👗',
    decor: '🎀',
    colors: '🎨',
    cake: '🍰',
    other: '💫',
  };

  const filteredImages = 
    selectedCategory === 'all'
      ? moodBoardImages
      : moodBoardImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h1 className="text-5xl font-serif text-charcoal mb-4">✨ Collaborative Mood Board</h1>
          <p className="text-lg text-slate max-w-3xl">
            Bring your vision to life by collecting and sharing inspiration. Every image tells part of your
            wedding story.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card text-center">
            <p className="text-4xl font-serif text-charcoal mb-2">{moodBoardImages.length}</p>
            <p className="text-slate">Total Items</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal mb-2">2</p>
            <p className="text-slate">Contributors</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal mb-2">6</p>
            <p className="text-slate">Categories</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-serif text-charcoal mb-2">100%</p>
            <p className="text-slate">Aligned</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-charcoal text-cream font-medium'
                  : 'bg-sand text-charcoal hover:bg-taupe'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Mood Board Gallery */}
        <div className="mb-16">
          {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
            {filteredImages.map((image) => (
              <div key={image.id} className="group cursor-pointer">
                <div className="mood-image-hover relative overflow-hidden rounded-lg mb-4 bg-sand aspect-square">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button className="btn-primary text-sm">View Details</button>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-charcoal font-medium text-sm">{image.title}</h3>
                    <span className="text-lg">{categoryIcons[image.category]}</span>
                  </div>

                  <p className="text-xs text-slate mb-3">{image.notes}</p>

                  <div className="pt-3 border-t border-gold/20 text-xs text-slate space-y-1">
                    <p>📤 {image.uploadedBy} • {new Date(image.uploadedDate).toLocaleDateString()}</p>
                    {userRole === 'planner' && (
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="block w-full mt-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="py-20 text-center">
              <div className="inline-block mb-6">
                <p className="text-6xl mb-4">✨</p>
              </div>
              <h3 className="text-2xl font-serif text-charcoal mb-3">Start Your Inspiration Board</h3>
              <p className="text-slate max-w-md mx-auto mb-8">
                {userRole === 'planner'
                  ? 'Begin collecting inspiration images to align on the visual direction with your couple. Set the tone for your wedding.'
                  : 'Share your vision with your planner. Upload photos that inspire you for flowers, décor, dress, colors, and more.'}
              </p>
              {userRole === 'planner' && (
                <button className="btn-primary">📸 Add First Image</button>
              )}
              {userRole === 'couple' && (
                <button className="btn-primary">📸 Upload Your Inspiration</button>
              )}
              <p className="text-xs text-slate italic mt-4">PNG, JPG, WebP up to 5MB each</p>
            </div>
          )}
        </div>

        {/* Empty State or Upload */}
        {userRole === 'planner' || userRole === 'couple' ? (
          <div className="card border-2 border-dashed border-gold/50 text-center py-16 hover:border-gold transition-colors">
            <p className="text-4xl mb-4">📸</p>
            <h3 className="text-xl font-serif text-charcoal mb-2">Add Images to Mood Board</h3>
            <p className="text-slate mb-6">Share your inspiration with your partner or planner</p>
            <label className="inline-block">
              <input
                type="file"
                onChange={handleImageUpload}
                disabled={uploading}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <button
                onClick={(e) => (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.click()}
                disabled={uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
            </label>
            <p className="text-xs text-slate mt-4">PNG, JPG, WebP up to 5MB each</p>
          </div>
        ) : null}

        {/* Collaboration Tips */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card opacity-70 pointer-events-none" style={{ cursor: 'not-allowed' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl">🎨</p>
              <span className="text-xs text-slate">Coming soon</span>
            </div>
            <h3 className="font-serif text-charcoal mb-2">Colors & Palette</h3>
            <p className="text-sm text-slate">Define your color story with inspiration from real examples</p>
          </div>
          <div className="card opacity-70 pointer-events-none" style={{ cursor: 'not-allowed' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl">💬</p>
              <span className="text-xs text-slate">Coming soon</span>
            </div>
            <h3 className="font-serif text-charcoal mb-2">Add Notes</h3>
            <p className="text-sm text-slate">Comment on images to share thoughts and preferences</p>
          </div>
          <div className="card opacity-70 pointer-events-none" style={{ cursor: 'not-allowed' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-2xl">👥</p>
              <span className="text-xs text-slate">Coming soon</span>
            </div>
            <h3 className="font-serif text-charcoal mb-2">Collaborate</h3>
            <p className="text-sm text-slate">Both you and your planner can contribute and refine ideas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
