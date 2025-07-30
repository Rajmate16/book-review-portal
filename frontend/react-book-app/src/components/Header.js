import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            📚 Book Review System
          </Link>
          
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/books" className={isActive('/books')}>
                Books
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/add-book" className={isActive('/add-book')}>
                Add Book
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;