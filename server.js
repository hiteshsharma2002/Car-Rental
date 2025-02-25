const express = require('express');
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
const router = require('./router/user');
const router1 = require('./router/admin');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const session = require('express-session');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true,
}
));

app.use(session({
    secret: 'your-secret-key', // Replace with a secure, randomly generated key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set `secure: true` only if using HTTPS
}));


// connect to mongoose

mongoose
  .connect("mongodb+srv://hiteshs1506:hitesh@cluster0.ywgpl.mongodb.net")
  .then(() => console.log("MongoDb connected"))
  .catch(() => console.log("Cannot be connected"));

  app.use('/user', router);
  app.use('/admin', router1);

app.set('views', path.join(__dirname, 'views'));

app.get('/', function (req, res) {
    res.render('index');
})


app.listen(1500, () => {
    console.log('Server is running');
})
