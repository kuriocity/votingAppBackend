require('dotenv').config()
const express = require('express')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const User = require('./models/User')
const RefreshToken = require('./models/RefreshToken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
var cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

//const url = 'mongodb://localhost/VoteAppDB';
const url = process.env.DATABASE_URL;
 //'';

mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected!');
})


app.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        console.log(salt)
        console.log(hashedPassword);

        const user = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });
        const newUser = await user.save();
        console.log("new user ", newUser);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user) res.status(404).json({ message: 'User Not Found' })
    console.log(req.body.password);
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {

            const tokenUser = { username: req.body.username };
            const accessToken = generateAccessToken(tokenUser);
            const refreshToken = jwt.sign(tokenUser, process.env.REFRESH_TOKEN_SECRET);
            const refreshTokenDB = new RefreshToken({ token: refreshToken })
            await refreshTokenDB.save();
            //res.json(user);
            res.json({ accessToken: accessToken, refreshToken: refreshToken })
        }
        else {
            res.status(401).json({ message: "Incorrect Password" })
        }
    } catch (err) {
        res.status(500).json();
    }
})

app.post('/token', async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);
    const refreshTokenDB = await RefreshToken.findOne({ token: refreshToken });
    if (!refreshTokenDB) return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken(user);
        res.json({ accessToken: accessToken });
    })
})

app.get('/user/:username', /*authenticateToken,*/ async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    if (!user) res.status(404).json({ message: 'User Not Found' })

    console.log(user);
    res.json(user);
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403)
        }

        req.user = user
        console.log('In middleware user :', req.user);
        next()
    })
}


app.delete('/logout', async (req, res) => {
    await RefreshToken.findOne({ token: req.body.token }).remove();
    res.sendStatus(204);

})

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

app.post('/forgotPassword', async (req, res) => {
    const emailOrUsername = req.body.EmailOrUsername;
    console.log(emailOrUsername);
    var user = "";

    if (validateEmail(emailOrUsername)) {
        user = await User.findOne({ email: emailOrUsername });
    }
    else {
        user = await User.findOne({ username: emailOrUsername });
    }
    if (!user) {
        res.status(404).json({ message: 'User Not Found' })
        return;
    }

    const emailId = user.email;

    try {
        sendforgotPasswordEmail(user)
        res.json({ user: user, message: 'Mail Sent!' })

    } catch (err) {
        res.status(500).json();
    }
})

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1 week' });
}


app.listen(process.env.PORT || 8000, () => {
    console.log("Auth Server Started at Port ");
})

//Email

const sendforgotPasswordEmail = (user) => {
    const forgotPasswordMailBody = `
    <h3>Hi ${user.firstName}!</h3>
    <p>Please follow this link <br>
    To reset your password</p>
    <a href='http://localhost:3000/reset-password'>Click here to reset</a>
    <hr />
    <h4>Voting App</h4>
    <p>Copyright 2021</p>
  `;
    sendEmail(user.email, 'Reset Password', forgotPasswordMailBody);

}
const sendUserRegisteredEmail = (user) => {
    const activateAccountMailBody = `
    <h3>Hi ${user.firstName}! Please follow this link</h3>
    <p>To Reset your password</p>
    <a href='http://localhost:3000/reset-password'>Click Here to Reset</a>
    <hr />
    <h4>Voting App</h4>
    <p>Copyright 2021</p>
  `;
    sendEmail(user.email, 'Activate Account', activateAccountMailBody);

}

const sendEmail = (email, emailSubject, mailBody) => {


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.GMAIL_USERNAME, // generated ethereal user
            pass: process.env.GMAIL_PASSWORD   // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Voter App" seirranevada@gmail.com', // sender address
        to: email, // list of receivers
        subject: emailSubject, // Subject line
        // text: 'Hello world?', // plain text body
        html: mailBody // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });

}
