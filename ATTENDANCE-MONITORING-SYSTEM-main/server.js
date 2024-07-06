const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const flash = require('express-flash');
const multer = require("multer");
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
// const csvParser = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const nodemailer = require('nodemailer');
require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 80;

const initializePassport = require("./passportConfig");
const { log } = require("console");

initializePassport(passport);

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
  },
});
const upload = multer({ storage }).single("image");
// const imageStorage = multer.diskStorage({
//   destination: './uploads/images',
//   filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
//   }
// });

// const upload = multer({ storage: imageStorage }).single('image');


const xlsxStorage = multer.diskStorage({
  destination: './uploads/xlsx',
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
  }
});

const xlsxUpload = multer({ storage: xlsxStorage }).single('xlsxFile');
// Middleware

// Parses details from a form
app.use(express.static('public'));
app.use(express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Function inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());
app.use(flash());

app.get("/", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});


app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.render("login", { message: "You have logged out successfully" });
  });
});

// Add a route for the common home route
app.get("/home", async (req, res) => {
  if (req.isAuthenticated()) {
    const userType = req.user.usertype;

    if (userType === "student") {
      const userId = req.user.user_id;

      try {
        // Execute the SQL query to retrieve student_id
        const studentResult = await pool.query('SELECT student_number FROM student WHERE user_id = $1', [userId]);
        const studentNumber = studentResult.rows[0].student_number;

        console.log(studentNumber);

        // Execute the query to retrieve attendance data directly using studentId
        const attendanceResult = await pool.query('SELECT * FROM student_attendance WHERE student_number = $1', [studentNumber]);
        const attendanceData = attendanceResult.rows;

        // Render the view with the data
        return res.render("parentsView.ejs", { data: attendanceData, studentNumber: studentNumber, userType: userType  });
      } catch (err) {
        console.error('Error:', err.stack);
        return res.status(500).send('Error retrieving data');
      }
    } else if (userType === "parent") {
      const userId = req.user.user_id;
      const studentId = req.query.studentId;
      try {
        // Retrieve parent_id from parent table
        const parentResult = await pool.query('SELECT parent_id FROM parent WHERE user_id = $1', [userId]);
        const parentId = parentResult.rows[0].parent_id;
    
        // Retrieve student_id and first_name from student table using parent_id
        const studentResult = await pool.query('SELECT student_number, first_name FROM student WHERE parent_id = $1', [parentId]);
        const studentData = studentResult.rows;
        //adi turuhayon an ma geget na attendance is kun ano an gin click ngadto han my user
        const attendanceResult = await pool.query('SELECT * FROM student_attendance WHERE student_number = $1', [studentId]);
        const data = attendanceResult.rows;
        

        

        return res.render("parentsView.ejs", { data: data, studentData: studentData, userType: userType });
      } catch (err) {
        console.error('Error:', err.stack);
        return res.status(500).send('Error retrieving data');
      }
    }
     else if (userType === "faculty") {
      const loggedInUserId = req.user.user_id;

      try {
        // Assuming there's a query to fetch faculty ID based on user ID
        const result = await pool.query('SELECT faculty_id FROM faculty WHERE user_id = $1', [loggedInUserId]);
        const facultyId = result.rows[0].faculty_id;

        // Now use the facultyId to query attendance
        const attendanceResult = await pool.query('SELECT * FROM faculty_attendance WHERE faculty_id = $1', [facultyId]);
        const data = attendanceResult.rows;

        // Render facultyHome.ejs with attendance data
        res.render("facultyHome.ejs", { data: data });
      } catch (err) {
        console.error('Error:', err.stack);
        return res.status(500).send('Error retrieving data');
      }
    } else {
      return res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
});



app.get("/schedule", checkNotAuthenticated(), (req, res) => {
  res.render("scheduleParents.ejs");
});
app.get("/account", (req, res) => {
  if (req.isAuthenticated()) {
    const userType = req.user.usertype;
    const userId = req.user.user_id;

    let query = '';
    switch (userType) {
      case 'student':
        query = 'SELECT * FROM student WHERE user_id = $1';
        break;
      case 'parent':
        query = 'SELECT * FROM parent WHERE user_id = $1';
        break;
      case 'faculty':
        query = 'SELECT * FROM faculty WHERE user_id = $1';
        break;
      default:
        return res.status(400).send('Invalid user type');
    }

    // Execute the query to retrieve account details
    pool.query(query, [userId], (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
        return res.status(500).send('Error retrieving account data');
      }

      const userData = result.rows[0]; // Assuming there's only one row returned
      if (!userData) {
        return res.status(404).send('User data not found');
      }

      // Render the view with the user data and user type
      return res.render("accountdetails.ejs", { user: userData, userType: userType });
    });
  } else {
    res.redirect("/"); // Redirect to login if user is not authenticated
  }
});

app.post('/account', (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user.user_id;
    const { firstName, lastName, studentNumber, recovery_email, address, age, gender, rfid_code } = req.body;

    let query = '';
    let queryParams = [firstName, lastName, recovery_email, address, age, gender, userId]; // Common parameters for all user types

    switch (req.user.usertype) {
      case 'student':
        query = 'UPDATE student SET first_name = $1, last_name = $2, student_number = $3, recovery_email = $4, address = $5, age = $6, gender = $7 WHERE user_id = $8';
        queryParams.splice(2, 0, studentNumber); // Insert studentNumber parameter at index 2
        break;
      case 'parent':
        query = 'UPDATE parent SET first_name = $1, last_name = $2, recovery_email = $3, address = $4, age = $5, gender = $6 WHERE user_id = $7';
        break;
      case 'faculty':
        query = 'UPDATE faculty SET first_name = $1, last_name = $2, recovery_email = $3, address = $4, age = $5, gender = $6 WHERE user_id = $7';
       
        break;
      default:
        return res.status(400).send('Invalid user type');
    }

    pool.query(query, queryParams, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Error updating account data');
      }

      res.redirect('/account');
    });
  } else {
    res.redirect("/");
  }
});






app.get('/studenthome', checkNotAuthenticated(), async (req, res) => {
  const userId = req.user.user_id;
  const facultyQuery = 'SELECT faculty_id FROM faculty WHERE user_id = $1'; // Corrected SQL query
  const facultyValues = [userId]; // Renamed variable to avoid conflict
  const facultyResult = await pool.query(facultyQuery, facultyValues); // Executing the query
  
  const facultyId = facultyResult.rows[0].faculty_id; // Extracting faculty_id from the result

  const studentQuery = 'SELECT * FROM student_list WHERE faculty_id = $1';
  const studentValues = [facultyId];
  
  try {
    const results = await pool.query(studentQuery, studentValues);
    
    // Retrieve the list of subjects for the specific user
    const subjectQuery = 'SELECT * FROM subject WHERE faculty_id = $1';
    const subjectValues = [facultyId];
    const subjectResults = await pool.query(subjectQuery, subjectValues);
    
    res.render('studentHome.ejs', { data: results.rows, subjectList: subjectResults.rows });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).send("Error fetching student data");
  }
});


app.get("/MySubject", checkNotAuthenticated(), async (req, res) => {
  try {
    // Get the user_id from req.body.user.user_id
    const user_id = req.user.user_id;

    // Query to fetch faculty_id associated with the user_id
    const facultyQuery = 'SELECT faculty_id FROM faculty WHERE user_id = $1';
    const facultyResult = await pool.query(facultyQuery, [user_id]);

    // Extract the faculty_id from the result
    const faculty_id = facultyResult.rows[0].faculty_id;

    // Query to fetch subjects associated with the faculty_id
    const subjectQuery = 'SELECT * FROM subject WHERE faculty_id = $1';
    const subjectResult = await pool.query(subjectQuery, [faculty_id]);

    // Extract the subjects from the result
    const subjects = subjectResult.rows;

    // Render the Mysubject.ejs template and pass the subjects data to it
    res.render("Mysubject.ejs", { subjects: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'An error occurred while fetching subjects' });
  }
});
app.post('/updateSubject', async (req, res) => {
  const { id, rfid_code, section, subject } = req.body;
  let selectedDays = req.body['editDays']; // Assuming 'days[]' is the name attribute
  const startTime = req.body['start-time'];
  const endTime = req.body['end-time'];

  // Format start and end time to 'HH:mm A' with leading zero for hour if necessary
  const formattedStartTime = moment(startTime, 'HH:mm').format('hh:mm A');
  const formattedEndTime = moment(endTime, 'HH:mm').format('hh:mm A');

  try {
    // Join selected days into a range string
    if (selectedDays.length > 1) {
      selectedDays = selectedDays[0] + ' - ' + selectedDays[selectedDays.length - 1];
    }

    // Update the RFID code, subject, and days for the specified ID
    const updateQuery = 'UPDATE subject SET rfid_code = $1, subject_name = $2, section = $3, day = $4, time_start = $5, time_end = $6 WHERE id = $7';
    await pool.query(updateQuery, [rfid_code, subject, section, selectedDays, formattedStartTime, formattedEndTime, id]);

    res.redirect('/MySubject');
  } catch (error) {
    console.error('Error updating RFID code and subject:', error);
    res.status(500).json({ error: 'An error occurred while updating RFID code and subject' });
  }
});




app.get('/forgot-password', (req, res) => {
  res.render('forgot-password' );
});




app.post("/register", async (req, res) => {
  let { username, password, password2, usertype, firstname, lastname, student_number, recovery_email, address, age, gender } = req.body;
  
  let errors = [];

  if (!username || !password || !password2) {
      errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
      errors.push({ message: "Password must be at least 6 characters long" });
  }

  if (password !== password2) {
      errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
      res.render("register", { errors, username, password, password2 });
  } else {
      try {
          let hashedPassword = await bcrypt.hash(password, 10);

          pool.query(
              `SELECT * FROM users
              WHERE username = $1`,
              [username],
              (err, results) => {
                  if (err) {
                      console.log(err);
                  }

                  if (results.rows.length > 0) {
                      return res.render("register", {
                          message: "Username already registered"
                      });
                  } else {
                      // Insert into users table
                      pool.query(
                          `INSERT INTO users (username, password, usertype)
                          VALUES ($1, $2, $3)
                          RETURNING user_id`,
                          [username, hashedPassword, usertype],
                          (err, results) => {
                              if (err) {
                                  throw err;
                              }
                              const userId = results.rows[0].user_id;

                              // Insert into appropriate table based on usertype
                              switch (usertype) {
                                  case 'student':
                                      pool.query(
                                          `INSERT INTO student (user_id, first_name, last_name, student_number, recovery_email, address, age, gender)
                                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                                          [userId, firstname, lastname, student_number, recovery_email, address, age, gender],
                                          (err, results) => {
                                              if (err) {
                                                  throw err;
                                              }
                                              req.flash("success_msg", "You are now registered. Please log in");
                                              res.redirect("/");
                                          }
                                      );
                                      break;
                                      case 'parent':
                                        // Insert into parent table directly
                                        pool.query(
                                            `INSERT INTO parent (user_id, first_name, last_name, recovery_email, address, age, gender)
                                            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                            [userId, firstname, lastname, recovery_email, address, age, gender],
                                            (err, results) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                req.flash("success_msg", "You are now registered. Please log in");
                                                res.redirect("/");
                                            }
                                        );
                                        break;
                                    
                                  case 'faculty':
                                      pool.query(
                                          `INSERT INTO faculty (user_id, first_name, last_name, recovery_email, address, age, gender)
                                          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                                          [userId, firstname, lastname, recovery_email, address, age, gender],
                                          (err, results) => {
                                              if (err) {
                                                  throw err;
                                              }
                                              req.flash("success_msg", "You are now registered. Please log in");
                                              res.redirect("/");
                                          }
                                      );
                                      break;
                                  default:
                                      req.flash("error_msg", "Invalid user type");
                                      res.redirect("/register");
                              }
                          }
                      );
                  }
              }
          );
      } catch (error) {
          console.error("Error hashing password:", error);
          res.status(500).send("Internal Server Error");
      }
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true
  })
);


app.put('/updateStudent', (req, res) => {
  const { id, rfidCode, studentNumber, studentName, subject, year, section, gender } = req.body;

  const query = `
    UPDATE student_list
    SET rfid_code = $2, student_number = $3, student_name = $4, subject = $5, year = $6, section = $7, gender = $8
    WHERE id = $1
    RETURNING *;
  `;

  const values = [id, rfidCode, studentNumber, studentName, subject, year, section, gender];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows[0]); // Send the updated data back to the client
    }
  });
});

app.post('/deleteStudent', (req, res) => {
  const { rfidCode } = req.body;

  if (!rfidCode) {
    return res.status(400).json({ error: 'RFID code is required' });
  }

  pool.query('DELETE FROM student_list WHERE rfid_code = $1', [rfidCode], (error, results) => {
    if (error) {
      console.error('Error executing delete query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Delete operation successful' });
    }
  });
});




//iribahon pain pag mayda na hardware dapat mayda specific na id kun ano an madedelete na attendance data mabutang ngahaw hin where id = $1
app.post('/clearData', (req, res) => {
  const userId = req.user.user_id;

  // Query to get faculty_id based on user_id
  const facultyQuery = 'SELECT faculty_id FROM faculty WHERE user_id = $1';
  const facultyValues = [userId];

  pool.query(facultyQuery, facultyValues, (facultyError, facultyResults) => {
    if (facultyError) {
      console.error('Error executing faculty query:', facultyError);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Check if faculty record exists for the user_id
    if (facultyResults.rows.length === 0) {
      console.error('No faculty record found for user_id:', userId);
      res.status(404).json({ error: 'Faculty record not found' });
      return;
    }

    // Get faculty_id from the result
    const facultyId = facultyResults.rows[0].faculty_id;

    // Delete attendance records based on faculty_id
    const deleteQuery = 'DELETE FROM faculty_attendance WHERE faculty_id = $1';
    const deleteValues = [facultyId];

    pool.query(deleteQuery, deleteValues, (deleteError, deleteResults) => {
      if (deleteError) {
        console.error('Error executing delete query:', deleteError);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        console.log('Attendance records deleted successfully for faculty_id:', facultyId);
        res.json({ message: 'Attendance records deleted successfully' });
      }
    });
  });
});



app.post('/addStudent', upload, async (req, res) => {
  const loggedInUserId = req.user.user_id;

  const { rfid, studentNo, studentName, year, section, subject, gender } = req.body;

  try {
    // Query the faculty_id based on the user_id
    const facultyIdQuery = await pool.query(
      `SELECT faculty_id FROM faculty WHERE user_id = $1`,
      [loggedInUserId]
    );

    // Extract the faculty_id from the result
    const facultyId = facultyIdQuery.rows[0].faculty_id;

    // Insert the student record with the retrieved faculty_id
    const result = await pool.query(
      `INSERT INTO student_list (rfid_code, student_number, student_name, year, section, subject, gender, faculty_id, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [rfid, studentNo, studentName, year, section, subject, gender, facultyId, req.file.filename]
    );

    console.log('Student added successfully:', result.rows[0]);

    res.redirect('/studenthome');
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).send('Internal Server Error');
  }
});



//updated to also delete the pictures on uploads
app.post('/delete/:id', async (req, res) => {
  const studId = req.params.id;

  try {
    // Retrieve the filename of the image associated with the student
    const imageQuery = await pool.query('SELECT image FROM student_list WHERE id = $1', [studId]);
    const filename = imageQuery.rows[0].image;

    // Delete the image file from the uploads directory
    const filePath = path.join(__dirname, 'uploads', filename);
    fs.unlinkSync(filePath);

    // Delete the student record from the database
    await pool.query('DELETE FROM student_list WHERE id = $1', [studId]);
    
    res.status(200).json({ message: 'Record deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'An error occurred while deleting the record' });
  }
});



app.post('/updateStudent', checkNotAuthenticated(), upload, async (req, res) => {
  const { id, rfid_code, student_number, student_name, subject, year, section, gender } = req.body;

  try {
    const result = await pool.query(
      `UPDATE student_list 
       SET rfid_code = $1, student_number = $2, student_name = $3, subject = $4, year = $5, section = $6, gender = $7, image =$8
       WHERE id = $9`,
      [rfid_code, student_number, student_name, subject, year, section, gender, req.file.filename, id]
    );
  
    console.log('Updated successfully:', result.rowCount);

    res.redirect('/studenthome');
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Internal Server Error');
  }
});
/////experimental
app.post('/forgot-password', async (req, res) => {
  try {
    const { recovery_email } = req.body;

    function generateShortUuid() {
      // Generate a UUID
      const uuid = uuidv4();
      // Convert UUID to base64 and take the first 5 characters
      const shortUuid = Buffer.from(uuid).toString('base64').slice(0, 5);
      return shortUuid;
    }

    // Combine results from parent, student, and faculty tables
    const combinedResult = await pool.query(`
      SELECT user_id FROM parent WHERE recovery_email = $1
      UNION ALL
      SELECT user_id FROM student WHERE recovery_email = $1
      UNION ALL
      SELECT user_id FROM faculty WHERE recovery_email = $1
    `, [recovery_email]);

    // Check if any user with the recovery email exists
    if (combinedResult.rows.length === 0) {
      return res.render('forgot-password', { error: 'User not found' });
    }

    // Get the first user_id from the combined result
    const userId = combinedResult.rows[0].user_id;

    // Generate reset token
    const resetToken = generateShortUuid();

    // Save reset token in the users table
    await pool.query(`UPDATE users SET reset_token = $1 WHERE user_id = $2`, [resetToken, userId]);

    // Send reset token to the user's recovery email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'attendancemonitoringfl@gmail.com',
        pass: 'pvjd ewdt lhfy oecc'
      }
    });

    const mailOptions = {
      from: 'attendancemonitoringfl@gmail.com',
      to: recovery_email,
      subject: 'Password Reset',
      text: `Your password reset token is: ${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    res.redirect(`/check-token?token=${resetToken}&message=Reset token sent successfully`);
  } catch (err) {
    console.error('Error processing forgot password request:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/check-token', (req, res) => {
  // const token = req.query.token;// dre ko n hya ginagamit kay tak kinukuha an input man han user
  const message = req.query.message;
  res.render('check-token', { message }); // Render the reset password form with the token
});
app.post('/check-token', async (req, res) => {
  const {reset_token} = req.body

  try {
      // Query the database to find the user by reset token
      const result = await pool.query('SELECT * FROM users WHERE reset_token = $1', [reset_token]);
      const user = result.rows[0];

      if (!user) {
          // Render an EJS template with an error message for invalid or expired token
          req.flash('error', 'Invalid or expired token');
          // Redirect back to the current route
          return res.redirect(req.originalUrl);
          // return res.render('', { error: 'Invalid or expired token' });
      }

      // If token is found in the database, render another EJS template
      res.redirect(`/set-password?token=${reset_token}&message=Reset token is valid`);
      // return res.render('set-password',  { reset_token });

  } catch (error) {
      console.error('Error resetting password:', error);
      // Render an EJS template with an error message for internal server error
      return res.render('error', { errorMessage: 'Error resetting password' });
  }
});
app.get('/set-password', (req, res) => {
  const token = req.query.token;
  const message = req.query.message;
  // Render the set-password view
  res.render('set-password', { token,  message });
});

app.post('/set-password', async (req, res) => {
  const { new_password, confirm_password, token } = req.body; // Retrieve token from request body

  // Validate if passwords match
  if (new_password !== confirm_password) {
    // Store error message in flash
    req.flash('error', 'Passwords do not match');
    // Redirect back to the current route
    return res.redirect(req.originalUrl);
}
if (new_password.length < 6) {
  req.flash('error', 'Password must be at least 6 characters long');
  return res.redirect(req.originalUrl);
  // errors.push({ message: "Password must be at least 6 characters long" });
}


  try {
      // Hash the new password before storing it in the database
      const hashedPassword = await bcrypt.hash(new_password, 10); // You can adjust the salt rounds as needed

      // Update the user's password in the database where reset_token matches
      const result = await pool.query('UPDATE users SET password = $1 WHERE reset_token = $2 RETURNING *', [hashedPassword, token]);
      const user = result.rows[0];

      if (!user) {
        req.flash('error', 'Invalid or expired token');
        return res.redirect(req.originalUrl);
         
      }

      console.log(`Password reset for user with email ${user.email}. New password: ${new_password}`);
      req.flash('success_msg', 'Password reset successfully');
      res.redirect('/');
  } catch (error) {
      console.error('Error setting new password:', error);
      res.status(500).send('Error setting new password');
  }
});



app.get('/rfid', async (req, res) => {
  try {
    const result = await pool.query("SELECT rfid_code FROM rfid");
    const rfidData = result.rows.map(row => row.rfid_code);
    res.json(rfidData);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});





app.get("/MySubject", checkNotAuthenticated(), async (req, res) => {
  try {
    // Query to fetch all data from the subject table
    const query = 'SELECT * FROM subject';

    // Execute the query
    const result = await pool.query(query);

    // Extract the rows from the result
    const subjects = result.rows;

    // Render the Mysubject.ejs template and pass the subjects data to it
    res.render("Mysubject.ejs", { subjects: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'An error occurred while fetching subjects' });
  }
});
app.post('/updateSubject', async (req, res) => {
  const { id, rfid_code, subject, section } = req.body;

  try {
    // Update the RFID code and subject for the specified ID
    const updateQuery = 'UPDATE subject SET rfid_code = $1, subject_name = $2, section = $3 WHERE id = $4';
    await pool.query(updateQuery, [rfid_code, subject, section, id]);

    res.redirect('/MySubject');
  } catch (error) {
    console.error('Error updating RFID code and subject:', error);
    res.status(500).json({ error: 'An error occurred while updating RFID code and subject' });
  }
});
app.post('/addSubject', async (req, res) => {
  const { rfid_code, subjectName, section } = req.body;
  let selectedDays = req.body['days']; // Assuming 'days[]' is the name attribute
  const userId = req.user.user_id;
  const startTime = req.body['start-time'];
  const endTime = req.body['end-time'];

  // Format start and end time to 'HH:mm A' with leading zero for hour if necessary
  const formattedStartTime = moment(startTime, 'HH:mm').format('hh:mm A');
  const formattedEndTime = moment(endTime, 'HH:mm').format('hh:mm A');

  console.log(userId, rfid_code, subjectName);
  console.log('Selected days:', selectedDays, startTime, endTime);

  try {
    // Query the faculty_id based on the user_id
    const selectQuery = 'SELECT faculty_id FROM faculty WHERE user_id = $1';
    const { rows } = await pool.query(selectQuery, [userId]);

    if (rows.length === 0) {
      // If no faculty_id found for the user_id, handle the error
      return res.status(404).json({ error: 'No faculty found for the user' });
    }

    const facultyId = rows[0].faculty_id;

    // Join selected days into a range string
    if (selectedDays.length > 1) {
      selectedDays = selectedDays[0] + ' - ' + selectedDays[selectedDays.length - 1];
    }

    // Insert the RFID code and subject using the faculty_id
    const insertQuery = 'INSERT INTO subject (faculty_id, rfid_code, subject_name, section, time_start, time_end, day) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    await pool.query(insertQuery, [facultyId, rfid_code, subjectName, section, formattedStartTime, formattedEndTime, selectedDays]);

    // Redirect to student home after successful insertion
    res.redirect('/MySubject');
    // res.status(200).json({ message: 'RFID code inserted successfully' });
  } catch (error) {
    console.error('Error inserting RFID code:', error);
    res.status(500).json({ error: 'An error occurred while inserting RFID code' });
  }
});



app.post('/deleteSubject', async (req, res) => {
  const { id } = req.body;

  try {
    // Delete the subject with the specified ID
    const deleteQuery = 'DELETE FROM subject WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    // Flash success message
    req.flash('success', 'Subject deleted successfully');

    // Redirect to studenthome route
    res.redirect('/MySubject');

  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'An error occurred while deleting subject' });
  }
});

// Handle XLSX upload POST request
app.post('/upload/xlsx', xlsxUpload, async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No XLSX file uploaded.');
  }

  const loggedInUserId = req.user.user_id; // Assuming req.user.user_id contains the user ID

  // Query to get the facultyId from loggedInUserId
  const getFacultyIdQuery = `
    SELECT faculty_id FROM faculty WHERE user_id = $1
  `;

  try {
    const client = await pool.connect();

    // Fetch facultyId
    const facultyIdResult = await client.query(getFacultyIdQuery, [loggedInUserId]);
    const facultyId = facultyIdResult.rows[0].faculty_id;

    // Proceed with data processing
    const xlsxFilePath = req.file.path;
    const workbook = xlsx.readFile(xlsxFilePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract subject from header row
    const subjectIndex = 4; // Assuming subject is in the fifth column (zero-based index)
    const subject = rows[0][subjectIndex];

    // Insert student data into the database
    await Promise.all(rows.slice(1).map(async (row) => {
        // Separate year and section from the provided string
        const year = row[3] ? row[3].split(' ')[0] : null;
        const section = row[3] ? row[3].split(' ')[1] : null;

        // Insert row into database with the extracted subject and facultyId
        const query = `
            INSERT INTO student_list (student_number, student_name, year, section, subject, gender, faculty_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await client.query(query, [
            row[1], // Assuming student_number is in the second column
            row[2], // Assuming name is in the third column
            year,   // Extracted year
            section,// Extracted section
            row[4], // Inserting subject directly from Excel file
            row[5], // Assuming gender is in the sixth column
            facultyId // Inserting facultyId
        ]);
    }));

    client.release();
    res.redirect('/studenthome');
  } catch (error) {
    console.error('Error uploading XLSX file:', error);
    res.status(500).send('Error uploading XLSX file.');
  }
});









let activeTeacherId = null; // To store the active teacher's ID
let classSession = null
app.post("/attendance", async (req, res) => {
  const rfidCode = req.body.rfid_code;

  // Fetch current date and time from the server
  const currentTime = req.body.current_time;
  const currentDate = req.body.current_date;
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });//for queryig subject
  // const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
  // const currentDate = new Date().toDateString();

 console.log(rfidCode, currentTime, currentDate, currentDay);

  try {
    // Query the faculty table to get teacher data based on rfid_code
    const facultyQueryResult = await pool.query(
      'SELECT * FROM subject WHERE rfid_code = $1 AND day LIKE $2 AND time_start <= $3 AND time_end >= $4',
      [rfidCode, `%${currentDay}%`, currentTime, currentTime]
    );



console.log(facultyQueryResult);
    if (facultyQueryResult.rows.length > 0) {
      // Teacher found, store the active teacher's ID
      section = facultyQueryResult.rows[0].section
      classSession = facultyQueryResult.rows[0].rfid_code;
      activeTeacherId = facultyQueryResult.rows[0].faculty_id;
      activeSubject = facultyQueryResult.rows[0].subject_name;
      res.json({ teacher_authenticated: true });
      
      // Reset activeTeacherId to null after 1 hour
      setTimeout(() => {
        classSession = null
        console.log('Active teacher session ended');
        updateAbsentStudents(activeTeacherId,  activeSubject, currentDate, section );
      }, 30000); // 1 hour in milliseconds (1000 ms * 60 sec * 60 min)
    } else {
      // Query the student_list table to get student data based on rfid_code
      const studentQueryResult = await pool.query('SELECT * FROM student_list WHERE rfid_code = $1 AND faculty_id = $2', [rfidCode, activeTeacherId]);

      // Extract student data from the query result
      const studentData = studentQueryResult.rows[0];

      if (studentData) {
        // Check if student has already been marked present for the current date by the active teacher
        const existingAttendanceResult = await pool.query('SELECT * FROM faculty_attendance WHERE date = $1 AND student_number = $2 AND faculty_id = $3', [currentDate, studentData.student_number, activeTeacherId]);

        if (existingAttendanceResult.rows.length === 0) {
          // Insert attendance record into the attendance table
          if ( classSession) {
            if(activeSubject){
                       //dnhe dapat ibutang ko nga where activesubject para kun hno man ngadto student_list dre kaka insert ha attendance it wra subject nga yada
                       await pool.query('INSERT INTO faculty_attendance (time, date, fullname, year, section, student_number, faculty_id, subject) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                       [currentTime, currentDate, studentData.student_name, studentData.year, studentData.section, studentData.student_number, activeTeacherId, activeSubject]);
                   
                   // Insert into student attendance
                   await pool.query('INSERT INTO student_attendance (time, date, fullname, year, section, student_number, subject) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                       [currentTime, currentDate, studentData.student_name, studentData.year, studentData.section, studentData.student_number, activeSubject]);
            // Send success response
            res.json({ name: studentData.student_name, teacher_id: activeTeacherId });
          } 
            }
            // Associate attendance with the active teacher
           else {
            res.status(400).json({ error: 'No active teacher' });
                    // Insert RFID data into the rfid table (ignore if already exists)
        await pool.query("INSERT INTO rfid (rfid_code) VALUES ($1) ON CONFLICT DO NOTHING", [rfidCode]);
        console.log('RFID data inserted successfully:', rfidCode);

        // Delete RFID data after 10 seconds (if it exists)
        setTimeout(async () => {
          await pool.query("DELETE FROM rfid WHERE rfid_code = $1", [rfidCode]);
          console.log('RFID data deleted successfully:', rfidCode);
        }, 4000);
            
          }
        } else {
          // Attendance already exists for the student on the current date by the active teacher
          res.status(400).json({ error: 'Attendance already marked for the student on the current date by the active teacher' });
        }
      } else {
        // Student not found
        res.status(404).json({ error: 'Student data not found for the provided RFID code', rfid_code: rfidCode });
        
        // Insert RFID data into the rfid table (ignore if already exists)
        await pool.query("INSERT INTO rfid (rfid_code) VALUES ($1) ON CONFLICT DO NOTHING", [rfidCode]);
        console.log('RFID data inserted successfully:', rfidCode);

        // Delete RFID data after 10 seconds (if it exists)
        setTimeout(async () => {
          await pool.query("DELETE FROM rfid WHERE rfid_code = $1", [rfidCode]);
          console.log('RFID data deleted successfully:', rfidCode);
        }, 4000);
      }
    }
    
  } catch (error) {
    // Error handling
    console.error('Error processing attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
async function updateAbsentStudents(activeTeacherId, activeSubject, currentDate, section) {
  try {
    console.log(activeSubject, activeTeacherId, currentDate);
    
    // Query all students who have the specified subject but are not marked present for the current date
    const absentStudentsResult = await pool.query(
      `SELECT student_list.student_number
      FROM student_list
      LEFT JOIN faculty_attendance ON student_list.student_number = faculty_attendance.student_number
                                     AND student_list.year = faculty_attendance.year
                                     AND student_list.section = faculty_attendance.section
      WHERE faculty_attendance.date IS NULL
        AND student_list.subject = $1
        AND student_list.section = $2;`,
      [activeSubject, section]
    );

    console.log('Absent students:', absentStudentsResult.rows);

    // Update absences for each absent student
    for (const student of absentStudentsResult.rows) {
      const result = await pool.query('UPDATE student_list SET absences = COALESCE(absences, 0) + 1 WHERE student_number = $1', [student.student_number]);
      console.log('Update result:', result.rowCount); // Log the number of rows updated
    }

    console.log('Absences updated for absent students');
  } catch (error) {
    console.error('Error updating absences for absent students:', error);
  }
}


















// POST route to validate and insert parent_id into student table
app.post('/add-student', async (req, res) => {
  const { studentNumber } = req.body;
  const userId = req.user.user_id; // Assuming user_id is accessible like this

  try {
    // Get parent_id from parent table using user_id
    const getParentIdQuery = 'SELECT parent_id FROM parent WHERE user_id = $1';
    const parentResult = await pool.query(getParentIdQuery, [userId]);
    const parentId = parentResult.rows[0].parent_id;

    // Check if student exists
    const checkStudentQuery = 'SELECT student_id FROM student WHERE student_number = $1';
    const studentResult = await pool.query(checkStudentQuery, [studentNumber]);

    if (studentResult.rows.length === 0) {
      // Student not found, redirect back to the previous page with an error message
      req.flash('error', 'Student not found');
      return res.redirect('/home');
    }

    // Insert parent_id into student table where student_number matches
    const updateStudentQuery = 'UPDATE student SET parent_id = $1 WHERE student_number = $2';
    await pool.query(updateStudentQuery, [parentId, studentNumber]);

    // Redirect to the home page with a success message
    req.flash('success', 'Student added successfully');
    return res.redirect('/home'); // Return here to prevent further execution
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send('Internal Server Error');
  }
});




//kuruanon pa an dropdown





// Endpoint for inserting attendance





function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/facultyhome");
  }
  next();
}

function checkNotAuthenticated() {
  return function(req, res, next){
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
