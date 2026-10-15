import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/PageLoader';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWedding } from '../contexts/useWedding';
import { db } from '../lib/supabase';
import type { ClientRecord } from '../types';

export const Clients: React.FC = () => {
  const { userRole } = useAuth();
  const { activeWeddingId } = useWedding();
  const { weddingId: routeWeddingId } = useParams<{ weddingId: string }>();
  const navigate = useNavigate();
  const currentWeddingId = routeWeddingId ?? activeWeddingId;

  const [client, setClient] = useState<ClientRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(currentWeddingId));
  const [error, setError] = useState<string | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [createClientError, setCreateClientError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'The Ever After Wedding Portal – Clients';
  }, []);

  useEffect(() => {
    const fetchClient = async () => {
      if (!currentWeddingId) {
        setClient(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const clientRecord = await db.getClientForWedding(currentWeddingId);
        setClient(clientRecord);
      } catch (err) {
        console.error('Failed to load client for wedding:', err);
        setClient(null);
        setError('We could not load this client right now. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [currentWeddingId]);

  const handleCreateClientProfile = async () => {
    if (!currentWeddingId) {
      setCreateClientError('This wedding is missing a valid ID. Please refresh and try again.');
      return;
    }

    if (client) {
      return;
    }

    if (creatingClient) {
      return;
    }

    setCreatingClient(true);
    setCreateClientError(null);

    try {
      const wedding = await db.getWedding(currentWeddingId);

      if (!wedding) {
        setCreateClientError('We could not load the wedding details needed to create the client profile.');
        return;
      }

      const coupleNames = typeof wedding.couple_names === 'string' ? wedding.couple_names.trim() : '';
      const weddingDate = typeof wedding.wedding_date === 'string' ? wedding.wedding_date : '';

      if (!coupleNames || !weddingDate) {
        setCreateClientError('This wedding is missing required information. Please update the wedding details before creating the client profile.');
        return;
      }

      const clientSeed = {
        weddingId: currentWeddingId,
        coupleNames,
        weddingDate,
      } as Parameters<typeof db.createClientForWedding>[0];

      const createdClient = await db.createClientForWedding(clientSeed);

      const refreshedClient = await db.getClientForWedding(currentWeddingId);

      if (!refreshedClient) {
        setCreateClientError('The client profile was created, but it could not be loaded yet. Please try again in a moment.');
        return;
      }

      setClient(refreshedClient);
      setError(null);
      setCreateClientError(null);
      navigate(`/dashboard/${currentWeddingId}/clients/${createdClient.id}`);
    } catch (err) {
      setCreateClientError('We could not create the client profile right now. Please try again in a moment.');
    } finally {
      setCreatingClient(false);
    }
  };

  if (!userRole) return <PageLoader />;

  if (userRole !== 'planner') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-charcoal mb-4">Access Restricted</h1>
          <p className="text-slate">This page is only available to wedding planners.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16 md:py-24">
          <h1 className="text-5xl font-serif text-charcoal mb-4">
            Your Clients 💍
          </h1>
          <p className="text-lg text-slate max-w-2xl leading-relaxed">
            Manage and track the progress of all your wedding clients in one elegant view.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-lg border border-gold/20 p-6 animate-pulse">
                <div className="h-5 bg-sand/60 rounded w-2/3 mb-4" />
                <div className="h-4 bg-sand/50 rounded w-1/2 mb-3" />
                <div className="h-4 bg-sand/50 rounded w-3/4 mb-3" />
                <div className="h-2 bg-sand/50 rounded w-full mb-2" />
                <div className="h-10 bg-sand/60 rounded mt-5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gold/20 p-8 text-center shadow-sm max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif text-charcoal mb-3">Unable to load this client</h2>
            <p className="text-slate">{error}</p>
          </div>
        ) : !client ? (
          <div className="bg-white rounded-lg border border-gold/20 p-8 text-center shadow-sm max-w-2xl mx-auto">
            <h2 className="text-2xl font-serif text-charcoal mb-3">No client record yet</h2>
            <p className="text-slate mb-5">
              This wedding does not have a client record yet.
            </p>

            {createClientError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {createClientError}
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateClientProfile}
              disabled={creatingClient || !currentWeddingId}
              className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingClient ? 'Creating Client Profile...' : 'Create Client Profile'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              key={client.id}
              to={currentWeddingId ? `/dashboard/${currentWeddingId}/clients/${client.id}` : '#'}
              className="bg-white rounded-lg shadow-sm border border-gold/20 p-6 hover:shadow-md transition-shadow no-underline block"
            >
              <h3 className="text-xl font-serif text-charcoal mb-2">{client.coupleNames}</h3>
              <p className="text-sm text-slate mb-1">
                <span className="font-medium">Wedding Date:</span>{' '}
                {new Date(client.weddingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm text-slate mb-3">
                <span className="font-medium">Ceremony Venue:</span>{' '}
                {client.ceremonyVenue || 'Not added yet'}
              </p>
              <p className="text-sm text-slate mb-4">
                <span className="font-medium">Planning Stage:</span>{' '}
                {client.planningStage || 'Not set yet'}
              </p>
              <div className="w-full bg-gold text-white px-4 py-2 rounded-md text-center hover:bg-gold/80 transition-colors font-medium">
                View Profile
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};