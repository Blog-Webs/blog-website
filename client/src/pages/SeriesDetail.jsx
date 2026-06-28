import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Clock, ArrowRight } from 'lucide-react';
import { seriesApi } from '../api/series';

const SeriesDetail = () => {
  const { slug } = useParams();
  const [series, setSeries] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    seriesApi
      .getBySlug(slug)
      .then(({ data }) => {
        setSeries(data.series);
        setPosts(data.posts);
        setError(null);
      })
      .catch(() => setError('Series not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-muted)' }}>Loading…</div>;
  if (error || !series) return <div className="max-w-3xl mx-auto px-4 py-20 text-center" style={{ color: 'var(--text-muted)' }}>{error}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Layers size={20} />
        </div>
        <div>
          <p className="text-xs font-mono-display uppercase" style={{ color: 'var(--accent)' }}>Series</p>
          <h1 className="text-2xl font-bold glow-title">{series.title}</h1>
        </div>
      </div>
      {series.description && <p className="mb-8" style={{ color: 'var(--text-muted)' }}>{series.description}</p>}

      <div className="flex flex-col gap-3">
        {posts.map((post, idx) => (
          <Link
            key={post._id}
            to={`/blog/${post.slug}`}
            className="group flex items-center gap-4 p-4 rounded-xl border card-hover"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono-display shrink-0"
              style={{ backgroundColor: 'var(--surface-raised)', color: 'var(--text-muted)' }}
            >
              {idx + 1}
            </span>
            {post.coverImage && (
              <img src={post.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{post.title}</p>
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                <Clock size={11} /> {post.readTimeMinutes} min read
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SeriesDetail;
