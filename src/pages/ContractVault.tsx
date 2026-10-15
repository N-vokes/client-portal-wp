import React, { useRef, useState } from 'react';
import { useWedding } from '../contexts/useWedding';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/PageLoader';
import { usePlannerActions } from '../domain/plannerActions';
import { useToast } from '../contexts/useToast';
import { ContractVaultSkeleton } from '../components/Skeleton';
import { validators, getErrorMessage } from '../utils/validation';
import { EmptyState, ErrorState } from '../components/StateCards';
import { db } from '../lib/supabase';
import type { Contract } from '../types';

export const ContractVault: React.FC = () => {
  const { contracts, loading, wedding, addContract, refreshData } = useWedding();
  const { executePlannerAction } = usePlannerActions();
  const { addToast } = useToast();
  const { userRole } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorType, setVendorType] = useState<Contract['vendorType']>('other');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const vendorTypes = [
    { id: 'all', label: 'All Vendors', icon: '📋' },
    { id: 'caterer', label: 'Caterer', icon: '🍽️' },
    { id: 'photographer', label: 'Photographer', icon: '📸' },
    { id: 'florist', label: 'Florist', icon: '🌹' },
    { id: 'venue', label: 'Venue', icon: '🏛️' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'other', label: 'Other', icon: '📦' },
  ];

  const vendorIcons: Record<string, string> = {
    caterer: '🍽️',
    photographer: '📸',
    florist: '🌹',
    venue: '🏛️',
    music: '🎵',
    other: '📦',
  };

  const filteredContracts = 
    selectedType === 'all'
      ? contracts
      : contracts.filter((contract) => contract.vendorType === selectedType);

  const totalAmount = filteredContracts.reduce((sum, contract) => sum + (contract.amount || 0), 0);
  const storedFileCount = filteredContracts.filter(
    (contract) => contract.fileUrl && contract.fileUrl !== 'pending-upload'
  ).length;

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await executePlannerAction({ type: 'DELETE_CONTRACT', id });
        addToast('Contract deleted successfully', 'success');
      } catch (error) {
        addToast(getErrorMessage(error), 'error');
      }
    }
  };

  const handleOpenContract = async (contract: Contract, download = false) => {
    if (!contract.fileUrl || contract.fileUrl === 'pending-upload') {
      addToast('This contract does not have an uploaded file yet.', 'error');
      return;
    }

    const fileWindow = window.open('about:blank', '_blank');
    if (fileWindow) fileWindow.opener = null;

    try {
      const signedUrl = await db.getContractSignedUrl(
        contract.fileUrl,
        download ? contract.fileName : undefined
      );

      if (!fileWindow) {
        addToast('Please allow pop-ups to open this contract.', 'error');
        return;
      }

      fileWindow.location.href = signedUrl;
    } catch (error) {
      fileWindow?.close();
      addToast(getErrorMessage(error), 'error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const trimmedVendorName = vendorName.trim();
    if (!wedding?.id) {
      const message = 'No active wedding workspace is selected.';
      setUploadError(message);
      addToast(message, 'error');
      event.target.value = '';
      return;
    }

    if (!trimmedVendorName) {
      const message = 'Enter the vendor name before choosing a contract file.';
      setUploadError(message);
      addToast(message, 'error');
      event.target.value = '';
      return;
    }

    const contractAmount = amount.trim() ? Number(amount) : undefined;
    if (contractAmount !== undefined && (!Number.isFinite(contractAmount) || contractAmount < 0)) {
      const message = 'Enter a valid contract amount or leave it blank.';
      setUploadError(message);
      addToast(message, 'error');
      event.target.value = '';
      return;
    }

    // Validate file
    const validationErrors = validators.validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (validationErrors.length > 0) {
      const message = validationErrors[0].message;
      setUploadError(message);
      addToast(message, 'error');
      event.target.value = '';
      return;
    }

    let uploadedFilePath: string | null = null;
    try {
      setUploading(true);
      setUploadError(null);
      uploadedFilePath = await db.uploadContractFile(wedding.id, file);
      await addContract({
        vendorName: trimmedVendorName,
        vendorType,
        fileName: file.name,
        fileUrl: uploadedFilePath,
        uploadedDate: new Date().toISOString(),
        amount: contractAmount,
        notes: notes.trim() || undefined,
      });
      uploadedFilePath = null;
      await refreshData();
      addToast('Contract uploaded successfully', 'success');
      setVendorName('');
      setVendorType('other');
      setAmount('');
      setNotes('');
      event.target.value = ''; // Reset file input
    } catch (error) {
      let message = getErrorMessage(error);
      if (uploadedFilePath) {
        try {
          await db.removeContractFile(uploadedFilePath);
        } catch (cleanupError) {
          console.error('Failed to remove contract file after database insert failure:', cleanupError);
          message += ' The uploaded file could not be removed automatically.';
        }
      }
      setUploadError(message);
      addToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Ensure hooks are always called before any early returns
  if (!userRole) return <PageLoader />;

  if (loading) {
    return <ContractVaultSkeleton userRole={userRole} />;
  }

  return (
    <div className="min-h-screen bg-cream page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-sand to-cream border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <h1 className="text-5xl font-serif text-charcoal mb-4">📄 Contract Vault</h1>
          <p className="text-lg text-slate max-w-3xl">
            All your vendor agreements in one secure, organized location. Easy access, complete transparency.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {uploadError && (
          <div className="mb-10">
            <ErrorState
              icon="⚠️"
              title="Upload failed"
              message={uploadError}
              actionLabel="Try again"
              onAction={() => fileInputRef.current?.click()}
            />
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <p className="text-4xl font-serif text-charcoal mb-2">{filteredContracts.length}</p>
            <p className="text-slate">Vendor Contracts</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-serif text-charcoal mb-2">${totalAmount.toLocaleString()}</p>
            <p className="text-slate">Total Contracted</p>
          </div>
          <div className="card text-center">
            <p className="text-4xl font-serif text-charcoal mb-2">{storedFileCount}</p>
            <p className="text-slate">Files Stored</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-12 flex flex-wrap gap-3">
          {vendorTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedType === type.id
                  ? 'bg-charcoal text-cream font-medium'
                  : 'bg-sand text-charcoal hover:bg-taupe'
              }`}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredContracts.length > 0 ? (
            filteredContracts.map((contract) => (
              <div key={contract.id} className="card group hover:border hover:border-gold">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{vendorIcons[contract.vendorType]}</div>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    ✓ Signed
                  </span>
                </div>

                <h3 className="font-serif text-lg text-charcoal mb-1">{contract.vendorName}</h3>
                <p className="text-xs text-slate mb-4 capitalize">{contract.vendorType}</p>

                {contract.amount && (
                  <p className="text-2xl font-serif text-charcoal mb-4">${contract.amount.toLocaleString()}</p>
                )}

                <p className="text-sm text-slate mb-4 leading-relaxed">{contract.notes}</p>

                <div className="pt-4 border-t border-gold/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate">
                      📅 Uploaded: {new Date(contract.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleOpenContract(contract)}
                      className="flex-1 btn-secondary text-xs"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => void handleOpenContract(contract, true)}
                      className="flex-1 btn-secondary text-xs"
                    >
                      📥 Download
                    </button>
                    {userRole === 'planner' && (
                      <button
                        onClick={() => handleDelete(contract.id)}
                        className="flex-1 btn-secondary text-xs text-red-600 hover:text-red-700"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3">
              <EmptyState
                icon="📄"
                title="No contracts yet"
                message={
                  userRole === 'planner'
                    ? 'Start building your vendor agreement library. Upload the first contract to establish a complete record of all commitments.'
                    : 'Your planner will upload vendor contracts here. Each agreement will be stored securely and accessible anytime.'
                }
                actionLabel={userRole === 'planner' ? 'Upload first contract' : undefined}
                onAction={userRole === 'planner' ? () => fileInputRef.current?.click() : undefined}
                className="py-20"
              />
            </div>
          )}
        </div>

        {/* Upload Section */}
        {userRole === 'planner' && (
          <div className="card border-2 border-dashed border-gold/50 text-center py-16 hover:border-gold transition-colors">
            <p className="text-4xl mb-4">📤</p>
            <h3 className="text-xl font-serif text-charcoal mb-2">Upload New Contract</h3>
            <p className="text-slate mb-6">Drag and drop a PDF or click to browse</p>
            <div className="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-4 px-4 text-left sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal" htmlFor="contract-vendor-name">
                  Vendor name
                </label>
                <input
                  id="contract-vendor-name"
                  type="text"
                  value={vendorName}
                  onChange={(inputEvent) => setVendorName(inputEvent.target.value)}
                  maxLength={160}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal" htmlFor="contract-vendor-type">
                  Vendor type
                </label>
                <select
                  id="contract-vendor-type"
                  value={vendorType}
                  onChange={(inputEvent) => setVendorType(inputEvent.target.value as Contract['vendorType'])}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
                >
                  {vendorTypes.filter((type) => type.id !== 'all').map((type) => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal" htmlFor="contract-amount">
                  Amount (optional)
                </label>
                <input
                  id="contract-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(inputEvent) => setAmount(inputEvent.target.value)}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal" htmlFor="contract-notes">
                  Notes (optional)
                </label>
                <input
                  id="contract-notes"
                  type="text"
                  value={notes}
                  onChange={(inputEvent) => setNotes(inputEvent.target.value)}
                  maxLength={1000}
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:opacity-60"
                />
              </div>
            </div>
            <label className="inline-block">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <button
                onClick={(e) => (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.click()}
                disabled={uploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
            </label>
            <p className="text-xs text-slate mt-4">PDF, DOC, DOCX up to 10MB</p>
          </div>
        )}

        {/* Storage Information */}
        <div className="mt-12 bg-blush rounded-lg p-8">
          <h3 className="font-serif text-lg text-charcoal mb-3">🔒 Security & Storage</h3>
          <ul className="space-y-2 text-slate">
            <li>✓ All documents are encrypted and securely stored</li>
            <li>✓ Only authorized people can access your contracts</li>
            <li>✓ Automatic backup ensures you never lose important documents</li>
            <li>✓ Version history available for all edited documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
