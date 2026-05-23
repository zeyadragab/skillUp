import React, { useEffect, useState, useCallback } from 'react';
import {
  Star, Eye, EyeOff, Trash2, RefreshCw, Filter,
  BarChart2, MessageSquare, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { reviewsApi } from '../services/api';
import { Pagination } from '../types';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ReviewRecord {
  _id: string;
  sessionId: string;
  skill: string;
  scheduledAt?: string;
  reviewer?: { _id: string; name: string; email: string; avatar?: string };
  reviewee?: { _id: string; name: string; email: string; avatar?: string };
  ratingType: 'teacher' | 'learner';
  rating: number;
  review?: string;
  ratedAt?: string;
  isHidden: boolean;
  createdAt?: string;
}

interface ReviewStats {
  totalReviews: number;
  hiddenReviews: number;
  averageRating: number;
  ratingDistribution: Array<{ _id: number; count: number }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function userName(u: any): string { return u?.name || 'Unknown'; }
function userId(u: any): string | null { return u?._id || null; }

const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-3.5 h-3.5' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`${size} ${s <= rating ? 'text-warn fill-warn' : 'text-fg-3/30'}`} />
    ))}
  </div>
);

const Mini: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color = 'text-accent' }) => (
  <div className="rounded-xl border border-white/5 bg-rail p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-[11px] text-fg-rail uppercase tracking-wider">{label}</p>
      <p className="text-[20px] font-bold text-fg-inv leading-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const Reviews: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, pages: 0 });
  const [stats, setStats] = useState<ReviewStats | null>(null);

  // Filters
  const [ratingFilter, setRatingFilter] = useState('');
  const [hiddenFilter, setHiddenFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Detail
  const [detail, setDetail] = useState<ReviewRecord | null>(null);

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState<ReviewRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Show stats panel
  const [showStats, setShowStats] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.allSettled([
        reviewsApi.getReviews({
          page: pagination.page,
          limit: pagination.limit,
          ...(ratingFilter && { rating: ratingFilter }),
          ...(hiddenFilter !== '' && { isHidden: hiddenFilter }),
        }),
        reviewsApi.getStats(),
      ]);
      if (reviewsRes.status === 'fulfilled') {
        setReviews(reviewsRes.value.data.data || []);
        setPagination(p => ({ ...p, ...reviewsRes.value.data.pagination }));
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, ratingFilter, hiddenFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleVisibility = async (review: ReviewRecord) => {
    const newStatus = review.isHidden ? 'visible' : 'hidden';
    try {
      await reviewsApi.updateStatus(review._id, newStatus);
      toast.success(newStatus === 'hidden' ? 'Review hidden' : 'Review restored');
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isHidden: !r.isHidden } : r));
      if (detail?._id === review._id) setDetail(d => d ? { ...d, isHidden: !d.isHidden } : d);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await reviewsApi.deleteReview(deleteModal._id);
      toast.success('Review deleted');
      setDeleteModal(null);
      setDetail(null);
      setReviews(prev => prev.filter(r => r._id !== deleteModal._id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    } finally { setDeleting(false); }
  };

  // Rating distribution max for bar chart
  const maxDistCount = stats?.ratingDistribution
    ? Math.max(...stats.ratingDistribution.map(d => d.count), 1)
    : 1;

  return (
    <div className="p-5 space-y-5">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Total Reviews" value={stats?.totalReviews || 0} icon={<Star className="w-4 h-4" />} color="text-warn" />
        <Mini label="Avg Rating" value={stats?.averageRating?.toFixed(2) || '—'} icon={<Star className="w-4 h-4" />} color="text-yellow-400" />
        <Mini label="Hidden" value={stats?.hiddenReviews || 0} icon={<EyeOff className="w-4 h-4" />} color="text-fg-rail" />
        <div
          onClick={() => setShowStats(s => !s)}
          className="rounded-xl border border-white/5 bg-rail p-4 flex items-center gap-3 cursor-pointer hover:bg-white/3 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-accent">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-fg-rail uppercase tracking-wider">Distribution</p>
            <p className="text-[13px] font-medium text-fg-inv">{showStats ? 'Hide chart' : 'Show chart'}</p>
          </div>
        </div>
      </div>

      {/* ── Rating distribution chart ─────────────────────────────────────── */}
      {showStats && stats && (
        <div className="rounded-xl border border-white/5 bg-rail p-5">
          <p className="text-[14px] font-semibold text-fg-inv mb-4">Rating Distribution</p>
          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map(star => {
              const entry = stats.ratingDistribution.find(d => d._id === star);
              const count = entry?.count || 0;
              const pct = Math.round((count / maxDistCount) * 100);
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 shrink-0">
                    <span className="text-[12px] font-medium text-fg-rail w-3">{star}</span>
                    <Star className="w-3 h-3 text-warn fill-warn" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-rail-hi overflow-hidden">
                    <div className="h-full rounded-full bg-warn transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[12px] text-fg-rail shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
            <Stars rating={Math.round(stats.averageRating)} />
            <span className="text-[13px] font-bold text-warn">{stats.averageRating.toFixed(2)}</span>
            <span className="text-[12px] text-fg-rail">avg from {stats.totalReviews} reviews</span>
          </div>
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-panel border border-edge rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-fg-3">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[12px] font-medium">Filters</span>
        </div>
        <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
        <select value={hiddenFilter} onChange={e => { setHiddenFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">All Visibility</option>
          <option value="false">Visible only</option>
          <option value="true">Hidden only</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="h-8 px-2.5 bg-canvas border border-edge rounded-lg text-[12px] text-fg-1 focus:outline-none">
          <option value="">Teacher &amp; Learner</option>
          <option value="teacher">Teacher reviews</option>
          <option value="learner">Learner reviews</option>
        </select>
        <button onClick={fetchData} className="p-1.5 rounded-lg text-fg-3 hover:text-fg-1 hover:bg-canvas border border-edge transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="text-[12px] text-fg-rail ml-auto">{pagination.total} review{pagination.total !== 1 ? 's' : ''}</div>
      </div>

      {/* ── Review list ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-rail overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[76px] bg-canvas animate-pulse border-b border-white/5 last:border-0" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-fg-rail">
            <Star className="w-8 h-8 opacity-30" />
            <p className="text-[13px]">No reviews found</p>
          </div>
        ) : (
          <div>
            {reviews.map((review, i) => (
              <div
                key={review._id}
                onClick={() => setDetail(review)}
                className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/3 transition-colors ${review.isHidden ? 'opacity-50' : ''} ${i < reviews.length - 1 ? 'border-b border-white/4' : ''}`}
              >
                {/* Rating */}
                <div className="shrink-0 text-center w-10">
                  <p className="text-[18px] font-bold text-warn leading-none">{review.rating}</p>
                  <Star className="w-3 h-3 text-warn fill-warn mx-auto mt-0.5" />
                </div>

                {/* Users */}
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4">
                  <div className="min-w-0">
                    <p className="text-[11px] text-fg-rail mb-0.5">Reviewer</p>
                    <p className="text-[13px] font-medium text-fg-inv truncate">{userName(review.reviewer)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-fg-rail mb-0.5">Reviewed</p>
                    <p className="text-[13px] font-medium text-fg-inv truncate">{userName(review.reviewee)}</p>
                  </div>
                </div>

                {/* Comment preview */}
                <div className="flex-1 min-w-0 hidden md:block">
                  <p className="text-[12px] text-fg-rail truncate">{review.review || <em>No comment</em>}</p>
                  <p className="text-[11px] text-fg-rail mt-0.5">{review.skill}</p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={review.ratingType === 'teacher' ? 'success' : 'info'}>{review.ratingType}</Badge>
                  {review.isHidden && <Badge variant="warning">hidden</Badge>}
                  <span className="text-[11px] text-fg-rail hidden sm:block">
                    {review.createdAt ? format(new Date(review.createdAt), 'MMM d') : ''}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleVisibility(review)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${review.isHidden ? 'text-ok/70 hover:text-ok hover:bg-ok/10' : 'text-fg-rail hover:text-warn hover:bg-warn/10'}`}
                    title={review.isHidden ? 'Restore' : 'Hide'}
                  >
                    {review.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setDeleteModal(review)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-fg-rail hover:text-err hover:bg-err/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/4">
            <span className="text-[12px] text-fg-rail">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                  className={`w-7 h-7 rounded-md text-[12px] font-medium transition-colors ${p === pagination.page ? 'bg-accent text-[oklch(15%_0.008_55)]' : 'text-fg-rail hover:text-fg-inv hover:bg-white/5'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail drawer ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Review Details" size="lg">
        {detail && (
          <div className="space-y-5">
            {/* Stars + hidden badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Stars rating={detail.rating} size="w-5 h-5" />
                <span className="text-[22px] font-bold text-warn">{detail.rating}/5</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={detail.ratingType === 'teacher' ? 'success' : 'info'}>{detail.ratingType} review</Badge>
                {detail.isHidden && <Badge variant="warning">Hidden</Badge>}
              </div>
            </div>

            {/* Comment */}
            {detail.review ? (
              <div className="p-4 rounded-xl bg-canvas border border-edge">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-fg-rail" />
                  <p className="text-[11px] font-semibold text-fg-3 uppercase tracking-wider">Comment</p>
                </div>
                <p className="text-[13px] text-fg-inv leading-relaxed">{detail.review}</p>
              </div>
            ) : (
              <p className="text-[13px] text-fg-rail italic">No comment left</p>
            )}

            {/* User cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Reviewer', user: detail.reviewer },
                { label: 'Reviewee', user: detail.reviewee },
              ].map(({ label, user }) => (
                <div key={label} className="p-3 rounded-xl bg-canvas border border-edge">
                  <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-2">{label}</p>
                  <div className="flex items-center gap-2.5">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-[12px] font-bold text-accent shrink-0">
                        {userName(user).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-fg-inv truncate">{userName(user)}</p>
                      <p className="text-[11px] text-fg-rail truncate">{user?.email || ''}</p>
                    </div>
                  </div>
                  {userId(user) && (
                    <button
                      onClick={() => { navigate(`/users/${userId(user)}`); setDetail(null); }}
                      className="mt-2 text-[11px] text-accent hover:underline"
                    >
                      View profile →
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Session info */}
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 rounded-lg bg-canvas border border-edge">
                <p className="text-fg-3 mb-0.5">Skill</p>
                <p className="text-fg-inv font-medium">{detail.skill || '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-edge">
                <p className="text-fg-3 mb-0.5">Session date</p>
                <p className="text-fg-inv font-medium">{detail.scheduledAt ? format(new Date(detail.scheduledAt), 'MMM d, yyyy') : '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-edge">
                <p className="text-fg-3 mb-0.5">Rated at</p>
                <p className="text-fg-inv font-medium">{detail.ratedAt ? format(new Date(detail.ratedAt), 'MMM d, yyyy HH:mm') : '—'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-edge">
                <p className="text-fg-3 mb-0.5">Status</p>
                <p className={`font-medium ${detail.isHidden ? 'text-warn' : 'text-ok'}`}>{detail.isHidden ? 'Hidden' : 'Visible'}</p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <Button
                variant={detail.isHidden ? 'success' : 'secondary'}
                icon={detail.isHidden ? Eye : EyeOff}
                onClick={() => handleToggleVisibility(detail)}
              >
                {detail.isHidden ? 'Restore Review' : 'Hide Review'}
              </Button>
              <Button variant="danger" icon={Trash2} onClick={() => { setDeleteModal(detail); setDetail(null); }}>
                Delete
              </Button>
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirm ────────────────────────────────────────────────── */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Review">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-err/10 border border-err/20">
            <p className="text-[13px] text-err font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" /> This permanently removes the review and recalculates the user's rating.
            </p>
            {deleteModal && (
              <p className="text-[12px] text-fg-rail mt-1">
                {deleteModal.rating}★ review by <strong className="text-fg-inv">{userName(deleteModal.reviewer)}</strong> for <strong className="text-fg-inv">{userName(deleteModal.reviewee)}</strong>
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} onClick={handleDelete} loading={deleting}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reviews;
