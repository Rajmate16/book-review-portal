import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookService } from '../services/api';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await bookService.getBook(id);
      setBook(bookData);
      
      // Fetch reviews separately
      fetchReviews();
    } catch (error) {
      toast.error('Failed to fetch book details: ' + error.message);
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewData = await bookService.getBookReviews(id);
      setReviews(reviewData.reviews || []);
      setStatistics(reviewData.statistics || {});
    } catch (error) {
      console.warn('Failed to fetch reviews:', error.message);
      setReviews([]);
      setStatistics({});
    } finally {
      setReviewsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const renderAverageRating = () => {
    if (!statistics.averageRating || statistics.totalReviews === 0) {
      return <span className="no-rating">No ratings yet</span>;
    }
    
    return (
      <div className="average-rating">
        <span className="stars">{renderStars(Math.round(statistics.averageRating))}</span>
        <span className="rating-text">
          {statistics.averageRating.toFixed(1)} ({statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading book details...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container">
        <div className="error">Book not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="book-detail">
        <div className="book-detail-header">
          <Link to="/books" className="btn btn-outline">
            ← Back to Books
          </Link>
          
          <div className="book-actions">
            <Link 
              to={`/books/${id}/add-review`} 
              className="btn btn-primary"
            >
              + Add Review
            </Link>
          </div>
        </div>

        <div className="book-info-card">
          <h1>{book.title}</h1>
          <div className="book-meta">
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>ISBN:</strong> {book.isbn}</p>
            <p><strong>Added:</strong> {new Date(book.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="rating-summary">
            {renderAverageRating()}
          </div>
        </div>

        <div className="reviews-section">
          <h2>Reviews</h2>
          
          {reviewsLoading ? (
            <div className="loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-reviews">
              <p>No reviews yet. Be the first to review this book!</p>
              <Link 
                to={`/books/${id}/add-review`} 
                className="btn btn-primary"
              >
                Write a Review
              </Link>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="review-text">
                    {review.review}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;