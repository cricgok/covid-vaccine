import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './Tickets.css'; 

function Tickets() {
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketData(); 
  }, []);

  const fetchTicketData = () => {
    fetch('http://localhost:5001/get-slot')
      .then(response => response.json())
      .then(data => {
        setTicketData(data); 
        setLoading(false); 
      })
      .catch(error => {
        console.error('Error fetching slot booking data:', error);
        setLoading(false); 
      });
  };

  const generateTicketHTML = () => {
    if (!ticketData) return null;
    const { name, slotTime, slotDate, centerName } = ticketData;
    return (
      <div className="ticket-container">
        <h2>Vaccination Slot Booking Confirmation</h2>
        <p>Dear {name},</p>
        <p>Your vaccination slot at {slotTime} on {slotDate} at {centerName} has been successfully booked.</p>
        <p>Center Name: {centerName}</p>
        <p>Slot Date: {slotDate}</p>
        <p>Slot Time: {slotTime}</p>
        <p>Stay away from COVID, stay safe!</p>
      </div>
    );
  };

  const handleDownload = () => {
    const ticketContainer = document.getElementById('ticket-container'); 
    html2canvas(ticketContainer).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageData;
      downloadLink.download = 'ticket.png'; 
      downloadLink.click();
    });
  };

  return (
    <div className="container">
      <h1 className="mt-5 mb-4">Ticket Details</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div id="ticket-container">{generateTicketHTML()}</div>
      )}
      <button className="btn btn-primary mt-3" onClick={handleDownload}>Download Ticket</button>
    </div>
  );
}

export default Tickets;
