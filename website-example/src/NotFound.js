import './NotFound.css';

import React from 'react';

import { Link, useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  console.log(JSON.stringify(location, null, 2));

  return (
    <div className="NotFound">
      <header className="NotFound-header">
        <p>
          <code>{location.pathname}</code> not found.
        </p>
        <Link to="/" className="NotFound-link">
          Home
        </Link>
      </header>
    </div>
  );
};

export default NotFound;
