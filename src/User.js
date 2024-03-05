import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input/input';
import {useNavigate} from 'react-router-dom';

function User() {
  const [centers, setCenters] = useState([]);
  const [bookingData, setBookingData] = useState({
    name: '',
    dob: '',
    phone: '', // Phone number with country code
    email: '',
    slotDate: '',
    slotTime: ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch('http://localhost:5001/get-centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      } else {
        console.error('Failed to fetch centers');
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };
  const naviagte=useNavigate();

  const handleBookSlot = (center) => {
    setSelectedCenter(center);
    setShowBookingForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send user data to book a slot
      const response = await fetch('http://localhost:5001/book-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          centerId: selectedCenter.id,
          ...bookingData
        })
      });
  
      if (response.ok) {
        console.log('Slot booked successfully');
  
        // Fetch ticket data after successful booking
        const ticketResponse = await fetch('http://localhost:5001/get-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            centerId: selectedCenter.id,
            ...bookingData
          })
        });
  
        if (ticketResponse.ok) {
          console.log('Ticket fetched successfully');
  
          // Reset booking form and state
          setBookingData({
            name: '',
            dob: '',
            phone: '',
            email: '',
            slotDate: '',
            slotTime: ''
          });
          setShowBookingForm(false);
          setSelectedCenter(null);
          alert(" Slot Booked  and Email sent Successfully ");
          naviagte('/tickets');
         
        } else {
          console.error('Failed to fetch ticket');
        }
      } else {
        console.error('Failed to book slot');
      }
    } catch (error) {
      console.error('Error booking slot:', error);
    }
  };
  
  return (
    <div>
      <h2>Available Vaccination Centers</h2>
      <table>
        <thead>
          <tr>
            <th>Center Name</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {centers.map(center => (
            <tr key={center.id}>
              <td>{center.centerName}</td>
              <td>{center.location}</td>
              <td>
                <button onClick={() => handleBookSlot(center)}>Book Slot</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showBookingForm && selectedCenter && (
        <div>
          <h2>Book Slot - {selectedCenter.centerName}</h2>
          <form onSubmit={handleSubmit}>
            <table>
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>
                    <input type="text" name="name" value={bookingData.name} onChange={handleInputChange} required />
                  </td>
                </tr>
                <tr>
                  <td>Date of Birth:</td>
                  <td>
                    <input type="date" name="dob" value={bookingData.dob} onChange={handleInputChange} required />
                  </td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td>
                    <PhoneInput
                      country="IN" // Set default country code for India
                      value={bookingData.phone} 
                      onChange={value => setBookingData({ ...bookingData, phone: value })}
                      required
                    />
                  </td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>
                    <input type="email" name="email" value={bookingData.email} onChange={handleInputChange} required />
                  </td>
                </tr>
                <tr>
                  <td>Slot Date:</td>
                  <td>
                    <input type="date" name="slotDate" value={bookingData.slotDate} onChange={handleInputChange} required />
                  </td>
                </tr>
                <tr>
                  <td>Slot Time:</td>
                  <td>
                    <input type="time" name="slotTime" value={bookingData.slotTime} onChange={handleInputChange} required />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <button type="submit">Book Slot</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      )}
    </div>
  );
}

export default User;
