import os
import json
import sqlite3
# import boto3
# import pymysql
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration from environment variables
# AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
# DB_SECRET_ARN = os.getenv('DB_SECRET_ARN')
JAVA_SERVICE_URL = os.getenv('JAVA_SERVICE_URL', 'http://localhost:8080')

# Local SQLite database for testing
DATABASE_PATH = 'books.db'

def init_db():
    """Initialize SQLite database with books table"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Create books table if it doesn't exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT UNIQUE,
                genre TEXT,
                publication_year INTEGER,
                description TEXT,
                price DECIMAL(10,2),
                stock_quantity INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insert sample data if table is empty
        cursor.execute('SELECT COUNT(*) FROM books')
        if cursor.fetchone()[0] == 0:
            sample_books = [
                ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 1925, 'A classic American novel', 12.99, 10),
                ('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 1960, 'A gripping tale of racial injustice and childhood', 13.99, 8),
                ('1984', 'George Orwell', '978-0-452-28423-4', 'Dystopian Fiction', 1949, 'A dystopian social science fiction novel', 14.99, 15),
                ('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 1813, 'A romantic novel of manners', 11.99, 12),
                ('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Fiction', 1951, 'A controversial novel about teenage rebellion', 13.50, 5)
            ]
            
            cursor.executemany('''
                INSERT INTO books (title, author, isbn, genre, publication_year, description, price, stock_quantity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', sample_books)
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

def get_db_connection():
    """Create SQLite database connection"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        connection = get_db_connection()
        if connection:
            connection.close()
            db_status = "connected"
        else:
            db_status = "disconnected"
        
        return jsonify({
            "status": "healthy",
            "service": "book-service",
            "database": db_status,
            "database_type": "SQLite",
            "version": "1.0.0"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books with pagination support"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) as total FROM books")
        total = cursor.fetchone()['total']
        
        # Get books with pagination
        cursor.execute(
            "SELECT * FROM books ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (per_page, offset)
        )
        books_rows = cursor.fetchall()
        
        # Convert rows to dictionaries
        books = []
        for row in books_rows:
            book = dict(row)
            books.append(book)
        
        connection.close()
        
        return jsonify({
            "books": books,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": (total + per_page - 1) // per_page
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting books: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book by ID"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
        book = cursor.fetchone()
        
        connection.close()
        
        if book:
            return jsonify(dict(book)), 200
        else:
            return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        logger.error(f"Error getting book {book_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/books', methods=['POST'])
def create_book():
    """Create a new book"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'author', 'isbn']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)",
            (data['title'].strip(), data['author'].strip(), data['isbn'].strip())
        )
        book_id = cursor.lastrowid
        connection.commit()
        
        connection.close()
        
        logger.info(f"Created book with ID: {book_id}")
        return jsonify({
            "id": book_id,
            "message": "Book created successfully",
            "book": {
                "id": book_id,
                "title": data['title'].strip(),
                "author": data['author'].strip(),
                "isbn": data['isbn'].strip()
            }
        }), 201
    except sqlite3.IntegrityError as e:
        logger.error(f"Database integrity error: {e}")
        return jsonify({"error": "Book with this ISBN already exists"}), 409
    except Exception as e:
        logger.error(f"Error creating book: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>/reviews', methods=['GET'])
def get_book_reviews(book_id):
    """Get reviews for a specific book from Java service"""
    try:
        # First check if book exists
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM books WHERE id = ?", (book_id,))
        book = cursor.fetchone()
        
        connection.close()
        
        if not book:
            return jsonify({"error": "Book not found"}), 404
        
        # Call Java service for reviews
        java_url = f"{JAVA_SERVICE_URL}/internal/reviews/book/{book_id}"
        logger.info(f"Calling Java service: {java_url}")
        
        response = requests.get(java_url, timeout=10)
        
        if response.status_code == 200:
            return jsonify(response.json()), 200
        elif response.status_code == 404:
            return jsonify({"reviews": []}), 200
        else:
            logger.error(f"Java service error: {response.status_code}")
            return jsonify({"error": "Failed to fetch reviews from review service"}), 502
    except requests.RequestException as e:
        logger.error(f"Error calling Java service: {e}")
        return jsonify({"error": "Review service unavailable"}), 503
    except Exception as e:
        logger.error(f"Error getting reviews for book {book_id}: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    init_db() # Initialize database on startup
    app.run(host='0.0.0.0', port=5000, debug=False)