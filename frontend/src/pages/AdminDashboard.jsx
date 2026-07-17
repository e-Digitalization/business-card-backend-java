import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const emptyCard = {
  slug: '',
  fullName: '',
  title: '',
  company: '',
  location: '',
  phone: '',
  email: '',
  website: '',
  whatsapp: '',
  photoUrl: '',
  linkedin: '',
  twitter: '',
  github: '',
  active: true
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [form, setForm] = useState(emptyCard);
  const [tagCode, setTagCode] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = useMemo(
    () => [
      { id: 'cards', label: 'Card List', icon: 'badge' },
      { id: 'create', label: 'Create Card', icon: 'add_circle' },
      { id: 'update', label: 'Update Card', icon: 'edit_square' },
      { id: 'tags', label: 'Tag Management', icon: 'nfc' }
    ],
    []
  );

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/cards');
      setCards(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login', { state: { role: 'admin' } });
  };

  const handleSelect = (cardResponse) => {
    setSelectedCardId(cardResponse.card.id);
    setForm({
      slug: cardResponse.card.slug || '',
      fullName: cardResponse.card.fullName || '',
      title: cardResponse.card.title || '',
      company: cardResponse.card.company || '',
      location: cardResponse.card.location || '',
      phone: cardResponse.card.phone || '',
      email: cardResponse.card.email || '',
      website: cardResponse.card.website || '',
      whatsapp: cardResponse.card.whatsapp || '',
      photoUrl: cardResponse.card.photoUrl || '',
      linkedin: cardResponse.card.linkedin || '',
      twitter: cardResponse.card.twitter || '',
      github: cardResponse.card.github || '',
      active: cardResponse.card.active
    });
    setActionMessage('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/api/admin/cards', form);
      setActionMessage(`Created card ${response.data.slug}.`);
      setForm(emptyCard);
      setSelectedCardId(null);
      await fetchCards();
    } catch (err) {
      setActionMessage('Failed to create card.');
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selectedCardId) {
      setActionMessage('Select a card to update.');
      return;
    }
    try {
      await api.put(`/api/admin/cards/${selectedCardId}`, form);
      setActionMessage('Card updated.');
      await fetchCards();
    } catch (err) {
      setActionMessage('Failed to update card.');
    }
  };

  const handleAssignTag = async (event) => {
    event.preventDefault();
    if (!selectedCardId) {
      setActionMessage('Select a card before assigning a tag.');
      return;
    }
    try {
      await api.post(`/api/admin/cards/${selectedCardId}/tag`, { tagCode });
      setActionMessage('Tag assigned.');
      setTagCode('');
      await fetchCards();
    } catch (err) {
      setActionMessage('Failed to assign tag.');
    }
  };

  const handleDeactivateTag = async (tagId) => {
    try {
      await api.put(`/api/admin/tags/${tagId}/deactivate`);
      setActionMessage('Tag deactivated.');
      await fetchCards();
    } catch (err) {
      setActionMessage('Failed to deactivate tag.');
    }
  };

  const cardFields = [
    { label: 'Slug', name: 'slug' },
    { label: 'Full Name', name: 'fullName' },
    { label: 'Title', name: 'title' },
    { label: 'Company', name: 'company' },
    { label: 'Location', name: 'location' },
    { label: 'Phone(s) (comma separated)', name: 'phone' },
    { label: 'Email', name: 'email' },
    { label: 'Website', name: 'website' },
    { label: 'WhatsApp', name: 'whatsapp' },
    { label: 'Photo URL', name: 'photoUrl' },
    { label: 'LinkedIn', name: 'linkedin' },
    { label: 'Twitter', name: 'twitter' },
    { label: 'GitHub', name: 'github' }
  ];

  return (
    <div className="min-h-screen sdt-page text-slate-900 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 gradient-ring opacity-70" />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Close menu overlay"
        />
      )}

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={[
            'fixed lg:static z-50 lg:z-auto inset-y-0 left-0',
            'bg-slate-900 text-white shadow-2xl',
            'transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            sidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
            'w-72'
          ].join(' ')}
        >
          <div className="h-full flex flex-col p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-sdtBlue/30 flex items-center justify-center text-sm font-bold shrink-0">
                  SDT
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate">SDT Admin</div>
                    <p className="text-xs text-slate-300 truncate">Cards + NFC management</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden rounded-xl p-2 hover:bg-white/10"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {!sidebarCollapsed && (
              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                <div className="h-12 w-12 rounded-full bg-white/20" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">Admin</div>
                  <div className="text-xs text-slate-300 truncate">admin@swahili.systems</div>
                </div>
              </div>
            )}

            <nav className="mt-6 space-y-2 text-sm">
              {!sidebarCollapsed && (
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Dashboards</p>
              )}
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    'flex items-center gap-3 rounded-xl px-4 py-2 hover:bg-white/10',
                    item.id === 'cards' ? 'bg-white/10 font-semibold' : ''
                  ].join(' ')}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="material-symbols-rounded">{item.icon}</span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </a>
              ))}
            </nav>

            <div className="mt-auto space-y-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm"
              >
                <span className="material-symbols-rounded">
                  {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
              <button
                onClick={handleLogout}
                className="w-full border border-white/20 px-4 py-2 rounded-xl text-sm"
              >
                {!sidebarCollapsed ? 'Log out' : <span className="material-symbols-rounded">logout</span>}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10 space-y-8 lg:ml-0">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden glass-card rounded-xl px-3 py-2 flex items-center gap-2"
            >
              <span className="material-symbols-rounded">menu</span>
              <span className="text-sm font-semibold">Menu</span>
            </button>
            <div className="hidden lg:block" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-300">
                Manage digital card profiles and RFID tags.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="lg:hidden border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg text-sm"
            >
              Log out
            </button>
          </div>

          {(error || actionMessage) && (
            <div className="glass-card rounded-2xl p-4 text-sm">
              {error && <p className="text-rose-500">{error}</p>}
              {actionMessage && <p className="text-emerald-500">{actionMessage}</p>}
            </div>
          )}

          <section id="cards" className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Card List</h2>
              <span className="text-xs text-slate-500 dark:text-slate-300">{cards.length} cards</span>
            </div>
            {loading ? (
              <p className="text-slate-500 dark:text-slate-300 mt-4">Loading cards...</p>
            ) : (
              <div className="overflow-auto mt-4">
                <table className="min-w-full text-sm">
                  <thead className="text-slate-500 dark:text-slate-300">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Slug</th>
                      <th className="text-left p-2">Organisation</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Active</th>
                      <th className="text-left p-2">Tags</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((item) => (
                      <tr key={item.card.id} className="border-t border-slate-200/70 dark:border-white/10">
                        <td className="p-2">{item.card.fullName || '-'}</td>
                        <td className="p-2">{item.card.slug}</td>
                        <td className="p-2">{item.card.company || '-'}</td>
                        <td className="p-2">{item.card.phone || '-'}</td>
                        <td className="p-2">{item.card.email || '-'}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              item.card.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {item.card.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex flex-col gap-2">
                            {item.tags.length === 0 && (
                              <span className="text-slate-500 dark:text-slate-400">No tags</span>
                            )}
                            {item.tags.map((tag) => (
                              <div key={tag.id} className="flex items-center gap-2">
                                <span className={`text-xs ${tag.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  {tag.tagCode}
                                </span>
                                {tag.active && (
                                  <button
                                    className="text-xs text-rose-400"
                                    onClick={() => handleDeactivateTag(tag.id)}
                                  >
                                    Deactivate
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleSelect(item)}
                            className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-white/10"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="grid lg:grid-cols-2 gap-6">
            <form id="create" onSubmit={handleCreate} className="glass-card rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Create Card</h2>
              {cardFields.map((field) => (
                <div key={field.name}>
                  <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1">{field.label}</label>
                  <input
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />
                Active
              </label>
              <button className="w-full bg-sdtBlue text-white py-2 rounded-lg font-semibold">
                Create Card
              </button>
            </form>

            <div className="space-y-6">
              <form id="update" onSubmit={handleUpdate} className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">Update Selected Card</h2>
                {cardFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1">{field.label}</label>
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full rounded-lg bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />
                  Active
                </label>
                <button className="w-full border border-slate-200 dark:border-white/10 py-2 rounded-lg">
                  Update Card
                </button>
              </form>

              <form id="tags" onSubmit={handleAssignTag} className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold">Assign Tag Code</h2>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1">Tag Code</label>
                  <input
                    value={tagCode}
                    onChange={(event) => setTagCode(event.target.value)}
                    className="w-full rounded-lg bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <button className="w-full border border-slate-200 dark:border-white/10 py-2 rounded-lg">
                  Assign Tag
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
