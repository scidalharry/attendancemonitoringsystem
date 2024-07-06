const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (username, password, usertype, done) => {
    console.log(username, password, usertype);
    pool.query(
      `SELECT * FROM users WHERE username = $1 AND usertype = $2`,
      [username, usertype],
      (err, results) => {
        if (err) {
          return done(err);
        }

        if (results.rows.length > 0) {
          const user = results.rows[0];

          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password is incorrect" });
            }
          });
        } else {
          return done(null, false, {
            message: "No user with that username and user type"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, username, password, done) => {
        const usertype = req.body.usertype; // Adjust this based on your actual form field name
        authenticateUser(username, password, usertype, done);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.user_id); // Serialize user_id into session
  });

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE user_id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      if (results.rows.length === 0) {
        return done(new Error('User not found'));
      }
      const user = results.rows[0];
      console.log(`ID is ${user.user_id}`);
      return done(null, user);
    });
  });
}

module.exports = initialize;
