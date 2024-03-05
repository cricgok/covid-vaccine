const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 5001;

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gokul@123',
  database: 'covid'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(bodyParser.json());

// Add Center
app.post('/add-center', (req, res) => {
  const { centerName, location, availableDosage, availableSlots } = req.body;
  const sql = 'INSERT INTO vaccination_centers (centerName, location, availableDosage, availableSlots) VALUES (?, ?, ?, ?)';
  db.query(sql, [centerName, location, availableDosage, availableSlots], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      res.status(500).json({ error: 'Error inserting data into database' });
      return;
    }
    console.log('Data inserted into database successfully');
    res.sendStatus(200);
  });
});

// Check DB Connection
app.get('/api/check-db-connection', (req, res) => {
  if (db.state === 'authenticated') {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

// Fetch Centers
app.get('/get-centers', (req, res) => {
  const sql = 'SELECT * FROM vaccination_centers';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching centers:', err);
      res.status(500).json({ error: 'Error fetching centers' });
      return;
    }
    res.json(result);
  });
});

// Delete Center
app.delete('/delete-center/:id', (req, res) => {
  const centerId = req.params.id;
  const sql = 'DELETE FROM vaccination_centers WHERE id = ?';
  db.query(sql, [centerId], (err, result) => {
    if (err) {
      console.error('Error deleting center:', err);
      res.status(500).json({ error: 'Error deleting center' });
      return;
    }
    console.log('Center deleted successfully');
    res.sendStatus(200);
  });
});

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'gokulramesh033@gmail.com',
    pass: 'xusm ejxu lilv ajpx' 
  }
});

// Book Slot
app.post('/book-slot', async (req, res) => {
  const { centerId, name, dob, email, phone, slotDate, slotTime } = req.body;

  try {
    // Fetch center name and available slots before booking
    const centerQuery = 'SELECT centerName, availableSlots, availableDosage FROM vaccination_centers WHERE id = ?';
    db.query(centerQuery, [centerId], async (err, result) => {
      if (err) {
        console.error('Error fetching center data:', err);
        res.status(500).json({ error: 'Error fetching center data' });
        return;
      }

      // Check if the center exists
      if (result.length === 0) {
        console.error('Center not found');
        res.status(404).json({ error: 'Center not found' });
        return;
      }

      const centerName = result[0].centerName;
      let availableSlotsBeforeBooking = result[0].availableSlots;
      let availableDosageBeforeBooking = result[0].availableDosage;

      // Check if slots are available
      if (availableSlotsBeforeBooking <= 0) {
        console.error('No available slots for booking');
        res.status(400).json({ error: 'No available slots for booking' });
        return;
      }

      // Insert booking data into slot_bookings table
      const bookingSql = 'INSERT INTO slot_bookings (centerId, name, dob, email, phone, slotDate, slotTime) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(bookingSql, [centerId, name, dob, email, phone, slotDate, slotTime], async (err, result) => {
        if (err) {
          console.error('Error inserting booking data:', err);
          res.status(500).json({ error: 'Error booking slot' });
          return;
        }

        // Decrease available slots by 1
        const updateSlotsSql = 'UPDATE vaccination_centers SET availableSlots = availableSlots - 1 WHERE id = ?';
        db.query(updateSlotsSql, [centerId], (err, result) => {
          if (err) {
            console.error('Error updating available slots:', err);
            res.status(500).json({ error: 'Error updating available slots' });
            return;
          }

          console.log('Available slots decremented successfully');

          // Calculate dosage booked
          const dosageBooked = calculateDosageBooked(dob);

          // Update slotsBooked and availableDosage in the vaccination_centers table
          const updateSql = 'UPDATE vaccination_centers SET availableDosage = availableDosage - ? WHERE id = ?';
          db.query(updateSql, [ dosageBooked, centerId], (err, result) => {
            if (err) {
              console.error('Error updating slotsBooked and available dosage:', err);
              res.status(500).json({ error: 'Error updating slotsBooked and available dosage' });
              return;
            }
            console.log('Slots Booked and Dosage updated successfully');

            // Send email confirmation with ticket HTML
            const ticketHTML = `
              <div style="font-family: Arial, sans-serif;">
                <h2>Vaccination Slot Booking Confirmation</h2>
                <p>Dear ${name},</p>
                <p>Your vaccination slot at ${slotTime} on ${slotDate} at ${centerName} has been successfully booked.</p>
                <p>Center Name: ${centerName}</p>
                <p>Slot Date: ${slotDate}</p>
                <p>Slot Time: ${slotTime}</p>
                <p>Stay away from COVID, stay safe!</p>
              </div>
            `;
            const mailOptions = {
              from: 'gokulramesh033@gmail.com',
              to: email,
              subject: 'Vaccination Slot Booking Confirmation',
              html: ticketHTML
            };
            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error('Error sending email confirmation:', err);
                res.status(500).json({ error: 'Error sending email confirmation' });
                return;
              }
              console.log('Email confirmation sent:', info.response);
              res.sendStatus(200);
              
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Error booking slot' });
  }
});

app.get('/get-slot', (req, res) => {
  const sql = `
    SELECT sb.*, vc.centerName 
    FROM slot_bookings sb 
    INNER JOIN vaccination_centers vc ON sb.centerId = vc.id 
    LIMIT 1
  `; 
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching slot booking:', err);
      res.status(500).json({ error: 'Error fetching slot booking' });
      return;
    }
    if (result.length === 0) {
      console.error('No slot booking found');
      res.status(404).json({ error: 'No slot booking found' });
      return;
    }
    res.json(result[0]);
  });
});


app.post('/get-ticket', async (req, res) => {
    const { centerId, name, dob, email, phone, slotDate, slotTime } = req.body;
  
    try {
      const centerQuery = 'SELECT centerName FROM vaccination_centers WHERE id = ?';
      db.query(centerQuery, [centerId], async (err, result) => {
        if (err) {
          console.error('Error fetching center data:', err);
          res.status(500).json({ error: 'Error fetching center data' });
          return;
        }
  
        if (result.length === 0) {
          console.error('Center not found');
          res.status(404).json({ error: 'Center not found' });
          return;
        }
  
        const ticketData = {
          centerName: result[0].centerName,
          name,
          dob,
          email,
          phone,
          slotDate,
          slotTime,
          centerId
        };
  
        res.json(ticketData);
      });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ error: 'Error fetching ticket' });
    }
  });
  


function calculateDosageBooked(dob) {
  const ageGroups = [
    { minAge: 0, maxAge: 18, dosageBooked: 1 }, 
    { minAge: 19, maxAge: 45, dosageBooked: 2 },
    { minAge: 46, maxAge: 65, dosageBooked: 3 }, 
    { minAge: 66, maxAge: Infinity, dosageBooked: 4 }
  ];

  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const ageGroup = ageGroups.find(group => age >= group.minAge && age <= group.maxAge);

  return ageGroup ? ageGroup.dosageBooked : 0;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
