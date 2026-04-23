import { useState } from 'react';
import imgMoreThan from 'figma:asset/88db0889b8ac6bd76f170bc8b763ba188896d6e8.png';
import type { PageType } from '../lib/types';

interface HeaderProps {
  currentPage: Exclude<PageType, 'blog-detail'>;
  onNavigate: (page: Exclude<PageType, 'blog-detail'>) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [showPublicationsDropdown, setShowPublicationsDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const NavPill = ({
    label,
    page,
    hasDropdown = false,
  }: {
    label: string;
    page: Exclude<PageType, 'blog-detail'>;
    hasDropdown?: boolean;
  }) => {
    const isActive = currentPage === page;

    return (
      <button
        onClick={() => {
          if (!hasDropdown) {
            onNavigate(page);
            setShowMobileMenu(false);
            setShowPublicationsDropdown(false);
          } else {
            setShowPublicationsDropdown(!showPublicationsDropdown);
          }
        }}
        className={`relative px-4 py-2 rounded-full border border-black transition-all duration-200 ${
          isActive
            ? 'bg-white text-[#059669] shadow-md'
            : 'bg-white text-black hover:bg-gray-100 hover:shadow-sm'
        }`}
      >
        <span className="font-['Athiti:Medium',sans-serif] text-sm md:text-base whitespace-nowrap">{label}</span>
        {hasDropdown && (
          <img
            src={imgMoreThan}
            alt=""
            className={`inline-block w-4 h-4 ml-1 transition-transform ${showPublicationsDropdown ? 'rotate-270' : 'rotate-90'}`}
          />
        )}
      </button>
    );
  };

  return (
    <header className="w-full bg-[#e9e9e9] rounded-b-[33px] sticky top-0 z-50">
      <div className="max-w-[1728px] mx-auto px-4 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center -my-2"
          aria-label="Bio Lab Home"
        >
          <img
            src="/assets/images/bio-lab-logo.png"
            alt="Bio Lab Logo"
            className="h-24 md:h-24 w-auto max-w-none object-contain"
          />
        </button>

        <button className="md:hidden p-2" onClick={() => setShowMobileMenu(!showMobileMenu)}>
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black mb-1"></div>
          <div className="w-6 h-0.5 bg-black"></div>
        </button>

        <nav
          className={`
          ${showMobileMenu ? 'flex' : 'hidden'}
          md:flex
          absolute md:relative
          top-full md:top-0
          left-0 md:left-auto
          w-full md:w-auto
          bg-[#e9e9e9] md:bg-transparent
          flex-col md:flex-row
          gap-3 md:gap-4
          p-4 md:p-0
          rounded-b-[33px] md:rounded-none
        `}
        >
          <NavPill label="NEWS" page="news" />

          <div className="relative">
            <NavPill label="PUBLICATIONS" page="publications" hasDropdown />
            {showPublicationsDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                <button
                  onClick={() => {
                    onNavigate('publications');
                    setShowPublicationsDropdown(false);
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-5 py-2.5 hover:bg-gray-50 font-['Athiti:Regular',sans-serif] text-sm transition-colors duration-150"
                >
                  Papers
                </button>
              </div>
            )}
          </div>

          <NavPill label="MEMBERS" page="members" />
          <NavPill label="CONTACT" page="contact" />

          <button
            onClick={() => {
              onNavigate('login');
              setShowMobileMenu(false);
            }}
            className="px-4 py-2 rounded-full border border-[#2563eb] bg-[#2563eb] text-white transition-all duration-200 hover:bg-[#1d4ed8] hover:shadow-md"
          >
            <span className="font-['Athiti:Medium',sans-serif] text-sm md:text-base">LOGIN</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
