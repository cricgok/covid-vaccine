
import React from 'react';
import { Link } from 'react-router-dom';
import './Login';

function Home() {
  return (
    <div>
      <h1>Welcome to Vaccination Booking System</h1>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Home;
