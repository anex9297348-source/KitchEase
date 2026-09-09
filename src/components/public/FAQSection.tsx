import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const FAQSection: React.FC = () => {
  const { manual } = useStore();
  const [openId, setOpenId] = useState<string | null>(manual?.faqs[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = manual?.faqs || [];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-[#0F0F0F] border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#D4AF37]" />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">
              Got Questions?
            </span>
            <span className="h-px w-8 bg-[#D4AF37]" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-[#EAEAEA] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-white/50 text-base leading-relaxed font-light">
            Everything you need to know about operating, maintaining, and purchasing your KitchEase oil dispenser.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/15 bg-[#151515] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-white/10 bg-[#151515] overflow-hidden transition-colors hover:border-[#D4AF37]/50 shadow-md"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-sm sm:text-base text-[#EAEAEA]">
                    {faq.question}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] flex-shrink-0 shadow-sm">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/10 pt-3 animate-in fade-in duration-200 font-light">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center bg-[#151515] border border-white/10 rounded-xl text-white/50 text-sm font-light">
              No questions found matching "{searchQuery}". Contact our support team for personal help!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
