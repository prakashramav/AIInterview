const express = require('express');
const router = express.Router();

router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Log to console as requested
  console.log('--- NEW CONTACT FORM SUBMISSION ---');
  console.log(`Name: ${name}`);
  console.log(`Email: ${email}`);
  console.log(`Message: ${message}`);
  console.log('-----------------------------------');
  
  res.status(200).json({ message: 'Success! Your message has been sent.' });
});

module.exports = router;
