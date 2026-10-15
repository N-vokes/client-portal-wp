import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/supabase';
import { validators } from '../../utils/validation';

type PortfolioWedding = {
  id: string;
  coupleNames: string;
  weddingDate: string;
  coverImagePath: string | null;
  coverImageUrl: string | null;
  coverLoadError: string | null;
};

type CoverUploadState = {
  uploading: boolean;
  error: string | null;
  notice: string | null;
};

type WeddingDateInfo = {
  status: 'Upcoming' | 'Today' | 'Past' | 'Date not set';
  countdown: string;
  formattedDate: string;
};

const getWeddingDateInfo = (dateValue: string): WeddingDateInfo => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) {
    return { status: 'Date not set', countdown: 'Date not set', formattedDate: 'Wedding date not set' };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const weddingDay = Date.UTC(year, month - 1, day);
  const parsed = new Date(weddingDay);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return { status: 'Date not set', countdown: 'Date not set', formattedDate: 'Wedding date not set' };
  }

  const today = new Date();
  const todayCalendarDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysRemaining = Math.round((weddingDay - todayCalendarDay) / 86_400_000);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (daysRemaining === 0) {
    return { status: 'Today', countdown: 'Wedding day is today!', formattedDate };
  }
  if (daysRemaining < 0) {
    return { status: 'Past', countdown: 'Wedding day passed', formattedDate };
  }
  return {
    status: 'Upcoming',
    countdown: `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} to go`,
    formattedDate,
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
};

export const MultiWeddingDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const [weddings, setWeddings] = React.useState<PortfolioWedding[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [coupleNames, setCoupleNames] = React.useState('');
  const [weddingDate, setWeddingDate] = React.useState('');
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = React.useState<string | null>(null);
  const [coverUploadStates, setCoverUploadStates] = React.useState<Record<string, CoverUploadState>>({});
  const [refreshKey, setRefreshKey] = React.useState(0);
  const createInProgressRef = React.useRef(false);

  React.useEffect(() => {
    if (!user?.id) {
      setWeddings([]);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadWeddings = async () => {
      setLoading(true);
      setError(null);

      try {
        const rows = await db.getWeddingsForUser(user.id);

        if (!isMounted) {
          return;
        }

        const mapped = await Promise.all((rows ?? []).map(async (wedding: any): Promise<PortfolioWedding> => {
          const id = String(wedding.id);
          const coverImagePath = typeof wedding.cover_image_path === 'string'
            ? wedding.cover_image_path
            : null;
          let coverImageUrl: string | null = null;
          let coverLoadError: string | null = null;

          if (coverImagePath) {
            try {
              coverImageUrl = await db.getWeddingCoverPhotoSignedUrl(id, coverImagePath);
            } catch (imageError) {
              console.error(`Unable to load cover photo for wedding ${id}:`, imageError);
              coverLoadError = 'This cover photo could not be loaded. Try uploading it again.';
            }
          }

          return {
            id,
            coupleNames: String(wedding.couple_names || 'Unnamed couple'),
            weddingDate: String(wedding.wedding_date || ''),
            coverImagePath,
            coverImageUrl,
            coverLoadError,
          };
        }));

        if (!isMounted) return;
        setWeddings(mapped);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError('Unable to load your weddings right now.');
        setWeddings([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadWeddings();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshKey]);

  const handleCreateWedding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createInProgressRef.current) return;

    const trimmedCoupleNames = coupleNames.trim();
    if (!trimmedCoupleNames || !weddingDate) {
      setCreateError('Enter the couple names and select a wedding date.');
      return;
    }

    if (!user?.id) {
      setCreateError('Please sign in again before creating a wedding.');
      return;
    }

  createInProgressRef.current = true;
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const createdWedding = await db.createWeddingForUser(
        user.id,
        trimmedCoupleNames,
        weddingDate
      );

      if (!createdWedding?.id) {
        throw new Error('Wedding was created without an ID. Please refresh the portfolio.');
      }

      setCoupleNames('');
      setWeddingDate('');
      setIsCreateFormOpen(false);
      setCreateSuccess(`Workspace for ${trimmedCoupleNames} created.`);
      setRefreshKey((current) => current + 1);
    } catch (createError: unknown) {
      setCreateError(getErrorMessage(createError, 'Unable to create this wedding. Please try again.'));
    } finally {
      createInProgressRef.current = false;
      setIsCreating(false);
    }
  };

  const setCoverUploadState = (weddingId: string, state: CoverUploadState) => {
    setCoverUploadStates((current) => ({ ...current, [weddingId]: state }));
  };

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    wedding: PortfolioWedding
  ) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    if (userRole !== 'planner' || !user?.id) {
      setCoverUploadState(wedding.id, {
        uploading: false,
        error: 'Only the wedding planner can manage this cover photo.',
        notice: null,
      });
      return;
    }

    const validationErrors = validators.validateImage(file, { maxSizeMB: 5 });
    if (validationErrors.length > 0) {
      setCoverUploadState(wedding.id, {
        uploading: false,
        error: validationErrors[0].message,
        notice: null,
      });
      return;
    }

    setCoverUploadState(wedding.id, { uploading: true, error: null, notice: null });
    let uploadedPath: string | null = null;
    let savedNewPath = false;

    try {
      uploadedPath = await db.uploadWeddingCoverPhoto(wedding.id, file);
      const signedUrl = await db.getWeddingCoverPhotoSignedUrl(wedding.id, uploadedPath);
      await db.updateWeddingCoverImagePath(wedding.id, uploadedPath);
      savedNewPath = true;

      setWeddings((current) => current.map((item) => item.id === wedding.id
        ? { ...item, coverImagePath: uploadedPath, coverImageUrl: signedUrl, coverLoadError: null }
        : item));

      if (wedding.coverImagePath) {
        try {
          await db.removeWeddingCoverPhoto(wedding.id, wedding.coverImagePath);
        } catch (cleanupError) {
          console.error(`Unable to remove replaced cover photo for wedding ${wedding.id}:`, cleanupError);
          setCoverUploadState(wedding.id, {
            uploading: false,
            error: `The new cover photo is saved, but the previous file could not be removed: ${getErrorMessage(cleanupError, 'storage cleanup failed')}`,
            notice: null,
          });
          return;
        }
      }

      setCoverUploadState(wedding.id, {
        uploading: false,
        error: null,
        notice: 'Cover photo saved.',
      });
    } catch (uploadError: unknown) {
      let message = getErrorMessage(uploadError, 'Unable to save this cover photo. Please try again.');
      if (uploadedPath && !savedNewPath) {
        try {
          await db.removeWeddingCoverPhoto(wedding.id, uploadedPath);
        } catch (cleanupError) {
          console.error(`Unable to clean up failed cover upload for wedding ${wedding.id}:`, cleanupError);
          message += ` The uploaded file could not be removed: ${getErrorMessage(cleanupError, 'storage cleanup failed')}`;
        }
      }

      setCoverUploadState(wedding.id, { uploading: false, error: message, notice: null });
    }
  };

  const handleCoverRemoval = async (wedding: PortfolioWedding) => {
    if (userRole !== 'planner' || !user?.id) {
      setCoverUploadState(wedding.id, {
        uploading: false,
        error: 'Only the wedding planner can manage this cover photo.',
        notice: null,
      });
      return;
    }

    if (!wedding.coverImagePath || !window.confirm(`Remove the cover photo for ${wedding.coupleNames}?`)) {
      return;
    }

    setCoverUploadState(wedding.id, { uploading: true, error: null, notice: null });
    try {
      await db.updateWeddingCoverImagePath(wedding.id, null);
      setWeddings((current) => current.map((item) => item.id === wedding.id
        ? { ...item, coverImagePath: null, coverImageUrl: null, coverLoadError: null }
        : item));

      try {
        await db.removeWeddingCoverPhoto(wedding.id, wedding.coverImagePath);
      } catch (cleanupError) {
        console.error(`Unable to remove cover photo file for wedding ${wedding.id}:`, cleanupError);
        setCoverUploadState(wedding.id, {
          uploading: false,
          error: `The cover was removed from the wedding, but its stored file could not be deleted: ${getErrorMessage(cleanupError, 'storage cleanup failed')}`,
          notice: null,
        });
        return;
      }

      setCoverUploadState(wedding.id, {
        uploading: false,
        error: null,
        notice: 'Cover photo removed.',
      });
    } catch (removeError: unknown) {
      setCoverUploadState(wedding.id, {
        uploading: false,
        error: getErrorMessage(removeError, 'Unable to remove this cover photo. Please try again.'),
        notice: null,
      });
    }
  };

  const portfolioItems = weddings.length > 0 ? weddings : [];
  const totalActiveWeddings = portfolioItems.length;

  return (
    <section className="mx-auto mb-12 mt-6 max-w-7xl px-4 md:px-8">
      <header className="mb-7 flex flex-col gap-4 border-b border-[#D8E3DB] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#075B46]">Planner Portfolio</p>
          <h1 className="text-3xl font-serif leading-tight text-[#172D26] md:text-4xl">Wedding Portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#73796F] md:text-base">
            A personal, visual home for every couple and their celebration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#D4A843] bg-white px-4 py-2 text-sm font-semibold text-[#172D26] transition-colors hover:bg-[#FBF0D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46] focus-visible:ring-offset-2"
          >
            Dashboard
          </Link>
          <span className="rounded-full border border-[#D9E5DD] bg-white px-3 py-2 text-sm text-[#514B45]">
            <span className="font-semibold text-[#075B46]">{totalActiveWeddings}</span>
            {' '}{totalActiveWeddings === 1 ? 'wedding' : 'weddings'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsCreateFormOpen((isOpen) => !isOpen);
              setCreateError(null);
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#075B46] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2"
          >
            {isCreateFormOpen ? 'Cancel' : 'New Wedding'}
          </button>
        </div>
      </header>

      {isCreateFormOpen && (
        <form onSubmit={handleCreateWedding} className="mb-6 grid gap-4 rounded-xl border border-[#D9E5DD] bg-white p-4 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#302D2A]" htmlFor="portfolio-couple-names">
              Couple names
            </label>
            <input
              id="portfolio-couple-names"
              type="text"
              value={coupleNames}
              onChange={(event) => setCoupleNames(event.target.value)}
              maxLength={160}
              required
              placeholder="e.g. Sarah & Michael"
              disabled={isCreating}
              className="w-full rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-sm text-[#302D2A] outline-none transition focus:border-[#075B46] focus:ring-2 focus:ring-[#075B46]/15 disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#302D2A]" htmlFor="portfolio-wedding-date">
              Wedding date
            </label>
            <input
              id="portfolio-wedding-date"
              type="date"
              value={weddingDate}
              onChange={(event) => setWeddingDate(event.target.value)}
              required
              disabled={isCreating}
              className="w-full rounded-lg border border-[#D9E5DD] bg-white px-4 py-3 text-sm text-[#302D2A] outline-none transition focus:border-[#075B46] focus:ring-2 focus:ring-[#075B46]/15 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#172D26] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#075B46] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? 'Creating…' : 'Create Wedding'}
          </button>
          {createError && (
            <p role="alert" className="text-sm text-[#9A3F3C] md:col-span-3">{createError}</p>
          )}
        </form>
      )}

      {createSuccess && (
        <p role="status" className="mb-5 rounded-lg border border-[#C8DDD0] bg-[#E2F0E8] px-4 py-3 text-sm text-[#315744]">
          {createSuccess}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-xl border border-[#D9E5DD] bg-white px-6 py-10 text-center text-[#73796F]">
          Loading weddings...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-[#E9C7C5] bg-white px-6 py-10 text-center text-[#783B3A]">
          {error}
        </div>
      ) : portfolioItems.length === 0 ? (
        <div className="rounded-2xl border border-[#D9E5DD] bg-white px-6 py-12 text-center md:px-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E2F0E8] text-[#075B46]">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9.5c0 6.2-8 11-8 11Z" />
            </svg>
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#075B46]">A new beginning</p>
          <h2 className="text-2xl font-serif text-[#172D26]">Your portfolio starts here</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#73796F]">
            Create a wedding workspace to keep each couple’s details and planning journey close at hand.
          </p>
          {!isCreateFormOpen && (
            <button
              type="button"
              onClick={() => setIsCreateFormOpen(true)}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#075B46] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2"
            >
              Create your first wedding
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {portfolioItems.map((item) => {
            const dateInfo = getWeddingDateInfo(item.weddingDate);
            const coverState = coverUploadStates[item.id] ?? {
              uploading: false,
              error: null,
              notice: null,
            };
            const statusClasses = dateInfo.status === 'Upcoming'
              ? 'border-[#D7E1EF] bg-[#E5EEF9] text-[#435A78]'
              : dateInfo.status === 'Today'
                ? 'border-[#C8DDD0] bg-[#E2F0E8] text-[#315744]'
                : dateInfo.status === 'Past'
                  ? 'border-[#E8E0D4] bg-[#F1EEE8] text-[#5E645C]'
                  : 'border-[#E7D59F] bg-[#FBF0D4] text-[#684B1F]';
            const countdownClasses = dateInfo.status === 'Past'
              ? 'bg-[#F1EEE8] text-[#5E645C]'
              : dateInfo.status === 'Today'
                ? 'bg-[#E2F0E8] text-[#315744]'
                : dateInfo.status === 'Upcoming'
                  ? 'bg-[#FBF0D4] text-[#684B1F]'
                  : 'bg-[#F8F5F0] text-[#73796F]';
            const uploadInputId = `cover-photo-${item.id}`;

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-[#D9E5DD] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#D4A843] hover:shadow-[0_14px_36px_rgba(23,45,38,0.12)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E8EEE9]">
                  {item.coverImageUrl ? (
                    <img
                      src={item.coverImageUrl}
                      alt={`Cover photograph for ${item.coupleNames}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      onError={() => setWeddings((current) => current.map((wedding) => wedding.id === item.id
                        ? { ...wedding, coverImageUrl: null, coverLoadError: 'This cover photo could not be displayed. Try uploading it again.' }
                        : wedding))}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_#FFFFFF_0%,_#F1F5F0_65%,_#E2F0E8_100%)] px-5 text-center">
                      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#D4A843]/45 bg-white/75 text-[#075B46]">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-7 w-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9.5c0 6.2-8 11-8 11Z" />
                        </svg>
                      </span>
                      <p className="font-serif text-lg text-[#172D26]">A moment worth remembering</p>
                      <p className="mt-1 text-xs text-[#73796F]">
                        {item.coverLoadError ? 'Cover photo unavailable' : 'Add a cover photograph'}
                      </p>
                    </div>
                  )}

                  <div className="absolute left-3 top-3">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm ${statusClasses}`}>
                      {dateInfo.status}
                    </span>
                  </div>
                  {userRole === 'planner' && (
                    <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
                      <input
                        id={uploadInputId}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        aria-label={`Upload cover photo for ${item.coupleNames}`}
                        disabled={coverState.uploading}
                        onChange={(event) => void handleCoverUpload(event, item)}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={uploadInputId}
                        className={`inline-flex min-h-9 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/95 px-3 py-2 text-xs font-semibold text-[#172D26] shadow-sm transition-colors hover:bg-[#FBF0D4] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#075B46] ${coverState.uploading ? 'pointer-events-none opacity-60' : ''}`}
                      >
                        {coverState.uploading ? 'Saving photo…' : item.coverImagePath ? 'Replace photo' : 'Upload photo'}
                      </label>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate font-serif text-xl leading-snug text-[#172D26] md:text-2xl">{item.coupleNames}</h2>
                      <p className="mt-1 text-sm text-[#73796F]">{dateInfo.formattedDate}</p>
                    </div>
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-1 h-5 w-5 shrink-0 text-[#D4A843]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 2v4m10-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
                    </svg>
                  </div>

                  <p className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${countdownClasses}`}>
                    {dateInfo.countdown}
                  </p>

                  {coverState.error && (
                    <p role="alert" className="mt-3 rounded-lg border border-[#E9C7C5] bg-[#FFF8F7] px-3 py-2 text-xs leading-relaxed text-[#783B3A]">
                      {coverState.error}
                    </p>
                  )}
                  {coverState.notice && (
                    <p role="status" className="mt-3 rounded-lg border border-[#C8DDD0] bg-[#E2F0E8] px-3 py-2 text-xs text-[#315744]">
                      {coverState.notice}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEF0EC] pt-4">
                    {userRole === 'planner' && item.coverImagePath ? (
                      <button
                        type="button"
                        onClick={() => void handleCoverRemoval(item)}
                        disabled={coverState.uploading}
                        className="text-xs font-medium text-[#73796F] underline decoration-[#D8B9B6] underline-offset-4 transition-colors hover:text-[#783B3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075B46] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove photo
                      </button>
                    ) : (
                      <span aria-hidden="true" />
                    )}
                    <Link
                      to={`/dashboard/${item.id}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#075B46] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#064C3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2"
                    >
                      Open Wedding
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};