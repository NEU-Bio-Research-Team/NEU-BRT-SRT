import { useEffect, useState } from 'react';
import BlogCard from './BlogCard';
import { fetchLab, fetchNews, toShortPreview } from '../lib/api';
import type { LabInfo, NewsItem } from '../lib/types';

interface HomeProps {
  onNavigateToDetail?: (detailId: string) => void;
}

export default function Home({ onNavigateToDetail }: HomeProps) {
  const [lab, setLab] = useState<LabInfo | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [labInfo, news] = await Promise.all([
          fetchLab(),
          fetchNews({ page: 1, limit: 3 }),
        ]);

        if (!mounted) return;
        setLab(labInfo);
        setNewsItems(news.items);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load home data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const heroTitle = lab?.name || 'Bio Research Team';
  const heroDescription =
    lab?.research_areas?.length
      ? `Our research and projects span a broad range of topics, including ${lab.research_areas
          .map((area) => area.title)
          .join(', ')}.`
      : 'Our research and projects span a broad range of topics, including Medical AI, Emotional recognition, and deep learning-based methodologies.';

  return (
    <div className="w-full px-4 md:px-12 py-12 max-w-[1728px] mx-auto">
      <section className="bg-[#f5f5f5] rounded-[33px] p-8 md:p-16 mb-16">
        <h1 className="font-['Sora:ExtraBold',sans-serif] text-4xl md:text-6xl text-left md:pl-8 mb-8 tracking-[-0.02em] leading-[1.05] text-[#0f172a]">
          {heroTitle}
        </h1>
        <p className="font-['Athiti:Regular',sans-serif] text-xl md:text-2xl text-right max-w-2xl ml-auto">
          {heroDescription}
        </p>
      </section>

      {loading && (
        <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-500">Loading latest news...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-center">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {newsItems.map((item) => (
            <BlogCard
              key={item.id}
              title={item.category.toUpperCase()}
              content={toShortPreview(item.body)}
              date={item.date}
              thumbnail="https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              onClick={() => onNavigateToDetail?.(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
