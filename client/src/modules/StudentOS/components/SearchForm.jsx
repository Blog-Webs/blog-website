import { Search } from 'lucide-react';

const SearchForm = ({ search, setSearch, handleSearch, handleReset, searching, placeholder }) => {
  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Search size={15} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder || "Search..."}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--text)' }}
        />
      </div>
      <button type="submit" disabled={searching}
        className="px-4 py-2.5 rounded-xl text-sm font-medium btn-press"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}>
        {searching ? '...' : 'Search'}
      </button>
      {search && (
        <button type="button" onClick={handleReset}
          className="px-4 py-2.5 rounded-xl text-sm border btn-press"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          Reset
        </button>
      )}
    </form>
  );
};

export default SearchForm;
