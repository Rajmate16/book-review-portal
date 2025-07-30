import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import AddBook from './components/AddBook';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/add-book" element={<AddBook />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;