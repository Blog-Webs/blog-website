import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import { getSearchHistory, addSearchHistory, removeSearchHistoryItem, clearSearchHistory } from '../components/search/SearchHistory';

export const useSearch = (debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ blogs: [], chapters: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  const cancelTokenRef = useRef(null);

  // Sync history on mount
  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const addToHistory = useCallback((q) => {
    addSearchHistory(q);
    setHistory(getSearchHistory());
  }, []);

  const removeFromHistory = useCallback((q) => {
    removeSearchHistoryItem(q);
    setHistory(getSearchHistory());
  }, []);

  const clearAllHistory = useCallback(() => {
    clearSearchHistory();
    setHistory([]);
  }, []);

  // Debounced API search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ blogs: [], chapters: [], topics: [] });
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(trimmed)}`);
        
        // Local fuzzy sort/filter or mapping could go here if needed, 
        // but the backend does full $text and regex search.
        // We will just populate the results directly.
        setResults(data || { blogs: [], chapters: [], topics: [] });
      } catch (err) {
        console.error('Search query failed:', err);
        setResults({ blogs: [], chapters: [], topics: [] });
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    history,
    addToHistory,
    removeFromHistory,
    clearAllHistory
  };
};
