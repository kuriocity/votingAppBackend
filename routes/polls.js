const express = require('express')
const router = express.Router()
const Poll = require('../models/poll')

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
        console.log(polls);
        res.json(polls);
    } catch (error) {
        res.status(400).json({ message: err.message })
    }
})

// Creating one
router.post('/', async (req, res) => {
    const poll = new Poll({
        voterCode: req.body.voterCode,
        polls: req.body.polls
    })
    try {
        const newPoll = await poll.save()
        res.status(201).json(newPoll)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Updating One
router.patch('/:voterCode', getPollByVoterCode, async (req, res) => {
    if (req.body.voterCode != null) {
        res.poll.voterCode = req.body.voterCode
    }
    if (req.body.polls != null) {
        res.poll.polls = req.body.polls
    }
    try {
        const updatedPoll = await res.poll.save()
        res.json(updatedPoll)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Deleting One
router.delete('/:voterCode', getPollByVoterCode, async (req, res) => {
    try {
        console.info('To Delete: ', res.poll);
        await res.poll.remove()
        res.json({ message: 'Deleted Poll' })
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