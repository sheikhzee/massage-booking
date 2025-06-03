import React, { useState } from 'react';
import {
  Container, TextField, Typography, Button, Box,
  Paper, Alert, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import emailjs from 'emailjs-com';

function App() {
  const [service, setService] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleBooking = async () => {
    if (!service || !date || !time || !email) {
      alert('Please fill out all fields including your email.');
      return;
    }

    // Generate Google Calendar Link
  const start = date.format("YYYYMMDD") + "T" + time.format("HHmm") + "00";
  const end = date.clone().add(1, 'hour').format("YYYYMMDDTHHmm00");
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Massage+Booking+-+${encodeURIComponent(service)}&dates=${start}/${end}&details=Massage+session+for+${encodeURIComponent(service)}+on+${date.format("YYYY-MM-DD")}+at+${time.format("HH:mm")}&location=Your+Massage+Studio`;

  
    // Save to Google Sheets
    try {
      await fetch("https://sheetdb.io/api/v1/YOUR_SHEETDB_API_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            service: service,
            date: date.format("YYYY-MM-DD"),
            time: time.format("HH:mm"),
            email: email
          }
        }),
      });
    } catch (err) {
      console.error("Error saving to Google Sheets", err);
    }
  
    // Email to client
    try {
      const clientParams = {
        to_email: email,
        service,
        date: date.format("YYYY-MM-DD"),
        time: time.format("HH:mm"),
        calendarLink
      };
  
      await emailjs.send(
        'service_q0i119k', // Your actual SERVICE ID
        'booking_confirmation_cli', // Template for client
        clientParams,
        'xzSuyhS5aQF5eSriw' // Your PUBLIC KEY (User ID)
      );
    } catch (err) {
      console.error("Error sending email to client:", err);
    }
  
    // Email to you
    try {
      const ownerParams = {
        to_email: 'sheikh.zee@outlook.com', // Replace with your real email
        service,
        date: date.format("YYYY-MM-DD"),
        time: time.format("HH:mm"),
        calendarLink
      };
  
      await emailjs.send(
        'service_q0i119k',
        'booking_notification_adm', // Template for you
        ownerParams,
        'xzSuyhS5aQF5eSriw'
      );
    } catch (err) {
      console.error("Error sending email to yourself:", err);
    }
  
    setConfirmed(true);
  };
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Book a Massage Session
          </Typography>

          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            {/* Service */}
            <FormControl fullWidth>
              <InputLabel id="service-label">Select Service</InputLabel>
              <Select
                labelId="service-label"
                value={service}
                label="Select Service"
                onChange={(e) => setService(e.target.value)}
              >
                <MenuItem value="Relaxation Massage">Relaxation Massage</MenuItem>
                <MenuItem value="Deep Tissue">Deep Tissue</MenuItem>
                <MenuItem value="Hot Stone">Hot Stone</MenuItem>
                <MenuItem value="Aromatherapy">Aromatherapy</MenuItem>
              </Select>
            </FormControl>

            {/* Email */}
            <TextField
              label="Your Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            {/* Date Picker */}
            <DatePicker
              label="Select Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            {/* Time Picker */}
            <TimePicker
              label="Select Time"
              value={time}
              onChange={(newValue) => setTime(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleBooking}
              sx={{ mt: 2 }}
            >
              Book Now
            </Button>

            {/* Confirmation Alert */}
            {confirmed && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Booking confirmed for <strong>{service}</strong> on <strong>{date?.format('YYYY-MM-DD')}</strong> at <strong>{time?.format('HH:mm')}</strong>. A confirmation email has been sent to <strong>{email}</strong>.
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}

export default App;
