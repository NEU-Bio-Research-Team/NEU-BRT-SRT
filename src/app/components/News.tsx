import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchNews, formatDateForCard } from '../lib/api';
import type { NewsItem } from '../lib/types';

interface NewsProps {
  onNavigateToDetail?: (id: string) => void;
}

const PAGE_SIZE = 10;

function categoryBadgeClass(category: string) {
  const c = category.toLowerCase();
  if (c === 'awards' || c === 'award') return 'bg-amber-100 text-amber-700';
  if (c === 'publication') return 'bg-blue-100 text-blue-700';
  if (c === 'notice') return 'bg-indigo-100 text-indigo-700';
  if (c === 'event') return 'bg-violet-100 text-violet-700';
  return 'bg-gray-100 text-gray-600';
}

export default function News({ onNavigateToDetail }: NewsProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNews({
          page,
          limit: PAGE_SIZE,
          category: activeTab,
          q: searchTerm,
        });

        if (!mounted) return;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setTotal(data.total);
        setCategories(data.categories);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, page, searchTerm]);

  const hasMore = useMemo(() => page * PAGE_SIZE < total, [page, total]);

  const toDateParts = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return { day: '--', month: value };

    return {
      day: String(parsed.getDate()).padStart(2, '0'),
      month: parsed
        .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        .toUpperCase(),
    };
  };

  return (
    <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto">
      <span className="inline-flex px-4 py-2 rounded-full bg-[#efe5cf] text-[#c9941e] font-semibold text-lg mb-6">NEWS</span>
      <h1 className="font-['Athiti:Bold',sans-serif] text-5xl md:text-7xl mb-4">Lab News</h1>
      <div className="mb-10 text-2xl text-gray-400">{total} items</div>

      <div className="flex flex-col gap-5 mb-8">
        <div className="w-full md:w-fit p-1.5 rounded-full bg-gray-100 flex gap-1 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveTab(category);
                setPage(1);
              }}
              className={`px-6 py-2 rounded-full font-['Athiti:SemiBold',sans-serif] text-lg transition ${
                activeTab === category
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-3xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search title or content"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
        {loading && <div className="p-8 text-center text-gray-500">Loading news...</div>}
        {error && <div className="p-8 text-center text-red-600">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="p-12 text-center text-gray-400">No news items found for this filter.</div>
        )}

        {!loading &&
          !error &&
          items.map((item) => {
            const d = toDateParts(item.date);
            return (
              <button
                key={item.id}
                onClick={() => onNavigateToDetail?.(item.id)}
                className="w-full text-left bg-white border-b border-gray-100 p-6 hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-4xl font-bold text-gray-900 leading-none">{d.day}</div>
                    <div className="text-2xs text-gray-400 mt-1">{d.month}</div>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {item.pinned && (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600">
                          Pinned
                        </span>
                      )}
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryBadgeClass(
                          item.category,
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-['Athiti:SemiBold',sans-serif] text-2xl text-gray-900 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex gap-4 text-sm text-gray-400 mt-2">
                      <span>{item.author || 'Admin'}</span>
                      <span>{formatDateForCard(item.date)}</span>
                    </div>
                  </div>

                  <span className="text-slate-400 text-2xl pt-1">&gt;</span>
                </div>
              </button>
            );
          })}
      </div>

      {hasMore && !loading && !error && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-['Athiti:Regular',sans-serif] text-lg transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}