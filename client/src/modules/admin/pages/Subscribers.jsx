import { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import { ListSkeleton } from '../../core/components/ui/Skeleton';
import { Download, Trash2, Plus, UserPlus, Search, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const PAGE_SIZE = 10;

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchSubscribers = () => {
    setLoading(true);
    adminApi
      .getSubscribers()
      .then(({ data }) => {
        setSubscribers(data.subscribers || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    setAdding(true);
    try {
      const { data } = await adminApi.addSubscriber(newEmail.trim());
      alert(data.message || 'Subscriber added successfully!');
      setNewEmail('');
      setIsAddModalOpen(false);
      fetchSubscribers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add subscriber.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id, email) => {
    if (!window.confirm(`Are you sure you want to remove subscriber "${email}"?`)) return;
    try {
      await adminApi.deleteSubscriber(id);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      fetchSubscribers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subscriber.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected subscriber(s)?`)) return;
    try {
      await adminApi.deleteSubscribersBatch(selectedIds);
      setSelectedIds([]);
      fetchSubscribers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete subscribers.');
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }
    const headers = ['Email,SubscribedAt\n'];
    const rows = subscribers.map((s) => `"${s.email}","${new Date(s.createdAt || s.subscribedAt).toISOString()}"\n`);
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter & Pagination
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / PAGE_SIZE));
  const currentSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === currentSubscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentSubscribers.map((s) => s._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isAllSelected = currentSubscribers.length > 0 && currentSubscribers.every((s) => selectedIds.includes(s._id));

  return (
    <div className="p-6 lg:p-10 w-full max-w-6xl mx-auto text-on-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Newsletter Subscribers</h1>
          <div className="flex items-center gap-2 text-[#8B949E] text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"></span>
            <span className="font-medium">{subscribers.length.toLocaleString()} Active Subscribers</span>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#4375FF] hover:bg-[#3460E0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#4375FF]/20 cursor-pointer"
        >
          <UserPlus size={16} />
          Add Subscriber
        </button>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search subscriber by email..."
            className="w-full bg-[#111113] border border-[#2D3342] text-sm text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-[#4375FF]"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-[#111113] border border-[#2D3342] hover:bg-[#161B22] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Download size={14} className="text-[#8B949E]" />
            Export CSV
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 bg-[#FF4C4C]/10 border border-[#FF4C4C]/20 hover:bg-[#FF4C4C]/20 text-[#FF4C4C] px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer animate-fade-in"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111113] border border-[#1C202B] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_1fr_80px] items-center px-6 py-4 border-b border-[#1C202B] bg-[#0E1015] text-[10px] font-bold text-[#8B949E] tracking-widest uppercase">
          <button onClick={toggleSelectAll} className="flex items-center justify-center h-4 w-4 rounded border border-[#4C5363] hover:border-white transition-colors">
            {isAllSelected && <Check size={12} className="text-[#4375FF]" />}
          </button>
          <div>Email Address</div>
          <div>Subscribed Date</div>
          <div className="text-right">Action</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-6"><ListSkeleton count={5} /></div>
        ) : currentSubscribers.length === 0 ? (
          <div className="p-12 text-center text-[#8B949E] text-sm">No subscribers found.</div>
        ) : (
          <div className="flex flex-col">
            {currentSubscribers.map((s, i) => {
              const isSelected = selectedIds.includes(s._id);
              return (
                <div
                  key={s._id}
                  className={`grid grid-cols-[40px_1fr_1fr_80px] items-center px-6 py-4 transition-colors ${
                    i !== currentSubscribers.length - 1 ? 'border-b border-[#1C202B]' : ''
                  } ${isSelected ? 'bg-[#1C202B]/50' : 'hover:bg-[#161B22]'}`}
                >
                  <button onClick={() => toggleSelect(s._id)} className="flex items-center justify-center h-4 w-4 rounded border border-[#4C5363] hover:border-[#4375FF] transition-colors">
                    {isSelected && <Check size={12} className="text-[#4375FF]" />}
                  </button>
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-[14px] font-semibold text-white truncate mb-0.5">{s.email}</span>
                    <span className="text-[11px] text-[#8B949E]">Status: Active Subscriber</span>
                  </div>
                  <div className="text-[13px] text-[#C9D1D9]">
                    {new Date(s.createdAt || s.subscribedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => handleDeleteSubscriber(s._id, s.email)}
                      className="p-1.5 text-[#8B949E] hover:text-[#FF4C4C] hover:bg-[#FF4C4C]/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Subscriber"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table Footer / Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#1C202B] bg-[#0E1015] flex items-center justify-between">
            <div className="text-xs text-[#8B949E] font-mono">
              Page {currentPage} of {totalPages} ({filteredSubscribers.length} total)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#1C202B] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white px-3 py-1 bg-[#1C202B] rounded-md font-mono">{currentPage}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg text-[#8B949E] hover:text-white hover:bg-[#1C202B] disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#111113] border border-[#1C202B] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-white mb-2 font-display">Add New Subscriber</h2>
            <p className="text-xs text-[#8B949E] mb-6">
              Manually subscribe an email address to receive website updates and blog newsletters.
            </p>

            <form onSubmit={handleAddSubscriber} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-[#8B949E] block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. subscriber@example.com"
                  className="w-full bg-[#0E1015] border border-[#2D3342] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#4375FF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-[#8B949E] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 bg-[#4375FF] hover:bg-[#3460E0] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#4375FF]/20 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscribers;
