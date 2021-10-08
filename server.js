require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')


//const url = 'mongodb://localhost/VoteAppDB';
const url = process.env.DATABASE_URL;

const app = express();

app.use(cors())

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected!');
})

db.on('error', (error) => console.error(error))

app.use(express.json());

const pollsRouter = require('./routes/polls');

app.use('/polls', pollsRouter);

app.listen(9000, () => {
    console.log("Server Started at Port 9000");
})
