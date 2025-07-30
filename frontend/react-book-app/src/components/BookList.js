import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/api';
import toast from 'react-hot-toast';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    fetchBooks();
  }, [pagination.page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooks(pagination.page, pagination.per_page);
      setBooks(data.books || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        total_pages: data.pagination?.total_pages || 0
      }));
    } catch (error) {
      toast.error('Failed to fetch books: ' + error.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await bookService.deleteBook(bookId);
      toast.success('Book deleted successfully!');
      fetchBooks(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete book: ' + error.message);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📚 Books Library</h1>
        <Link to="/add-book" className="btn btn-primary">
          + Add New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>No books found. <Link to="/add-book">Add the first book!</Link></p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-header">
                  <h3>{book.title}</h3>
                  <div className="book-actions">
                    <Link 
                      to={`/books/${book.id}`} 
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="book-info">
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                  <p><strong>Added:</strong> {new Date(book.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.total_pages} 
                ({pagination.total} total books)
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;