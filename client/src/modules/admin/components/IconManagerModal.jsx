import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminApi } from '../api/admin';
import { blogApi } from '../../blog/api/blog';

const IconManagerModal = ({ isOpen, onClose, iconOptions, reloadIcons }) => {
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!label.trim()) {
      alert('Please enter a label for this icon first.');
      return;
    }
    setUploading(true);
    try {
      const { data: uploadData } = await blogApi.uploadImage(file);
      await adminApi.createIconOption({ label, iconUrl: uploadData.url });
      setLabel('');
      reloadIcons();
    } catch {
      alert('Icon upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this icon option?')) return;
    await adminApi.deleteIconOption(id);
    reloadIcons();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage Custom Icons</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg btn-press" style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Add New Icon</h3>
          <div className="flex gap-3 items-center">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. Next.js)"
              className="px-4 py-2.5 rounded-xl border text-sm outline-none flex-1 input-focus"
              style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !label.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', opacity: (!label.trim() || uploading) ? 0.6 : 1 }}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
              Upload
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Existing Custom Icons</h3>
          {iconOptions.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No custom icons uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
              {iconOptions.map((icon) => (
                <div key={icon._id} className="relative group rounded-xl border p-2 flex flex-col items-center gap-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-raised)' }}>
                  <img src={icon.iconUrl} alt={icon.label} className="w-8 h-8 object-contain" />
                  <p className="text-[10px] text-center w-full truncate" style={{ color: 'var(--text-muted)' }}>{icon.label}</p>
                  <button
                    onClick={() => handleDelete(icon._id)}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity btn-press shadow-md"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconManagerModal;
