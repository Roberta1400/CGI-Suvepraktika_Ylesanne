import React from 'react';
import './Logout.css';

const Logout = ({ setUser }) => {
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      <h2>Logi välja</h2>
      <button class="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;