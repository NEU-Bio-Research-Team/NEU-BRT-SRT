import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface BlogCardProps {
  title: string;
  content: string;
  date: string;
  thumbnail: string;
  onClick: () => void;
}

export default function BlogCard({ title, content, date, thumbnail, onClick }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-[#f5f5f5] rounded-[33px] p-8 flex flex-col cursor-pointer transition-all duration-300 ${
        isHovered
          ? 'shadow-xl -translate-y-2 border-2 border-blue-400'
          : 'shadow-md border-2 border-transparent'
      }`}
    >
      <h2 className="font-['Athiti:SemiBold',sans-serif] text-3xl text-center mb-6">
        {title}
      </h2>

      <div className="bg-white rounded-[24px] overflow-hidden mb-4">
        <div className="aspect-video w-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 flex-grow mb-4">
        <div className="font-['Athiti:Regular','Noto_Sans_KR:Regular',sans-serif] text-lg space-y-3">
          <p className="text-gray-700 line-clamp-4 leading-relaxed">
            {content}
          </p>
          <p className="text-gray-500 text-sm mt-4">{date}</p>
        </div>
      </div>

      <div
        className={`flex items-center justify-center gap-2 text-blue-600 font-['Athiti:Medium',sans-serif] transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <span>Read More</span>
        <ArrowRight className="w-5 h-5" />
      </div>
    </div>
  );
}
