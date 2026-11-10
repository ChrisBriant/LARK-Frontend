import React, { useState, useEffect } from 'react';
import { LDAPOUCreate, LDAPOU } from '../../types/ldap';
import { FolderPlus, X, Folder } from 'lucide-react';

interface OUModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LDAPOUCreate) => Promise<void>;
  defaultParentDn?: string;
  allOus?: LDAPOU[];
  baseDn?: string;
}

export const OUModal: React.FC<OUModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultParentDn,
  allOus = [],
  baseDn = 'dc=neuropunk',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentDn, setParentDn] = useState(defaultParentDn || baseDn);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName('');
    setDescription('');
    setParentDn(defaultParentDn || baseDn);
    setError(null);
  }, [isOpen, defaultParentDn, baseDn]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('OU name is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        parent_dn: parentDn.trim() || null,
        object_classes: ['top', 'organizationalUnit'],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create organizational unit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <FolderPlus className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Create Organizational Unit (OU)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Parent Placement DN
            </label>
            <select
              value={parentDn}
              onChange={(e) => setParentDn(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            >
              <option value={baseDn}>{baseDn} (Root Base)</option>
              {allOus.map((ou) => (
                <option key={ou.dn} value={ou.dn}>
                  {ou.ou} ({ou.dn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              OU Name (ou) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="e.g. Contractors, Staging, Finance"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. External Contractor Accounts"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-mono">
            New DN: <span className="font-bold text-slate-800">ou={name || '<name>'},{parentDn}</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create OU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
