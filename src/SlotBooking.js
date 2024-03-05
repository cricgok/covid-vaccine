import React, { useState } from 'react';

function SlotBooking({ match }) {
  const centerId = match.params.id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/book-slot/${centerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        console.log('Slot booked successfully');
        console.log('Sending email notification to', formData.email);
        console.log('Sending WhatsApp message to', formData.phone);
        setFormData({ name: '', email: '', phone: '' });
      } else {
        console.error('Failed to book slot');
      }
    } catch (error) {
      console.error('Error booking slot:', error);
    }
  };

  return (
    <div>
      <h2>Book Slot</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div>
          <label>Phone:</label>
          <input type="text" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <button type="submit">Book Slot</button>
      </form>
    </div>
  );
}

export default SlotBooking;
