// Mock data for standalone frontend deployment (S3 + CloudFront)
const mockBooks = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    genre: 'Fiction',
    publication_year: 1925,
    description: 'A classic American novel set in the Jazz Age',
    price: 12.99,
    stock_quantity: 10,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    genre: 'Fiction',
    publication_year: 1960,
    description: 'A gripping tale of racial injustice and childhood in the American South',
    price: 13.99,
    stock_quantity: 8,
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0-452-28423-4',
    genre: 'Dystopian Fiction',
    publication_year: 1949,
    description: 'A dystopian social science fiction novel about totalitarian control',
    price: 14.99,
    stock_quantity: 15,
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 4,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0-14-143951-8',
    genre: 'Romance',
    publication_year: 1813,
    description: 'A romantic novel of manners in Georgian England',
    price: 11.99,
    stock_quantity: 12,
    created_at: '2024-01-15T13:00:00Z',
    updated_at: '2024-01-15T13:00:00Z'
  },
  {
    id: 5,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '978-0-316-76948-0',
    genre: 'Fiction',
    publication_year: 1951,
    description: 'A controversial novel about teenage rebellion and alienation',
    price: 13.50,
    stock_quantity: 5,
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  }
];

const mockReviews = {
  1: {
    reviews: [
      {
        id: 1,
        book_id: 1,
        reviewer_name: 'Alice Johnson',
        rating: 5,
        comment: 'A masterpiece of American literature. Beautifully written!',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 2,
        book_id: 1,
        reviewer_name: 'Bob Smith',
        rating: 4,
        comment: 'Great story, though the ending was a bit sad.',
        created_at: '2024-01-21T15:30:00Z'
      }
    ],
    statistics: {
      totalReviews: 2,
      averageRating: 4.5
    }
  },
  2: {
    reviews: [
      {
        id: 3,
        book_id: 2,
        reviewer_name: 'Carol Williams',
        rating: 5,
        comment: 'An important book that everyone should read. Powerful message.',
        created_at: '2024-01-22T09:15:00Z'
      }
    ],
    statistics: {
      totalReviews: 1,
      averageRating: 5.0
    }
  }
};

// Simulate API delay for realistic experience
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID for new items
let nextBookId = Math.max(...mockBooks.map(b => b.id)) + 1;
let nextReviewId = Math.max(...Object.values(mockReviews).flat().map(r => r.reviews || []).flat().map(r => r.id || 0)) + 1;

// Book Service APIs with Mock Data
export const bookService = {
  // Get all books with pagination
  getBooks: async (page = 1, perPage = 10) => {
    await simulateDelay();
    try {
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedBooks = mockBooks.slice(startIndex, endIndex);
      
      return {
        books: paginatedBooks,
        pagination: {
          page,
          per_page: perPage,
          total: mockBooks.length,
          total_pages: Math.ceil(mockBooks.length / perPage)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch books: ${error.message}`);
    }
  },

  // Get a specific book by ID
  getBook: async (id) => {
    await simulateDelay();
    try {
      const book = mockBooks.find(b => b.id === parseInt(id));
      if (!book) {
        throw new Error('Book not found');
      }
      return book;
    } catch (error) {
      throw new Error(`Failed to fetch book: ${error.message}`);
    }
  },

  // Create a new book
  createBook: async (bookData) => {
    await simulateDelay();
    try {
      const newBook = {
        id: nextBookId++,
        ...bookData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stock_quantity: bookData.stock_quantity || 0,
        price: bookData.price || 0
      };
      
      mockBooks.push(newBook);
      
      return {
        id: newBook.id,
        message: 'Book created successfully',
        book: newBook
      };
    } catch (error) {
      throw new Error(`Failed to create book: ${error.message}`);
    }
  },

  // Update an existing book
  updateBook: async (id, bookData) => {
    await simulateDelay();
    try {
      const bookIndex = mockBooks.findIndex(b => b.id === parseInt(id));
      if (bookIndex === -1) {
        throw new Error('Book not found');
      }
      
      mockBooks[bookIndex] = {
        ...mockBooks[bookIndex],
        ...bookData,
        updated_at: new Date().toISOString()
      };
      
      return { message: 'Book updated successfully' };
    } catch (error) {
      throw new Error(`Failed to update book: ${error.message}`);
    }
  },

  // Delete a book
  deleteBook: async (id) => {
    await simulateDelay();
    try {
      const bookIndex = mockBooks.findIndex(b => b.id === parseInt(id));
      if (bookIndex === -1) {
        throw new Error('Book not found');
      }
      
      mockBooks.splice(bookIndex, 1);
      return { message: 'Book deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete book: ${error.message}`);
    }
  },

  // Get reviews for a book
  getBookReviews: async (bookId) => {
    await simulateDelay();
    try {
      const reviews = mockReviews[bookId] || { 
        reviews: [], 
        statistics: { totalReviews: 0, averageRating: 0 } 
      };
      return reviews;
    } catch (error) {
      console.warn(`Failed to fetch reviews for book ${bookId}:`, error.message);
      return { reviews: [], statistics: { totalReviews: 0, averageRating: 0 } };
    }
  }
};

// Review Service APIs (Mock Implementation)
export const reviewService = {
  // Create a new review
  createReview: async (reviewData) => {
    await simulateDelay();
    try {
      const newReview = {
        id: nextReviewId++,
        ...reviewData,
        created_at: new Date().toISOString()
      };
      
      const bookId = reviewData.book_id;
      if (!mockReviews[bookId]) {
        mockReviews[bookId] = { reviews: [], statistics: { totalReviews: 0, averageRating: 0 } };
      }
      
      mockReviews[bookId].reviews.push(newReview);
      
      // Recalculate statistics
      const reviews = mockReviews[bookId].reviews;
      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
      
      mockReviews[bookId].statistics = { totalReviews, averageRating };
      
      return { message: 'Review created successfully', review: newReview };
    } catch (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  },

  // Get reviews by rating
  getReviewsByRating: async (rating) => {
    await simulateDelay();
    try {
      const allReviews = Object.values(mockReviews).flatMap(r => r.reviews || []);
      const filteredReviews = allReviews.filter(r => r.rating === rating);
      return { reviews: filteredReviews, rating, count: filteredReviews.length };
    } catch (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }
  }
};

// Health check for services (Mock)
export const healthService = {
  checkBackendHealth: async () => {
    await simulateDelay(200);
    return { 
      status: 'healthy', 
      service: 'mock-frontend-service',
      database_type: 'Mock Data',
      version: '1.0.0',
      message: 'Running in standalone mode with mock data'
    };
  }
};

// Default export for backward compatibility
export default {
  bookService,
  reviewService,
  healthService
};