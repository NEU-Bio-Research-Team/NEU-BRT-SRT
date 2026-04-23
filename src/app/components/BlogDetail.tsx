import { ArrowLeft, Calendar, User } from 'lucide-react';

interface BlogDetailProps {
  category?: string;
  title: string;
  date: string;
  author: string;
  image?: string;
  content: string;
  onBack: () => void;
}

export default function BlogDetail({ category, title, date, author, image, content, onBack }: BlogDetailProps) {
  return (
    <div className="w-full px-4 md:px-20 py-12 max-w-[1200px] mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-['Athiti:Medium',sans-serif]">Back to Home</span>
      </button>

      <article className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {image && (
          <div className="aspect-video w-full bg-gray-200 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8 md:p-12">
          {category && (
            <span className="inline-flex mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 uppercase tracking-wider">
              {category}
            </span>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{author}</span>
            </div>
          </div>

          <h1 className="font-['Athiti:Bold',sans-serif] text-4xl md:text-5xl mb-8 leading-tight">
            {title}
          </h1>

          <div className="prose prose-lg max-w-none">
            <div className="font-['Athiti:Regular','Noto_Sans_KR:Regular',sans-serif] text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-['Athiti:SemiBold',sans-serif] text-2xl mb-4">
              Share this article
            </h3>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Share
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
