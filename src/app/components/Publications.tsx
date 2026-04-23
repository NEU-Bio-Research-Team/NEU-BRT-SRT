import { useEffect, useMemo, useState } from 'react';
import { Search, Copy } from 'lucide-react';
import { fetchPapers, paperDoiToHref } from '../lib/api';
import type { PaperItem } from '../lib/types';

const PAGE_SIZE = 8;

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PaperItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPapers({ page, limit: PAGE_SIZE, q: searchTerm });
        if (!mounted) return;
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setTotal(data.total);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load publications');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [page, searchTerm]);

  const hasMore = useMemo(() => page * PAGE_SIZE < total, [page, total]);

  const copyDoi = async (doi: string) => {
    if (!doi) return;
    await navigator.clipboard.writeText(doi);
  };

  return (
    <div className="w-full px-4 md:px-20 py-12 max-w-[1728px] mx-auto">
      <h1 className="font-['Athiti:Bold',sans-serif] text-5xl md:text-7xl mb-12">Publications</h1>

      <div className="relative w-full md:w-96 mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search title, author, venue..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 text-sm text-gray-500">Showing {items.length} / {total} publications</div>

      <div className="space-y-3">
        {loading && <div className="p-8 bg-white rounded-2xl border border-gray-200 text-gray-500">Loading publications...</div>}
        {error && <div className="p-8 bg-red-50 rounded-2xl border border-red-200 text-red-700">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="p-8 bg-white rounded-2xl border border-gray-200 text-gray-500">No publications found.</div>
        )}

        {!loading && !error && items.map((paper, index) => (
          <article key={paper.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 text-sm font-bold flex items-center justify-center">
                {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, '0')}
              </span>

              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {paperDoiToHref(paper.doi) ? (
                    <a href={paperDoiToHref(paper.doi)} target="_blank" rel="noreferrer" className="hover:text-blue-600">
                      {paper.title}
                    </a>
                  ) : (
                    paper.title
                  )}
                </h3>

                <p className="text-sm text-gray-600 mt-2">{paper.authors.join(', ')}</p>

                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">{paper.type}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{paper.venue}</span>
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">{paper.year}</span>
                </div>
              </div>

              {paper.doi && (
                <button
                  onClick={() => copyDoi(paper.doi)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center"
                  aria-label="Copy DOI"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </article>
        ))}
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
