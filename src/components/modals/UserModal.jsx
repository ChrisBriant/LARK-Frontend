import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSubmit, editUser, allOus = [] }) {
  const isEditing = Boolean(editUser);

  const [uid, setUid] = useState('');
  const [givenName, setGivenName] = useState('');
  const [sn, setSn] = useState('');
  const [cn, setCn] = useState('');
  const [mail, setMail] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('');
  const [selectedParentDn, setSelectedParentDn] = useState('ou=People,dc=neuropunk');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editUser) {
      setUid(editUser.uid || '');
      setGivenName(editUser.given_name || '');
      setSn(editUser.sn || '');
      setCn(editUser.cn || '');
      setMail(editUser.mail || '');
      setDepartment(editUser.department || '');
      setTitle(editUser.title || '');
    } else {
      setUid('');
      setGivenName('');
      setSn('');
      setCn('');
      setMail('');
      setDepartment('');
      setTitle('');
      if (allOus.length > 0) {
        setSelectedParentDn(allOus[0].dn);
      }
    }
    setError(null);
  }, [editUser, isOpen, allOus]);

  const handleGivenNameChange = (val) => {
    setGivenName(val);
    if (!isEditing) {
      setCn(`${val} ${sn}`.trim());
      if (val && sn) {
        setMail(`${val.toLowerCase()}.${sn.toLowerCase()}@neuropunk.org`);
      }
    }
  };

  const handleSnChange = (val) => {
    setSn(val);
    if (!isEditing) {
      setCn(`${givenName} ${val}`.trim());
      if (givenName && val) {
        setMail(`${givenName.toLowerCase()}.${val.toLowerCase()}@neuropunk.org`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEditing && !uid.trim()) {
      setError('UID is required');
      return;
    }
    if (!givenName.trim() || !sn.trim() || !cn.trim() || !mail.trim()) {
      setError('Given name, surname, full name (cn), and email are required');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit({
          uid: editUser.uid,
          updates: {
            cn: cn.trim(),
            given_name: givenName.trim(),
            sn: sn.trim(),
            mail: mail.trim(),
            department: department.trim() || null,
            title: title.trim() || null,
          },
        });
      } else {
        const computedDn = `uid=${uid.trim()},${selectedParentDn}`;
        await onSubmit({
          uid: uid.trim(),
          cn: cn.trim(),
          given_name: givenName.trim(),
          sn: sn.trim(),
          mail: mail.trim(),
          department: department.trim() || null,
          title: title.trim() || null,
          dn: computedDn,
          object_classes: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? `Edit User: ${editUser?.cn}` : 'Create New LDAP User'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update directory attributes' : 'Provision a new user in the directory'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent Organizational Unit (OU)
              </label>
              <select
                value={selectedParentDn}
                onChange={(e) => setSelectedParentDn(e.target.value)}
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              >
                {allOus.length > 0 ? (
                  allOus.map((ou) => (
                    <option key={ou.dn} value={ou.dn}>
                      {ou.ou} ({ou.dn})
                    </option>
                  ))
                ) : (
                  <option value="ou=People,dc=neuropunk">ou=People,dc=neuropunk</option>
                )}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User ID (uid) *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={uid}
                onChange={(e) => setUid(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="e.g. jdoe"
                className="w-full text-xs font-mono bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (mail) *
              </label>
              <input
                type="email"
                required
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="name@domain.org"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Given Name (First Name) *
              </label>
              <input
                type="text"
                required
                value={givenName}
                onChange={(e) => handleGivenNameChange(e.target.value)}
                placeholder="e.g. John"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Surname (Last Name) *
              </label>
              <input
                type="text"
                required
                value={sn}
                onChange={(e) => handleSnChange(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Common Name (cn / Full Name) *
            </label>
            <input
              type="text"
              required
              value={cn}
              onChange={(e) => setCn(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Developer"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
