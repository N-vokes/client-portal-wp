import React, { useState } from 'react';
import { useWedding } from '../contexts/WeddingContext';
import { useToast } from '../contexts/ToastContext';
import { ContractVaultSkeleton } from '../components/Skeleton';
import { validators, getErrorMessage } from '../utils/validation';

interface ContractVaultProps {
  userRole: 'planner' | 'couple';
}

export const ContractVault: React.FC<ContractVaultProps> = ({ userRole }) => {
  const { contracts, deleteContract, loading } = useWedding();
  const { addToast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        await deleteContract(id);
        addToast('Contract deleted successfully', 'success');
      } catch (error) {
        addToast(getErrorMessage(error), 'error');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationErrors = validators.validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    });

    if (validationErrors.length > 0) {
      addToast(validationErrors[0].message, 'error');
      return;
    }

    try {
      setUploading(true);
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addToast('Contract uploaded successfully', 'success');
      event.target.value = ''; // Reset file input
    } catch (error) {
      addToast(getErrorMessage(error), 'error');
    } finally {
      setUploading(false);
    }
  };

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
            <p className="text-4xl font-serif text-charcoal mb-2">6</p>
            <p className="text-slate">All Signed ✓</p>
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
                      onClick={() => window.open(contract.fileUrl, '_blank')}
                      className="flex-1 btn-secondary text-xs"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = contract.fileUrl;
                        link.download = contract.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
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
            <div className="col-span-3 py-20 text-center">
              <div className="inline-block mb-6">
                <p className="text-6xl mb-4">📄</p>
              </div>
              <h3 className="text-2xl font-serif text-charcoal mb-3">No Contracts Yet</h3>
              <p className="text-slate max-w-md mx-auto mb-8">
                {userRole === 'planner'
                  ? 'Start building your vendor agreement library. Upload the first contract to establish a complete record of all commitments.'
                  : 'Your planner will upload vendor contracts here. Each agreement will be stored securely and accessible anytime.'}
              </p>
              {userRole === 'planner' && (
                <button className="btn-primary">📤 Upload First Contract</button>
              )}
              {userRole === 'couple' && (
                <p className="text-xs text-slate italic">📧 Contracts will appear here as your planner uploads them</p>
              )}
            </div>
          )}
        </div>

        {/* Upload Section */}
        {userRole === 'planner' && (
          <div className="card border-2 border-dashed border-gold/50 text-center py-16 hover:border-gold transition-colors">
            <p className="text-4xl mb-4">📤</p>
            <h3 className="text-xl font-serif text-charcoal mb-2">Upload New Contract</h3>
            <p className="text-slate mb-6">Drag and drop a PDF or click to browse</p>
            <label className="inline-block">
              <input
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
