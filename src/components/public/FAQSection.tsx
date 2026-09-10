import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';

export const FAQSection: React.FC = () => {
  const { manual } = useStore();

  const defaultFaqs = [
    {
      id: 'faq-1',
      question: 'What is KitchEase?',
      answer:
        'KitchEase is an authentic 2-in-1 kitchen oil bottle designed for both controlled pouring and fine atomized spraying. Made with high-grade thermal borosilicate glass and food-safe BPA-free materials, it helps you cook with better oil control and zero chemical propellants.',
    },
    {
      id: 'faq-2',
      question: 'How does the spray function work?',
      answer:
        'A firm, decisive press of the top ergonomic lever pressurizes the mechanical pump chamber to create a wide, ultra-fine mist. It requires no batteries and no chemical aerosol propellants, making it ideal for air fryers, roasting vegetables, and coating skillets.',
    },
    {
      id: 'faq-3',
      question: 'How does the pouring function work?',
      answer:
        'Simply tilt the bottle over your pan or bowl. The gravity-assisted pour valve automatically opens to release a smooth, measured drizzle. The anti-drip rim prevents oily runs down the side of the carafe.',
    },
    {
      id: 'faq-4',
      question: 'What type of oil can I use?',
      answer:
        'KitchEase works seamlessly with any standard cooking oil, including olive oil, avocado oil, canola, vegetable, sesame, and sunflower oil. Avoid viscous liquids with heavy sediment or whole herb particles that could obstruct the fine nozzle.',
    },
    {
      id: 'faq-5',
      question: 'How do I clean it?',
      answer:
        'All components twist apart in seconds. For regular maintenance, add warm water and a drop of dish soap to the glass bottle, use the included flexible bottle brush, and pump warm soapy water through the nozzle 4–5 times to flush the valve. Rinse thoroughly with clear water and air dry.',
    },
    {
      id: 'faq-6',
      question: 'How do I place an order?',
      answer:
        'Click "BUY NOW" anywhere on the website, select your desired quantity, enter your delivery address and contact details on our simple checkout form, and confirm your order. You will receive an instant order receipt and tracking link.',
    },
    {
      id: 'faq-7',
      question: 'How long does delivery take?',
      answer:
        'Orders are processed within 24 hours. Standard domestic shipping takes 2 to 4 business days with direct tracking. We offer free shipping on all orders.',
    },
    {
      id: 'faq-8',
      question: 'What is your return/refund policy?',
      answer:
        'We offer a 30-day no-hassle money-back guarantee and a 1-year manufacturer warranty. If you are not completely satisfied with your KitchEase bottle, contact our support team at support@kitchease.com for an immediate replacement or refund.',
    },
  ];

  const faqs = manual?.faqs && manual.faqs.length > 0 ? manual.faqs : defaultFaqs;
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || 'faq-1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-white border-b border-stone-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#2A4B3C]" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-stone-600 text-base font-light">
            Answers to common questions about using, cleaning, shipping, and ordering KitchEase.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions (e.g. spray, cleaning, shipping)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 bg-[#FAF8F5] text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#2A4B3C] focus:bg-white shadow-xs transition-colors"
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
                className="rounded-2xl border border-stone-200/90 bg-[#FAF8F5] overflow-hidden transition-all duration-200 hover:border-stone-300 shadow-xs"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-sm sm:text-base text-stone-900">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-700 flex-shrink-0 shadow-2xs">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 pt-4 animate-in fade-in duration-200 font-light">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="p-8 text-center bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-500 text-sm font-light">
              No questions found matching "{searchQuery}". Check our user manual or contact our team directly at support@kitchease.com.
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
