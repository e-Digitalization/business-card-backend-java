import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const empty = {
  fullName: '',
  title: '',
  company: '',
  location: 'Dar es Salaam, Tanzania',
  phone: '+255 ',
  email: '',
  website: '',
  whatsapp: '+255',
  photoUrl: '',
  logoUrl: '',
  linkedin: '',
  twitter: '',
  github: '',
  active: true
};

const fields = [
  ['fullName', 'Full Name', 'Japhari Mbaru'],
  ['title', 'Title / Position', 'Founder'],
  ['company', 'Organisation', 'Swahili Systems'],
  ['location', 'Location', 'Dar es Salaam, Tanzania'],
  ['phone', 'Phone', '+255 714 076 404'],
  ['email', 'Email', 'name@company.co.tz'],
  ['website', 'Website', 'https://'],
  ['whatsapp', 'WhatsApp', '+255714076404'],
  ['photoUrl', 'Photo URL', 'https://...'],
  ['logoUrl', 'Logo URL', '/logos/swahili-systems.svg'],
  ['linkedin', 'LinkedIn', 'https://linkedin.com/in/...'],
  ['twitter', 'Twitter / X', 'https://x.com/...'],
  ['github', 'GitHub', 'https://github.com/...']
];

const AdminCreateCardPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/admin/cards', form);
      navigate('/admin/cards');
    } catch {
      setError('Could not create card. Check required fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <p className="text-sm text-[#1a3d42]/55">
        A private opaque link is generated automatically (not based on the person’s name).
      </p>

      <form onSubmit={onSubmit} className="admin-panel p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#1a3d42]/70">{label}</span>
              <input
                value={form[key]}
                onChange={onChange(key)}
                placeholder={placeholder}
                required={key === 'fullName'}
                className="admin-input"
              />
            </label>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            to="/admin/cards"
            className="rounded-md border border-black/10 px-4 py-2.5 text-sm font-medium text-[#1a3d42]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#9a6b45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#865c3b] disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCardPage;
