require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
var cors = require('cors')
const pollsRouter = require('./routes/polls');

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


app.use('/polls', pollsRouter);

app.listen(process.env.PORT || 9000, () => {
    console.log("Server Started at Port ");
})
