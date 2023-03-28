const express = require('express');
const path = require('path');
const hbs = require("hbs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcryptjs = require("bcryptjs");
const crypto = require('crypto');
const passport = require('passport');
require('dotenv').config();
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname , 'views'))

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

app.get("/navbar" ,(req , res)=>{
  res.render('navbar');
});
app.get("/profile" , (req , res)=>{
  res.render('profile');
})

// Connect to MongoDB
mongoose.connect('mongodb+srv://sudhakarswaindelphic:XrXjQ3jsbdGEsHHS@delphic1.mfomzhe.mongodb.net/scratchpad?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



// Define user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  fullname : String ,

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
// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // find the user with the given email
    const user = await User.findOne({ email });

    if (!user) {
      // handle invalid email error
      res.status(401).send('Invalid email or password');
    } else {
      // compare the password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // successful login, redirect to home page
        res.redirect('/note');
      } else {
        // handle invalid password error
        res.status(401).send('Invalid email or password');
      }
    }
  } catch (err) {
    // handle database error
    res.status(500).send('Internal server error');
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    // find user in MongoDB by username
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      // compare password hash using bcrypt
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) { return done(err); }
        if (!result) { return done(null, false); }
        return done(null, user);
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/note');
};

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
  function storeToken(email, token, expiration) {
  const collection = User.collection('password_reset_tokens');
  collection.updateOne({ email }, { email, token, expiration }, { upsert: true }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Token stored in the database');
    }
  });
}

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


// Generate a salt value using the bcrypt algorithm
const saltRounds = 10;
bcrypt.genSalt(saltRounds, (err, salt) => {
  if (err) {
    console.error('Error generating salt:', err);
    return;
  }

  // Print the salt value
  console.log('BCRYPT_SALT:', salt);
});



// Start the server
app.listen(8000, () => {
    console.log('Server started on port 8000');
  });
