import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import SlotBooking from './SlotBooking';
import Ticket from './Ticket';
import Admin from "./Admin";
import Centers from "./centers";
import User from "./User";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book-slot/:id" element={SlotBooking} />
        <Route path="/tickets" element={<Ticket />} />
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/center-details" element={<Centers/>}/>
        <Route  path="/user" element={< User/>}/>
      </Routes>
    </div>
  );
}

export default App;
