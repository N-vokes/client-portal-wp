import React, { useEffect, useRef, useState } from 'react';
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
const [visionDescription, setVisionDescription] = useState('');
const [lastUploadedVisionNote, setLastUploadedVisionNote] = useState('');
const [uploadCategory, setUploadCategory] = useState('other');
const [lastUploadedCategory, setLastUploadedCategory] = useState('other');
const [selectedImage, setSelectedImage] = useState<any>(null);
const [mockUploadedImages, setMockUploadedImages] = useState<any[]>([]);
const [isEditingSelectedImage, setIsEditingSelectedImage] = useState(false);
const [editedImageTitle, setEditedImageTitle] = useState('');
const [editedImageNote, setEditedImageNote] = useState('');
const [editedImageCategory, setEditedImageCategory] = useState('other');
const [editableExistingImages, setEditableExistingImages] = useState<any[]>([]);
const [imageComments, setImageComments] = useState<Record<string, any[]>>({});
const [newComment, setNewComment] = useState('');
const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
const [collapsedReplies, setCollapsedReplies] = useState<Record<string, boolean>>({});
const [lastRepliedCommentId, setLastRepliedCommentId] = useState<string | null>(null);
const [highlightedReplyId, setHighlightedReplyId] = useState<string | null>(null);
const commentsEndRef = useRef<HTMLDivElement | null>(null);
const highlightTimeoutRef = useRef<number | null>(null);
const replyEndRefs = useRef<Record<string, HTMLDivElement | null>>({});
const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
useEffect(() => {
  setEditableExistingImages(moodBoardImages);
}, [moodBoardImages]);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && selectedImage) {
      handleCloseSelectedImage();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [selectedImage]);

useEffect(() => {
  if (!selectedImage) return;

  commentsEndRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
}, [imageComments, selectedImage]);

useEffect(() => {
  if (selectedImage) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  return () => {
    document.body.style.overflow = '';
  };
}, [selectedImage]);

useEffect(() => {
  return () => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  if (!lastRepliedCommentId) return;

  replyEndRefs.current[lastRepliedCommentId]?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });

  setLastRepliedCommentId(null);
}, [imageComments, lastRepliedCommentId]);

  const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this image?')) {
    const isMockImage = id.startsWith('mock-');

    try {
      if (isMockImage) {
  setMockUploadedImages((prev) => prev.filter((img) => img.id !== id));
} else {
  setEditableExistingImages((prev) => prev.filter((img) => img.id !== id));
  await deleteMoodBoardImage(id);
}
      if (selectedImage?.id === id) {
  handleCloseSelectedImage();
}

      addToast('Image deleted successfully', 'success');
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    }
  }
};
const handleSaveSelectedImage = () => {
  if (!selectedImage) return;

  const updatedImage = {
    ...selectedImage,
    title: editedImageTitle.trim() || selectedImage.title,
    notes: editedImageNote.trim(),
    category: editedImageCategory,
  };

  const isMockImage = selectedImage.id.startsWith('mock-');

  if (isMockImage) {
    setMockUploadedImages((prev) =>
      prev.map((img) => (img.id === selectedImage.id ? updatedImage : img))
    );
  } else {
  setEditableExistingImages((prev) =>
    prev.map((img) => (img.id === selectedImage.id ? updatedImage : img))
  );
}

  setSelectedImage(updatedImage);
  setIsEditingSelectedImage(false);
};

 const handleCloseSelectedImage = () => {
  if (highlightTimeoutRef.current) {
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = null;
  }

  setHighlightedCommentId(null);
  setIsEditingSelectedImage(false);
  setEditedImageTitle('');
  setEditedImageNote('');
  setEditedImageCategory('other');
  setNewComment('');
  setReplyDrafts({});
  setCollapsedReplies({});
  setSelectedImage(null);
};

const handleAddComment = () => {
  if (!selectedImage || !newComment.trim()) return;

  const comment = {
  id: `comment-${Date.now()}`,
  author: userRole === 'planner' ? 'Planner' : 'Couple',
  text: newComment.trim(),
  createdAt: new Date().toISOString(),
  isDecision: false,
  replies: [],
};

  setImageComments((prev) => ({
    ...prev,
    [selectedImage.id]: [...(prev[selectedImage.id] || []), comment],
  }));

  setNewComment('');
};

const handleDeleteComment = (commentId: string) => {
  if (!selectedImage) return;

  const confirmed = window.confirm('Delete this comment?');
  if (!confirmed) return;

  setImageComments((prev) => ({
    ...prev,
    [selectedImage.id]: (prev[selectedImage.id] || []).filter(
      (comment) => comment.id !== commentId
    ),
  }));
};

const handleToggleDecision = (commentId: string) => {
  if (!selectedImage) return;

  setImageComments((prev) => ({
    ...prev,
    [selectedImage.id]: (prev[selectedImage.id] || []).map((comment) =>
      comment.id === commentId
        ? { ...comment, isDecision: !comment.isDecision }
        : comment
    ),
  }));
};

const handleAddReply = (commentId: string) => {
  const draft = replyDrafts[commentId]?.trim();
  if (!selectedImage || !draft) return;

  const reply = {
    id: `reply-${Date.now()}`,
    author: userRole === 'planner' ? 'Planner' : 'Couple',
    text: draft,
    createdAt: new Date().toISOString(),
  };

  setImageComments((prev) => ({
    ...prev,
    [selectedImage.id]: (prev[selectedImage.id] || []).map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            replies: [...(comment.replies || []), reply],
          }
        : comment
    ),
  }));

  setReplyDrafts((prev) => {
    const next = { ...prev };
    delete next[commentId];
    return next;
  });
  setCollapsedReplies((prev) => ({
  ...prev,
  [commentId]: false,
}));
setLastRepliedCommentId(commentId);
setHighlightedReplyId(reply.id);
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

      const previewUrl = URL.createObjectURL(file);

const newMockImage = {
  id: `mock-${Date.now()}`,
  title: file.name.replace(/\.[^/.]+$/, ''),
  url: previewUrl,
  category: uploadCategory,
  notes: visionDescription.trim(),
  uploadedBy: userRole === 'planner' ? 'Planner' : 'Couple',
  uploadedDate: new Date().toISOString(),
};

setMockUploadedImages((prev) => [newMockImage, ...prev]);
setLastUploadedVisionNote(visionDescription.trim());
setLastUploadedCategory(uploadCategory);
addToast('Image uploaded successfully', 'success');
event.target.value = ''; // Reset file input
setVisionDescription('');
setUploadCategory('other');
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

  const allMoodBoardImages = [...mockUploadedImages, ...editableExistingImages];

const filteredImages =
  selectedCategory === 'all'
    ? allMoodBoardImages
    : allMoodBoardImages.filter((img) => img.category === selectedCategory);

    const latestDecisionComment = selectedImage
  ? [...(imageComments[selectedImage.id] || [])]
      .filter((comment) => comment.isDecision)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] || null
  : null;

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-charcoal mb-3 sm:mb-4">✨ Collaborative Mood Board</h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate max-w-xl sm:max-w-2xl lg:max-w-3xl">
            Bring your vision to life by collecting and sharing inspiration. Every image tells part of your
            wedding story.
          </p>
        </div>
        {selectedImage && (
  <div className="fixed inset-0 z-50 px-4 py-6 overflow-y-auto">
    <div
  className="fixed inset-0 bg-black/50 animate-fade-in"
/>

    <div
  onClick={handleCloseSelectedImage}
  className="relative flex items-start sm:items-center justify-center min-h-full"
>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-xl overflow-hidden my-auto flex flex-col animate-modal-enter"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gold/20">
  <h2 className="text-lg sm:text-xl font-serif text-charcoal">Image Details</h2>

  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0">
  {selectedImage && (
    <button
      onClick={() => {
        if (isEditingSelectedImage) {
  setEditedImageTitle(selectedImage?.title || '');
  setEditedImageNote(selectedImage?.notes || '');
  setEditedImageCategory(selectedImage?.category || 'other');
  setIsEditingSelectedImage(false);
  return;
}

        setEditedImageTitle(selectedImage?.title || '');
        setEditedImageNote(selectedImage?.notes || '');
        setEditedImageCategory(selectedImage?.category || 'other');
        setIsEditingSelectedImage(true);
      }}
      className="inline-flex min-h-[36px] items-center justify-center rounded-lg px-3 py-1.5 text-sm text-slate hover:text-charcoal hover:bg-sand/60 transition-colors whitespace-nowrap"
    >
      {isEditingSelectedImage ? 'Cancel' : 'Edit'}
    </button>
  )}

  {isEditingSelectedImage && (
    <button
      onClick={handleSaveSelectedImage}
      className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-charcoal/95 px-3 py-1.5 text-sm font-medium text-cream hover:bg-charcoal transition-colors whitespace-nowrap"
    >
      Save
    </button>
  )}

  <button
  onClick={handleCloseSelectedImage}
  
  className="inline-flex min-h-[36px] items-center justify-center rounded-lg px-3 py-1.5 text-sm text-slate hover:text-charcoal hover:bg-sand/60 transition-colors whitespace-nowrap"
>
  Close
</button>
</div>
</div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="overflow-hidden rounded-2xl bg-sand">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full max-h-[50vh] object-contain"
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {isEditingSelectedImage ? (
  <input
    type="text"
    value={editedImageTitle}
    onChange={(e) => setEditedImageTitle(e.target.value)}
    className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-base sm:text-lg font-serif text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
  />
) : (
  <h3 className="text-lg sm:text-xl font-serif text-charcoal leading-tight break-words">
    {selectedImage.title}
  </h3>
)}
              {isEditingSelectedImage ? (
  <select
    value={editedImageCategory}
    onChange={(e) => setEditedImageCategory(e.target.value)}
    className="w-full sm:w-auto rounded-xl border border-gold/20 bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
  >
    {categories
      .filter((cat) => cat.id !== 'all')
      .map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.label}
        </option>
      ))}
  </select>
) : (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/70 px-3 py-1 text-[11px] sm:text-xs text-charcoal w-fit">
    <span>{categoryIcons[selectedImage.category]}</span>
    <span>{categories.find((cat) => cat.id === selectedImage.category)?.label || 'Other'}</span>
  </span>
)}
            </div>

            <div>
              <div>
  <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate mb-1">
    Vision note
  </p>

  {isEditingSelectedImage ? (
    <textarea
      value={editedImageNote}
      onChange={(e) => setEditedImageNote(e.target.value)}
      rows={4}
      className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm sm:text-base text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
      placeholder="Add a note about the style, mood, or details you love..."
    />
  ) : (
    <p className="text-sm sm:text-base text-slate leading-relaxed break-words">
      {selectedImage.notes?.trim() ? selectedImage.notes : 'No description added yet.'}
    </p>
  )}
</div>
</div>

            <div className="pt-3 border-t border-gold/20 text-xs sm:text-sm text-slate space-y-1">
              <p>Uploaded by: {selectedImage.uploadedBy}</p>
              <p>Date: {new Date(selectedImage.uploadedDate).toLocaleDateString()}</p>
            </div>
            <div className="pt-4 border-t border-gold/20 space-y-3">
  <div className="flex items-center justify-between gap-2 flex-wrap">
    <h4 className="text-sm sm:text-base font-medium text-charcoal">Comments</h4>

    <div className="flex items-center gap-2 flex-wrap justify-end">
      <span className="text-xs text-slate">
        {(imageComments[selectedImage.id] || []).length}{' '}
        {(imageComments[selectedImage.id] || []).length === 1 ? 'comment' : 'comments'}
      </span>

      <span className="inline-flex items-center rounded-full bg-charcoal/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-charcoal">
        {(imageComments[selectedImage.id] || []).filter((comment) => comment.isDecision).length}{' '}
        {(imageComments[selectedImage.id] || []).filter((comment) => comment.isDecision).length === 1
          ? 'decision'
          : 'decisions'}
      </span>
    </div>
  </div>

  <p className="text-[11px] sm:text-xs text-slate">
    Decision comments are shown first to keep key planning choices easy to find.
  </p>

  {latestDecisionComment && (
  <button
    type="button"
    onClick={() => {
  const targetId = latestDecisionComment.id;

  if (highlightTimeoutRef.current) {
    window.clearTimeout(highlightTimeoutRef.current);
  }

  setHighlightedCommentId(targetId);

  const target = document.getElementById(`comment-${targetId}`);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  highlightTimeoutRef.current = window.setTimeout(() => {
    setHighlightedCommentId((current) => (current === targetId ? null : current));
    highlightTimeoutRef.current = null;
  }, 1800);
}}
    className="w-full rounded-xl border border-charcoal/15 bg-charcoal/5 px-4 py-4 space-y-2 text-left hover:bg-charcoal/10 transition-colors"
  >
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="inline-flex items-center rounded-full bg-charcoal text-cream px-2.5 py-1 text-[11px] sm:text-xs font-medium">
        Latest decision
      </span>

      <p className="text-xs text-slate whitespace-nowrap">
        {new Date(latestDecisionComment.createdAt).toLocaleString([], {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
    </div>

    <p className="text-sm text-charcoal leading-relaxed break-words">
      {latestDecisionComment.text}
    </p>

    <div className="flex items-center justify-between gap-2 flex-wrap">
  <p className="text-[11px] sm:text-xs text-slate">
    Shared by {latestDecisionComment.author}
  </p>

  <span className="text-[11px] sm:text-xs text-slate">
    Tap to jump to comment
  </span>
</div>
  </button>
)}

  {(imageComments[selectedImage.id] || []).length > 0 ? (
  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
    {[...(imageComments[selectedImage.id] || [])]
  .sort((a, b) => Number(b.isDecision) - Number(a.isDecision))
  .map((comment) => (
      <div
  key={comment.id}
  id={`comment-${comment.id}`}
  className={`rounded-xl px-4 py-3 transition-all duration-500 ease-out ${
    highlightedCommentId === comment.id
      ? 'ring-2 ring-gold/40 bg-gold/10'
      : comment.isDecision
      ? 'border border-charcoal/20 bg-charcoal/5 ring-1 ring-charcoal/10'
      : 'border border-gold/20 bg-sand/30'
  }`}
>
        <div className="flex items-start justify-between gap-3 mb-1">
  <div className="flex items-center gap-2 flex-wrap">
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium ${
      comment.author === 'Planner'
        ? 'bg-charcoal text-cream'
        : 'bg-sand text-charcoal'
    }`}
  >
    {comment.author}
  </span>

  {comment.isDecision && (
    <span className="inline-flex items-center rounded-full bg-charcoal/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-charcoal">
      Decision
    </span>
  )}

  <p className="text-xs text-slate whitespace-nowrap">
    {new Date(comment.createdAt).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}
  </p>
</div>

  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => handleToggleDecision(comment.id)}
      className="inline-flex min-h-[28px] items-center justify-center rounded-md px-2.5 py-1 text-xs text-slate hover:text-charcoal hover:bg-white/70 transition-colors whitespace-nowrap"
    >
      {comment.isDecision ? 'Remove decision' : 'Mark as decision'}
    </button>

    <button
      type="button"
      onClick={() => handleDeleteComment(comment.id)}
      className="inline-flex min-h-[28px] items-center justify-center rounded-md px-2.5 py-1 text-xs text-slate hover:text-charcoal hover:bg-white/70 transition-colors whitespace-nowrap"
    >
      Delete
    </button>
  </div>
</div>

        <p className="text-sm text-slate leading-relaxed break-words">
          {comment.text}
        </p>

        <div className="mt-3 flex items-center justify-start gap-2 flex-wrap">
  <button
    type="button"
    onClick={() => {
      setReplyDrafts((prev) => ({
        ...prev,
        [comment.id]: prev[comment.id] ?? '',
      }));
    }}
    className={`inline-flex min-h-[28px] items-center justify-center rounded-md px-2.5 py-1 text-xs transition-colors whitespace-nowrap ${
      comment.id in replyDrafts
        ? 'bg-charcoal text-cream'
        : 'text-slate hover:text-charcoal hover:bg-white/70'
    }`}
  >
    {comment.id in replyDrafts ? 'Replying…' : 'Reply'}
  </button>

  {(comment.replies || []).length > 0 && (
    <button
      type="button"
      onClick={() =>
        setCollapsedReplies((prev) => ({
          ...prev,
          [comment.id]: !prev[comment.id],
        }))
      }
      className="inline-flex min-h-[28px] items-center justify-center rounded-md px-2.5 py-1 text-xs text-slate hover:text-charcoal hover:bg-white/70 transition-colors whitespace-nowrap"
    >
      {collapsedReplies[comment.id]
        ? `Show replies (${(comment.replies || []).length})`
        : `Hide replies (${(comment.replies || []).length})`}
    </button>
  )}
  {(comment.replies || []).length > 0 && collapsedReplies[comment.id] && (
  <div className="mt-3 space-y-2 rounded-xl border border-gold/15 bg-white/60 px-3 py-3">
    <p className="text-xs sm:text-sm text-slate">
      {(comment.replies || []).length}{' '}
      {(comment.replies || []).length === 1 ? 'reply is hidden' : 'replies are hidden'}.
    </p>

    {(() => {
      const latestReply = [...(comment.replies || [])].sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      if (!latestReply) return null;

      return (
        <div className="rounded-lg bg-sand/40 px-3 py-2">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium ${
                latestReply.author === 'Planner'
                  ? 'bg-charcoal text-cream'
                  : 'bg-sand text-charcoal'
              }`}
            >
              {latestReply.author}
            </span>

            <p className="text-[10px] sm:text-xs text-slate whitespace-nowrap">
              {new Date(latestReply.createdAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate leading-relaxed break-words line-clamp-2">
            {latestReply.text}
          </p>
        </div>
      );
    })()}
  </div>
)}
</div>
{comment.id in replyDrafts && (
  <div className="mt-3 space-y-3 rounded-xl border border-gold/15 bg-white/70 px-3 py-3">
    <textarea
      value={replyDrafts[comment.id] || ''}
      onChange={(e) =>
        setReplyDrafts((prev) => ({
          ...prev,
          [comment.id]: e.target.value,
        }))
      }
      rows={2}
      placeholder="Write a reply..."
      className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
    />

    <div className="flex items-center justify-end gap-2">
  <button
    type="button"
    onClick={() =>
      setReplyDrafts((prev) => {
        const next = { ...prev };
        delete next[comment.id];
        return next;
      })
    }
    className="inline-flex min-h-[28px] items-center justify-center rounded-md px-2.5 py-1 text-xs text-slate hover:text-charcoal hover:bg-white/70 transition-colors whitespace-nowrap"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={() => handleAddReply(comment.id)}
    disabled={!replyDrafts[comment.id]?.trim()}
    className="inline-flex min-h-[28px] items-center justify-center rounded-md bg-charcoal px-3 py-1 text-xs font-medium text-cream hover:bg-slate transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
  >
    Post Reply
  </button>
</div>
  </div>
)}
    {(comment.replies || []).length > 0 && !collapsedReplies[comment.id] && (
  <div className="mt-4 space-y-3 border-l border-gold/20 pl-4">
    {(comment.replies || []).map((reply: any) => (
      <div
  key={reply.id}
  className={`rounded-xl px-4 py-3 transition-all duration-500 ease-out ${
    highlightedReplyId === reply.id
      ? 'border border-gold/30 bg-gold/10 ring-2 ring-gold/30'
      : 'border border-gold/15 bg-white/70'
  }`}
>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium ${
              reply.author === 'Planner'
                ? 'bg-charcoal text-cream'
                : 'bg-sand text-charcoal'
            }`}
          >
            {reply.author}
          </span>

          <p className="text-xs text-slate whitespace-nowrap">
            {new Date(reply.createdAt).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <p className="text-sm text-slate leading-relaxed break-words">
          {reply.text}
        </p>
      </div>
    ))}

    <div
      ref={(el) => {
        replyEndRefs.current[comment.id] = el;
      }}
    />
  </div>
)}
      </div>
    ))}

    {/* 👇 THIS is the important part */}
    <div ref={commentsEndRef} />
  </div>
) : (
  <div className="rounded-xl border border-gold/20 bg-sand/20 px-4 py-4">
  <p className="text-sm text-slate leading-relaxed">
    No comments yet. Start the conversation around this inspiration image.
  </p>
</div>
  )}
  <div className="pt-3 mt-1 border-t border-gold/10 space-y-3">
  <label className="block">
    <span className="text-[11px] sm:text-xs uppercase tracking-wide text-slate mb-2 block">
      Add a comment
    </span>
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      rows={3}
      placeholder={
  userRole === 'planner'
    ? "Add guidance or feedback for this inspiration..."
    : "Share what you love (or want to change) about this..."
}
      className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm sm:text-base text-charcoal placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:ring-offset-1 resize-none"
    />
  </label>

  <div className="flex justify-end">
    <button
  type="button"
  onClick={handleAddComment}
  disabled={!newComment.trim()}
  className="inline-flex min-h-[36px] items-center justify-center rounded-lg bg-charcoal/95 px-4 py-2 text-sm font-medium text-cream hover:bg-charcoal transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
>
  Post Comment
</button>
  </div>
</div>
</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-serif text-charcoal mb-1 sm:mb-2">{allMoodBoardImages.length}</p>
            <p className="text-xs sm:text-sm text-slate">Total Items</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-serif text-charcoal mb-1 sm:mb-2">2</p>
            <p className="text-xs sm:text-sm text-slate">Contributors</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-serif text-charcoal mb-1 sm:mb-2">6</p>
            <p className="text-xs sm:text-sm text-slate">Categories</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl sm:text-3xl font-serif text-charcoal mb-1 sm:mb-2">100%</p>
            <p className="text-xs sm:text-sm text-slate">Aligned</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 sm:mb-12 flex flex-wrap gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-charcoal text-cream font-medium'
                  : 'bg-sand text-charcoal hover:bg-taupe'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

{filteredImages.length > 0 && lastUploadedVisionNote && (
  <div className="mb-6 sm:mb-8 rounded-xl border border-gold/20 bg-white p-4 sm:p-5 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
      <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate">
        Latest saved vision note
      </p>
      <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[11px] sm:text-xs text-charcoal w-fit">
        <span>{categoryIcons[lastUploadedCategory]}</span>
        {categories.find((cat) => cat.id === lastUploadedCategory)?.label || 'Other'}
      </span>
    </div>
    <p className="text-sm sm:text-base text-charcoal leading-relaxed break-words">
      {lastUploadedVisionNote}
    </p>
  </div>
)}
        {/* Mood Board Gallery */}
        <div className="mb-16">
          {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-max">
            {filteredImages.map((image) => (
              <div key={image.id} className="group cursor-pointer space-y-3 sm:space-y-4">
                <div className="mood-image-hover relative overflow-hidden rounded-lg bg-sand aspect-square">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
  onClick={() => {
  setNewComment('');
  setReplyDrafts({});
  setCollapsedReplies({});
  setSelectedImage(image);
}}
  className="btn-primary text-sm"
>
  View Details
</button>
                  </div>
                </div>

                <div className="card p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
  <h3 className="font-serif text-charcoal font-medium text-sm sm:text-base leading-tight break-words">
    {image.title}
  </h3>
  <span className="inline-flex items-center gap-1.5 rounded-full bg-sand/70 px-2.5 py-1 text-[11px] sm:text-xs text-charcoal shrink-0 max-w-full">
  <span>{categoryIcons[image.category]}</span>
  <span className="truncate">
    {categories.find((cat) => cat.id === image.category)?.label || 'Other'}
  </span>
</span>
</div>

                  <div className="mb-2 sm:mb-3">
  <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate mb-1">
    Vision note
  </p>
  <p className="text-xs sm:text-sm text-slate leading-relaxed break-words">
  {image.notes?.trim() ? image.notes : 'No description added yet.'}
</p>
</div>

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
            <div className="py-12 sm:py-16 lg:py-20 text-center">
              <div className="inline-block mb-6">
                <p className="text-6xl mb-4">✨</p>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-charcoal mb-3">Start Your Inspiration Board</h3>
<p className="text-sm sm:text-base text-slate max-w-md mx-auto mb-6 sm:mb-8">
                {userRole === 'planner'
  ? 'Begin collecting inspiration images and vision notes to align on the visual direction with your couple. Set the tone for your wedding.'
  : 'Share your vision with your planner. Upload photos and add notes about the style, mood, or details you love.'}
              </p>
              {userRole === 'planner' && (
                <button className="btn-primary">📸 Upload Your Inspiration</button>
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
          <div className="card border-2 border-dashed border-gold/50 text-center py-10 sm:py-14 lg:py-16 hover:border-gold transition-colors">
            <p className="text-4xl mb-4">📸</p>
            <h3 className="text-xl font-serif text-charcoal mb-2">Add Images to Mood Board</h3>
            <p className="text-slate mb-6">Share your inspiration with your partner or planner</p>
            <div className="max-w-xl mx-auto mb-5 sm:mb-6">
  <label className="block text-left text-sm font-medium text-charcoal mb-2">
    Select a category
  </label>
  <select
    value={uploadCategory}
    onChange={(e) => setUploadCategory(e.target.value)}
    className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30"
  >
    {categories
      .filter((cat) => cat.id !== 'all')
      .map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.label}
        </option>
      ))}
  </select>
</div>
            <div className="max-w-xl mx-auto mb-5 sm:mb-6">
  <label className="block text-left text-sm font-medium text-charcoal mb-2">
  Add a vision note <span className="text-slate font-normal">(recommended)</span>
</label>
  <textarea
    value={visionDescription}
    onChange={(e) => setVisionDescription(e.target.value)}
    rows={4}
    placeholder="Describe what you love about this inspiration image..."
    className="w-full rounded-xl border border-gold/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-slate/70 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
  />
  <p className="mt-2 text-left text-xs text-slate">
  This note helps explain the style, mood, or details you want your planner to notice.
</p>
{visionDescription.trim() && (
  <div className="mt-3 rounded-xl bg-sand/60 px-4 py-3 text-left">
    <p className="text-[11px] sm:text-xs uppercase tracking-wide text-slate mb-1">
      Vision note preview
    </p>
    <p className="text-sm text-charcoal leading-relaxed break-words">
      {visionDescription}
    </p>
  </div>
)}
</div>
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
  className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
