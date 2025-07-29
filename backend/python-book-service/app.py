from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
import logging
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'books_db',
    'charset': 'utf8mb4',
    'autocommit': True
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except mysql.connector.Error as err:
        logger.error(f"Database connection error: {err}")
        return None

def init_database():
    """Initialize database and create tables if they don't exist"""
    try:
        connection = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password']
        )
        cursor = connection.cursor()
        
        # Create database if not exists
        cursor.execute("CREATE DATABASE IF NOT EXISTS books_db")
        cursor.execute("USE books_db")
        
        # Create books table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                isbn VARCHAR(13),
                publication_year INT,
                genre VARCHAR(100),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        logger.info("Database initialized successfully")
        
    except mysql.connector.Error as err:
        logger.error(f"Database initialization error: {err}")

@app.route('/')
def home():
    return jsonify({
        "message": "Book Service API",
        "version": "1.0.0",
        "status": "running"
    })

@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM books ORDER BY created_at DESC")
        books = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        return jsonify(books)
        
    except Exception as e:
        logger.error(f"Error fetching books: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/books', methods=['POST'])
def add_book():
    """Add a new book"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'author']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        
        # Insert new book
        query = """
            INSERT INTO books (title, author, isbn, publication_year, genre, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('title'),
            data.get('author'),
            data.get('isbn'),
            data.get('publication_year'),
            data.get('genre'),
            data.get('description')
        )
        
        cursor.execute(query, values)
        book_id = cursor.lastrowid
        
        cursor.close()
        connection.close()
        
        return jsonify({
            "message": "Book added successfully",
            "book_id": book_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding book: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book by ID"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM books WHERE id = %s", (book_id,))
        book = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not book:
            return jsonify({"error": "Book not found"}), 404
        
        return jsonify(book)
        
    except Exception as e:
        logger.error(f"Error fetching book: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """Update a book"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        
        # Update book
        query = """
            UPDATE books 
            SET title = %s, author = %s, isbn = %s, publication_year = %s, genre = %s, description = %s
            WHERE id = %s
        """
        values = (
            data.get('title'),
            data.get('author'),
            data.get('isbn'),
            data.get('publication_year'),
            data.get('genre'),
            data.get('description'),
            book_id
        )
        
        cursor.execute(query, values)
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({"error": "Book not found"}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Book updated successfully"})
        
    except Exception as e:
        logger.error(f"Error updating book: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Delete a book"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = connection.cursor()
        cursor.execute("DELETE FROM books WHERE id = %s", (book_id,))
        
        if cursor.rowcount == 0:
            cursor.close()
            connection.close()
            return jsonify({"error": "Book not found"}), 404
        
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Book deleted successfully"})
        
    except Exception as e:
        logger.error(f"Error deleting book: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    init_database()
    app.run(host='0.0.0.0', port=5000, debug=True)