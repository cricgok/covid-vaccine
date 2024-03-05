const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gokulramesh033@gmail.com',
    pass: 'xusm ejxu lilv ajpx' 
  }
});

const twilioClient = twilio('ACa0aba34c1829cbc54f9a12f55a2d36f2', '06e258bf19d3fdd5a998b82410f674ef');

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

app.get('/api/check-db-connection', (req, res) => {
  if (db.state === 'authenticated') {
    res.json({ connected: true });
  } else {
    res.json({ connected: false });
  }
});

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

app.post('/book-slot', (req, res) => {
  const { centerId, name, dob, phone, email, slotDate, slotTime } = req.body;

  // Insert booking data into database
  const sqlInsertBooking = 'INSERT INTO slot_bookings (centerId, name, dob, phone, email, slotDate, slotTime) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const sqlUpdateCounts = 'UPDATE vaccination_centers SET availableDosage = availableDosage - 1, availableSlots = availableSlots - 1 WHERE id = ?';

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error beginning transaction:', err);
      res.status(500).json({ error: 'Error booking slot' });
      return;
    }

    db.query(sqlInsertBooking, [centerId, name, dob, phone, email, slotDate, slotTime], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting booking data into database:', insertErr);
        db.rollback(() => {
          res.status(500).json({ error: 'Error booking slot' });
        });
        return;
      }

      db.query(sqlUpdateCounts, [centerId], (updateErr, result) => {
        if (updateErr) {
          console.error('Error updating counts in database:', updateErr);
          db.rollback(() => {
            res.status(500).json({ error: 'Error booking slot' });
          });
          return;
        }

        db.commit((commitErr) => {
          if (commitErr) {
            console.error('Error committing transaction:', commitErr);
            db.rollback(() => {
              res.status(500).json({ error: 'Error booking slot' });
            });
            return;
          }
          console.log('Booking data inserted into database successfully');

          // Send email
          const mailOptions = {
            from: 'gokulramesh033@gmail.com', // Your Gmail email address
            to: email,
            subject: 'Vaccination Slot Booking Confirmation',
            text: `Dear ${name},\n\nYour vaccination slot at ${slotTime} on ${slotDate} has been successfully booked.\n\nRegards,\nYour Vaccination Center`
          };
          transporter.sendMail(mailOptions, (emailErr, info) => {
            if (emailErr) {
              console.error('Error sending email:', emailErr);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          const whatsappMessage = `Dear ${name},\n\nYour vaccination slot at ${slotTime} on ${slotDate} has been successfully booked.\n\nRegards,\nYour Vaccination Center`;
          twilioClient.messages.create({
            body: whatsappMessage,
            from: '+12248585173',
            to: `+${phone}` // Recipient's phone number with country code (e.g., +1234567890)
          }).then((message) => console.log('WhatsApp message sent: ', message.sid))
            .catch((whatsappErr) => console.error('Error sending WhatsApp message:', whatsappErr));

          res.sendStatus(200);
        });
      });
    });
  });
});

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
