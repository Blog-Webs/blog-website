const HISTORY_KEY = 'httptechnex_search_history';
const MAX_HISTORY = 5;

export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Failed to parse search history', e);
    return [];
  }
};

export const addSearchHistory = (query) => {
  if (!query || typeof query !== 'string') return;
  const cleanQuery = query.trim();
  if (cleanQuery.length === 0) return;

  try {
    const current = getSearchHistory();
    const updated = [cleanQuery, ...current.filter((item) => item.toLowerCase() !== cleanQuery.toLowerCase())];
    const sliced = updated.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sliced));
  } catch (e) {
    console.error('Failed to add to search history', e);
  }
};

export const removeSearchHistoryItem = (query) => {
  try {
    const current = getSearchHistory();
    const updated = current.filter((item) => item.toLowerCase() !== query.trim().toLowerCase());
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove search history item', e);
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear search history', e);
  }
};
