const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');
const config = require('../config');
const jwt = require('jsonwebtoken');

const pool = new Pool(config.db);

passport.use(new GoogleStrategy({
    clientID: config.google.clientId,
    clientSecret: config.google.clientSecret,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with google_id
      let userResult = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
      let user = userResult.rows[0];

      if (user) {
        // User found, return user
        return done(null, user);
      } else {
        // No user with google_id, check by email
        userResult = await pool.query('SELECT * FROM users WHERE email = $1', [profile.emails[0].value]);
        user = userResult.rows[0];

        if (user) {
          // User found by email, link Google ID
          await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [profile.id, user.id]);
          return done(null, user);
        } else {
          // Create new user
          const newUserResult = await pool.query(
            'INSERT INTO users (first_name, last_name, email, google_id, role, password_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
            [profile.name.givenName, profile.name.familyName, profile.emails[0].value, profile.id, 'client', '']
          );
          return done(null, newUserResult.rows[0]);
        }
      }
    } catch (err) {
      return done(err, false);
    }
  }
));

// Passport serialization/deserialization (for session management, though we use JWT for auth)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, userResult.rows[0]);
  } catch (err) {
    done(err, false);
  }
});

module.exports = passport;
