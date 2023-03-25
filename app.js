const express = require('express');
const path = require('path');
const hbs = require("hbs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const session = require("express-session")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcryptjs = require("bcryptjs");
const crypto = require('crypto');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname , 'views'))

app.use(session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true
}));

// Serve the note page
app.get('/', (req, res) => {
  res.status(200).render('note');
});

app.get("/signup", (req ,res)=>{
    res.render('signup')
})
app.get("/login", (req ,res)=>{
  res.render('login')
});
app.get("/forgot_password", (req ,res)=>{
  res.render('forgot_password')
});
app.get("/termsofuse", (req ,res)=>{
  res.render('termsofuse')
});
app.get("/privacypolicy", (req ,res)=>{
  res.render('privacypolicy')
});
// Connect to MongoDB
mongoose.connect('mongodb+srv://sudhakarswaindelphic:XrXjQ3jsbdGEsHHS@delphic1.mfomzhe.mongodb.net/scratchpad?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Define user model
const User = mongoose.model('User', userSchema);

// Use body-parser middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }));

// Signup route
app.post('/signup', async (req, res) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).send('Email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create new user
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  // Save new user to database
  try {
    await user.save();
    res.send('User created successfully');
  } catch (error) {
    res.status(500).send(error);
  }
});
app.post('/signup', (req, res) => {
  const idToken = req.body.idToken;
  const CLIENT_ID = '398165584439-c8ah1893rb41it2vl1icqircp4ud83mg.apps.googleusercontent.com';
  const client = new OAuth2Client(CLIENT_ID);

  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, given_name, family_name } = payload;
      // Save user data to database and send response
  }
  verify().catch((error) => console.log(error));
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send('Invalid email or password');
  }

  // Check if password is correct
  const isPasswordValid = bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send('/Invalid email or password');
  }

  res.redirect('/');
  
});


// Define a route to handle the forgot password form submission
app.post('/forgot-password', (req, res) => {
  // Retrieve the email address from the request body
  const email = req.body.email;

  // Generate a password reset token
  const token = generateToken();
  

function generateToken() {
  // Generate a 32-byte random string
  const buffer = crypto.randomBytes(32);

  // Convert the buffer to a hex string
  const token = buffer.toString('hex');

  return token;
}


  // Store the token in the database, along with an expiration date
  storeToken(email, token, new Date(Date.now() + 3600000));

  // Create a nodemailer transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'jaquelin.brown@ethereal.email',
        pass: 'KPPpteXQcKkxr6PmmV'
    }
});

  // Define the email message
  const mailOptions = {
    from: 'getscratchpad.com>',
    to: email,
    subject: 'Reset Your Password',
    text: `Click the link below to reset your password: ${process.env.APP_URL}/reset-password?token=${token}`,
    html: `<p>Click the link below to reset your password:</p><p><a href="${process.env.APP_URL}/reset-password?token=${token}">${process.env.APP_URL}/reset-password?token=${token}</a></p>`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Failed to send email');
    } else {
      console.log('Email sent: ' + info.response);
      res.render('forgot-password-confirmation', {email});
    }
  });
});


// Start the server
app.listen(8000, () => {
    console.log('Server started on port 8000');
  });
