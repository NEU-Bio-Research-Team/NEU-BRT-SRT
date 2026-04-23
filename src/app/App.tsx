import { useEffect, useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Members from './components/Members';
import Contact from './components/Contact';
import News from './components/News';
import Login from './components/Login';
import BlogDetail from './components/BlogDetail';
import Publications from './components/Publications';
import { fetchLab, fetchNewsDetail, formatDateForCard } from './lib/api';
import type { LabInfo, NewsItem, PageType } from './lib/types';

type NavigationPage = Exclude<PageType, 'blog-detail'>;

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [currentBlogDetail, setCurrentBlogDetail] = useState<string | null>(null);
  const [currentNewsDetail, setCurrentNewsDetail] = useState<NewsItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [lastPageBeforeDetail, setLastPageBeforeDetail] = useState<NavigationPage>('home');
  const [lab, setLab] = useState<LabInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchLab()
      .then((labInfo) => {
        if (!mounted) return;
        setLab(labInfo);
      })
      .catch(() => {
        // silent fallback to default footer
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigateToDetail = async (detailId: string) => {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setCurrentBlogDetail(detailId);
      setLastPageBeforeDetail(currentPage);
      const detail = await fetchNewsDetail(detailId);
      setCurrentNewsDetail(detail);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : 'Failed to load article detail');
      setCurrentNewsDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBackFromDetail = () => {
    setCurrentBlogDetail(null);
    setCurrentNewsDetail(null);
    setDetailError(null);
    setCurrentPage(lastPageBeforeDetail);
  };

  if (currentPage === 'login') {
    return <Login onBack={() => setCurrentPage('home')} />;
  }

  if (currentBlogDetail) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          currentPage={lastPageBeforeDetail}
          onNavigate={(page) => {
            setCurrentBlogDetail(null);
            setCurrentNewsDetail(null);
            setDetailError(null);
            setCurrentPage(page);
          }}
        />
        {detailLoading && <div className="max-w-[1200px] mx-auto px-4 md:px-20 py-12 text-gray-500">Loading article...</div>}
        {detailError && <div className="max-w-[1200px] mx-auto px-4 md:px-20 py-12 text-red-600">{detailError}</div>}
        {!detailLoading && !detailError && currentNewsDetail && (
          <BlogDetail
            category={currentNewsDetail.category}
            title={currentNewsDetail.title}
            date={formatDateForCard(currentNewsDetail.date)}
            author={currentNewsDetail.author || 'Admin'}
            content={currentNewsDetail.body}
            onBack={handleBackFromDetail}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="w-full">
        {currentPage === 'home' && <Home onNavigateToDetail={handleNavigateToDetail} />}
        {currentPage === 'news' && <News onNavigateToDetail={handleNavigateToDetail} />}
        {currentPage === 'publications' && <Publications />}
        {currentPage === 'members' && <Members />}
        {currentPage === 'contact' && <Contact />}
      </main>

      <footer className="w-full border-t border-black py-8 px-4 md:px-20">
        <div className="max-w-[1728px] mx-auto flex justify-between items-center">
          <p className="font-['Athiti:SemiBold',sans-serif] text-xl">Contact Us</p>
          <a href={`mailto:${lab?.email || 'brt-srt@neu.edu.vn'}`} className="font-['Athiti:SemiBold',sans-serif] text-xl hover:text-blue-600 transition">
            {lab?.email || 'brt-srt@neu.edu.vn'}
          </a>
        </div>
      </footer>
    </div>
  );
}
