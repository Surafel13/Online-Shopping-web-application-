import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAppSelector } from "../../hooks/useRedux";
import { getApiErrorMessage } from "../../lib/errors";
import { reviewService } from "../../services";
import type { ApiReview, ApiReviewSummary } from "../../types/api";

interface ProductReviewsProps {
  productId: string;
  onSummaryChange?: (summary: Pick<ApiReviewSummary, "rating" | "reviewCount">) => void;
}

interface ReviewFormValues {
  rating: number;
  title: string;
  comment: string;
}

const emptyForm: ReviewFormValues = { rating: 5, title: "", comment: "" };

function RatingStars({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((value) =>
        interactive ? (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            onClick={() => onChange?.(value)}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Star
              className={`h-5 w-5 ${
                value <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ) : (
          <Star
            key={value}
            aria-hidden="true"
            className={`h-4 w-4 ${
              value <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ),
      )}
    </div>
  );
}

function getReviewer(review: ApiReview) {
  return typeof review.user === "string" ? null : review.user;
}

export function ProductReviews({
  productId,
  onSummaryChange,
}: ProductReviewsProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [summary, setSummary] = useState<ApiReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ReviewFormValues>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const result = await reviewService.getForProduct(productId);
      setSummary(result);
      setLoadError(null);
      onSummaryChange?.({
        rating: result.rating,
        reviewCount: result.reviewCount,
      });
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Unable to load product reviews."));
    } finally {
      setIsLoading(false);
    }
  }, [onSummaryChange, productId]);

  const retryLoadingReviews = () => {
    setIsLoading(true);
    setLoadError(null);
    void loadReviews();
  };

  useEffect(() => {
    let isCurrent = true;
    reviewService
      .getForProduct(productId)
      .then((result) => {
        if (!isCurrent) return;
        setSummary(result);
        setLoadError(null);
        onSummaryChange?.({
          rating: result.rating,
          reviewCount: result.reviewCount,
        });
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setLoadError(
            getApiErrorMessage(error, "Unable to load product reviews."),
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [onSummaryChange, productId]);

  const ownReview = summary?.reviews.find((review) => {
    const reviewer = getReviewer(review);
    return reviewer?._id === user?.id || review.user === user?.id;
  });

  const startEditing = () => {
    if (!ownReview) return;
    setFormValues({
      rating: ownReview.rating,
      title: ownReview.title,
      comment: ownReview.comment,
    });
    setFormError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFormValues(emptyForm);
    setFormError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const review = {
        rating: formValues.rating,
        title: formValues.title.trim(),
        comment: formValues.comment.trim(),
      };
      if (isEditing && ownReview) {
        await reviewService.update(ownReview._id, review);
      } else {
        await reviewService.create(productId, review);
      }
      setFormValues(emptyForm);
      setIsEditing(false);
      await loadReviews();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to save your review."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!ownReview) return;
    setIsDeleting(true);
    setFormError(null);
    try {
      await reviewService.remove(ownReview._id);
      setIsDeleteOpen(false);
      setFormValues(emptyForm);
      setIsEditing(false);
      await loadReviews();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to delete your review."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section id="product-reviews" className="scroll-mt-24 pt-16 sm:pt-20">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Customer feedback
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">Reviews</h2>
        </div>
        {summary && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <RatingStars rating={summary.rating} />
            <span>
              <strong className="text-foreground">
                {summary.rating.toFixed(1)}
              </strong>{" "}
              from {summary.reviewCount}{" "}
              {summary.reviewCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-label="Loading reviews" aria-live="polite">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted/50"
            />
          ))}
        </div>
      ) : loadError ? (
        <div
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm"
          role="alert"
        >
          <p className="mb-4 text-red-600 dark:text-red-400">{loadError}</p>
          <Button variant="outline" onClick={retryLoadingReviews}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <div className="space-y-4">
            {summary?.reviews.length ? (
              summary.reviews.map((review) => {
                const reviewer = getReviewer(review);
                const reviewerName = reviewer?.username || "Customer";
                return (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 font-semibold text-blue-600 dark:text-blue-400">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{reviewerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : "Customer review"}
                          </p>
                        </div>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    <h3 className="mt-4 font-bold">{review.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {review.comment}
                    </p>
                    {review.isVerifiedPurchase && (
                      <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified purchase
                      </span>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-semibold">No reviews yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to share your experience with this product.
                </p>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border/60 bg-card p-5 sm:p-6">
            {ownReview && !isEditing ? (
              <>
                <h3 className="text-lg font-bold">Your review</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You’ve already reviewed this product. You can update or remove
                  your review.
                </p>
                {formError && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                    {formError}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    onClick={startEditing}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <h3 className="text-lg font-bold">
                  {isEditing ? "Edit your review" : "Write a review"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share your honest feedback about this product.
                </p>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Your rating
                    </span>
                    <RatingStars
                      rating={formValues.rating}
                      interactive
                      onChange={(rating) =>
                        setFormValues((values) => ({ ...values, rating }))
                      }
                    />
                  </div>
                  <label className="block text-sm font-medium">
                    Review title
                    <input
                      required
                      minLength={3}
                      maxLength={100}
                      value={formValues.title}
                      onChange={(event) =>
                        setFormValues((values) => ({
                          ...values,
                          title: event.target.value,
                        }))
                      }
                      className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Your review
                    <textarea
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={5}
                      value={formValues.comment}
                      onChange={(event) =>
                        setFormValues((values) => ({
                          ...values,
                          comment: event.target.value,
                        }))
                      }
                      className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <span className="mt-1 block text-right text-xs text-muted-foreground">
                      {formValues.comment.length}/1000
                    </span>
                  </label>
                  {formError && (
                    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                      {formError}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : isEditing
                          ? "Save changes"
                          : "Submit review"}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">Have you tried it?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to share your review. Review eligibility is checked
                  when you submit.
                </p>
                <Button asChild className="mt-5 bg-blue-600 text-white hover:bg-blue-700">
                  <Link to="/login" state={{ from: location.pathname }}>
                    Sign in to review
                  </Link>
                </Button>
              </>
            )}
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete your review?"
        description="This action cannot be undone."
        confirmLabel="Delete review"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </section>
  );
}
