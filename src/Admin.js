import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import "./Admin.css";

function Admin() {
  const [formData, setFormData] = useState({
    centerName: '',
    location: '',
    availableDosage: 0, 
    availableSlots: 0   
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const intValue = name === 'availableDosage' || name === 'availableSlots' ? parseInt(value) : value;
    setFormData({ ...formData, [name]: intValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5001/add-center', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        console.log('Data submitted successfully');
        setFormData({
          centerName: '',
          location: '',
          availableDosage: 0,
          availableSlots: 0
        });
      } else {
        console.error('Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <div>
      <h2>Add Vaccination Center</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name of the Center:</label>
          <input
            type="text"
            name="centerName"
            value={formData.centerName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Available Dosage:</label>
          <input
            type="number" 
            name="availableDosage"
            value={formData.availableDosage}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Available Slots:</label>
          <input
            type="number"
            name="availableSlots"
            value={formData.availableSlots}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <Link to="/center-details">View Centers</Link>
    </div>
  );
}

export default Admin;
