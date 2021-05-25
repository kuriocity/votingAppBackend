require('dotenv').config()
const express = require('express')
const router = express.Router()
const Poll = require('../models/Poll')
const User = require('../models/User')
const jwt = require('jsonwebtoken')


// Getting all
router.get('/', async (req, res) => {
    try {
        const polls = await Poll.find()
        res.json(polls)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Getting One
// router.get('/:id', getPoll, (req, res) => {
//     res.json(res.poll)
// })

router.get('/:voterCode', getPollByVoterCode, async (req, res) => {
    try {
        const polls = res.poll;//await Poll.find({ "voterCode": req.params.voterCode })
        console.log("In get polls api " + polls);
        res.json(polls);
    } catch (error) {
        res.status(400).json({ message: err.message })
    }
})

// Creating one
router.post('/', authenticateToken, async (req, res) => {
    const user = await User.findOne({ username: req.user.username });
    const poll = new Poll({
        voterCode: req.body.voterCode,
        pollQuestion: req.body.pollQuestion,
        pollCreator: user._id,
        polls: req.body.polls
    })
    try {
        const newPoll = await poll.save();
        user.pollsCreated.push(newPoll._id);
        await user.save();
        res.status(201).json(newPoll)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Updating One
router.patch('/:voterCode', getPollByVoterCode, async (req, res) => {
    if (req.body.voterCode != null) {
        res.poll.voterCode = req.body.voterCode;
    }
    if (req.body.polls != null) {
        res.poll.polls = [...req.body.polls];
    }
    if (req.body.pollQuestion != null) {
        res.poll.pollQuestion = req.body.pollQuestion;
    }
    try {
        const updatedPoll = await res.poll.save()
        res.json(updatedPoll)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

/*
 * 0 : options1
 * 1 : option2
 * 2: option3
 */

/*var alterPolls=(totalIndices,index,polls,data)=>{
    var allArrays=[]

    for(let i=0;i<0;totalIndices;i++){
        allArrays.push([])
    }
    let j=0;
    polls.forEach(element=>{
        allArrays[];
        j++;
    })

}*/

//Submitting vote
router.patch('/:voterCode/vote/:order', getPollByVoterCode, authenticateToken, async (req, res) => {

    try {
        console.log('In vote api user :', req.user.username);
        const userVoted = await User.findOne({ username: req.user.username });

        if (userVoted.pollsVoted.get(res.poll.voterCode + "") == req.params.order) {
            return res.json(res.poll);
        }

        const previousVotedOrder = userVoted.pollsVoted.get(res.poll.voterCode + "")

        if (previousVotedOrder) {
            res.poll.polls[previousVotedOrder].votes--;

            const index = res.poll.polls[previousVotedOrder].usersVoted.indexOf(userVoted._id);
            if (index > -1) {
                res.poll.polls[previousVotedOrder].usersVoted.splice(index, 1);
            }
            const index2 = res.poll.usersVoted[previousVotedOrder].indexOf(userVoted._id);
            if (index2 > -1) {
                res.poll.usersVoted[previousVotedOrder].splice(index2, 1);
            }
        }
        /*
        if (res.poll.usersVoted[req.params.order] && res.poll.usersVoted[req.params.order].includes(userVoted._id)) {
            //let arr = [];
            //res.poll.polls.forEach((poll, index) => arr.push(`usersVoted.${index} `));
            //return res.json(await res.poll.populate(arr.join('')).populate('polls.usersVoted').execPopulate());
            return res.json(res.poll);
        }
        if (res.poll.polls[req.params.order].usersVoted.includes(userVoted._id)) {
            return res.json(res.poll);
        }
        */
        res.poll.polls[req.params.order].votes++;

        res.poll.polls[req.params.order].usersVoted.push(userVoted._id);
        //
        //alterPolls(req.params.order,res.poll.polls,res.poll.usersVoted)
        // pushing
        console.log('This is userVoted array before assign ', res.poll.usersVoted);
        if (!res.poll.usersVoted[req.params.order]) {
            res.poll.usersVoted[req.params.order] = [];
        }
        // else
        //     res.poll.usersVoted[req.params.order] = [...res.poll.usersVoted[req.params.order]];
        console.log(res.poll.usersVoted[req.params.order]);
        res.poll.usersVoted[req.params.order].push(userVoted._id);
        console.log('This is userVoted array ', res.poll.usersVoted);

        userVoted.pollsVoted.set(res.poll.voterCode + "", req.params.order);
        userVoted.save();

        await res.poll.markModified('usersVoted');
        const updatedPoll = await res.poll.save()

        console.log(`'${res.poll.polls[req.params.order].name}' voted by User '${req.user.username}'`);

        res.json(updatedPoll)

    } catch (err) {
        res.status(400).json({ message: err.message })
    }
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

//Getting Users who voted for a poll
router.get('/:voterCode/votes/users', getPollByVoterCode, authenticateToken, async (req, res) => {
    try {

        console.log('In get voted users api user :', req.user.username);
        var pollOwner = await User.findOne({ username: req.user.username });
        pollOwner = await pollOwner.populate('pollsCreated').execPopulate();

        //return res.json(pollOwner);
        //if (!pollOwner.pollsCreated.some(poll => poll.voterCode === res.poll.voterCode))
        //return res.sendStatus(403)

        console.log(`Poll Code: '${res.poll.voterCode}' Voted Users queried by '${req.user.username}'`);

        let arr = [];
        res.poll.polls.forEach((poll, index) => arr.push(`usersVoted.${index} `));
        res.json(await res.poll.populate(arr.join('')).populate('polls.usersVoted').execPopulate());

    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

//Clearing all votes
router.delete('/:voterCode/votes', getPollByVoterCode, async (req, res) => {

    try {

        res.poll.polls = res.poll.polls.map(poll => {
            poll.votes = 0;
            poll.usersVoted.forEach(async user => {
                const userVoted = await User.findById(user)
                //res.json(userVoted)
                userVoted.pollsVoted.set(req.params.voterCode + "", undefined)
                userVoted.save();
            })
            poll.usersVoted = [];
            return poll
        });
        res.poll.usersVoted.forEach(arr => {
            arr.forEach(async user => {
                const userVoted = await User.findById(user)
                userVoted.pollsVoted.set(req.params.voterCode, undefined)
                userVoted.save();
            })
        })
        res.poll.usersVoted = [];

        const updatedPoll = await res.poll.save()
        res.status(204).json(updatedPoll)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})


// Deleting One
router.delete('/:voterCode', getPollByVoterCode, async (req, res) => {
    try {
        console.info('To Delete: ', res.poll);
        await res.poll.remove()
        res.status(204).json({ message: 'Deleted Poll' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

async function getPoll(req, res, next) {
    let poll
    try {
        poll = await Poll.findById(req.params.id)
        if (poll == null) {
            return res.status(404).json({ message: 'Cannot find Poll' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.poll = poll
    next()
}

async function getPollByVoterCode(req, res, next) {
    let poll
    try {
        poll = await Poll.findOne({ "voterCode": req.params.voterCode })
        if (poll == null) {
            return res.status(404).json({ message: 'Cannot find Poll' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.poll = poll
    next()
}
module.exports = router