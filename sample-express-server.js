//Global variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const sqlite3 = require('sqlite3').verbose()
var path = require('path');
var fs = require('fs');

//Application
const app = express();

//Cors Options
var corsOptions = {
    "origin": ["http://localhost:8080", "http://10.0.0.87:8080", "http://localhost:8081"],
    "methods": "GET,POST,PUT,PATCH,DELETE",
    "preflightContinue": false
}

//Application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist/spa/')));
app.use(cors(corsOptions))

//This key is used to authenticate against the JWT. 
//DO NOT SHARE
app.set('secretKey', '');

//Authentication middleware
const tokenAuthentication = (req, res, next) => {
	//Header schema: Bearer: 'Token'
    const authorizationHeader = req.headers.authorization;

    // If there is an auth header. If not, user is not logged in.
    if (authorizationHeader) {
    	//Split in the white space between header and token to retrieve just the token
        const token = authorizationHeader.split(' ')[1];

    	//Verifys the integrity of the token
        jwt.verify(token, app.get("secretKey"), (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            //Sends user information back to the client.
            req.userInformation = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// Database
let db = new sqlite3.Database('', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.get('/', (req, res) => {
    res.sendStatus(200)
})

app.get('/clients', tokenAuthentication, (req, res) => {
    let sql = "SELECT * FROM clients;"

    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        console.log(rows)
        res.send(rows)
      });
})

app.get('/properties', tokenAuthentication, (req, res) => {
    let sql = "SELECT * FROM properties;"

    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        console.log(rows)
        res.send(rows)
      });
})

app.get('/property', tokenAuthentication, (req, res) => {
    let sql = "SELECT client_id, first_name, last_name FROM clients;"

    db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        console.log(rows)
        res.send(rows)
      });
})

app.get('/addclients', tokenAuthentication, (req, res) => {
    res.sendStatus(200)
})

app.post('/addclients', tokenAuthentication, (req, res) => {
    db.run(`INSERT INTO clients(first_name, last_name, email, phone_number, 
        company, address_one, address_two, city, state, zipcode) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [req.body.firstName, req.body.lastName, req.body.email, req.body.phoneNumber, 
        req.body.company, req.body.address, req.body.address2, req.body.city, req.body.state, req.body.zipcode], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
    res.sendStatus(200)
})

app.post('/addproperty', tokenAuthentication, (req, res) => {
    db.run(`INSERT INTO properties(address_one, address_two, city, state, 
        zipcode, beds, baths, square_feet, acres, note, client_id, first_name, last_name) 
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [req.body.address, req.body.address2, req.body.city, req.body.state, 
        req.body.zipcode, req.body.beds, req.body.baths, req.body.squareFeet, req.body.acres, req.body.notes, req.body.client,
        req.body.firstName, req.body.lastName], function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
      });
\    res.sendStatus(200)
})

app.get('/propertydata', tokenAuthentication, (req, res) => {
  let sql = "SELECT * FROM properties WHERE property_id = " + req.query.propertyID +";"

  db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      console.log(rows)
      res.send(rows)
    });
})

app.listen(3000)
console.log('Listening on port 3000')