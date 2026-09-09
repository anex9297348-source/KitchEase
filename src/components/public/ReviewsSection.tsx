import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, Plus, ThumbsUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

export const ReviewsSection: React.FC = () => {
  const { reviews, refreshReviews } = useStore();
  const { user, openAuthModal } = useAuth();

  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10) / 10
      : 5.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await api.submitReview({
        userName: userName.trim() || user?.name || 'Verified Buyer',
        userEmail: user?.email,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });
      await refreshReviews();
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setModalOpen(false);
        setTitle('');
        setComment('');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="customer-reviews" className="py-16 sm:py-24 bg-[#0F0F0F] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-[#D4AF37]" />
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#D4AF37]">
                Real Cooks, Real Experiences
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-[#EAEAEA] mt-1 tracking-tight">
              Customer Reviews
            </h2>
          </div>

          <button
            onClick={() => {
              if (user) setUserName(user.name);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-md self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Aggregate Ratings Overview */}
        <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-12">
          {/* Big Rating Number */}
          <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
            <span className="font-display text-5xl sm:text-6xl font-normal text-[#EAEAEA]">
              {averageRating}
            </span>
            <div className="flex items-center justify-center md:justify-start gap-1 text-[#D4AF37] my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'fill-[#D4AF37]' : 'text-white/20'}`}
                />
              ))}
            </div>
            <p className="text-xs text-white/50 font-light">
              Based on {reviews.length} verified culinary customer reviews
            </p>
          </div>

          {/* Quick Feature Endorsements */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block text-sm">99% Satisfaction</span>
              <p className="text-white/50 mt-1 font-light">Praise for the fine misting pressure and zero-clog nozzle</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block text-sm">50% Less Oil Used</span>
              <p className="text-white/50 mt-1 font-light">Home cooks report cutting daily cooking oil consumption</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block text-sm">No Aerosol Cans</span>
              <p className="text-white/50 mt-1 font-light">Eliminated single-use store bought sprays completely</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-[#151515] border border-white/10 shadow-xl flex flex-col justify-between hover:border-[#D4AF37]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < rev.rating ? 'fill-[#D4AF37]' : 'text-white/15'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/40 font-light">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-display text-base font-normal text-[#EAEAEA] mb-2">
                  {rev.title}
                </h4>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-light">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-medium text-white">{rev.userName}</span>
                {rev.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[#D4AF37] font-medium text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151515] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl space-y-6 text-[#EAEAEA]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-normal text-[#EAEAEA]">
                Share Your Experience
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/40 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="p-6 text-center bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] font-semibold text-sm">
                Thank you! Your review has been submitted successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                    Your Rating:
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#D4AF37] transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating) ? 'fill-[#D4AF37]' : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-[#D4AF37]">{rating} out of 5</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Chef Alex or Sarah M."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Love the dual spray and pour!"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">
                    Your Review
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How do you use your KitchEase dispenser? What do you like most about it?"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-white/15 bg-[#1A1A1A] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-medium text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-md bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E5C158] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Posting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
