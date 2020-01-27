const express = require('express');
const router = express.Router();
const database = require('../utilities/mongoUtil');



// POST new plugin
router.post('/', async function(req, res, next) {
    const collection = database.getDb().collection('plugins');
    const {result} = await collection.insertOne(req.body);
    if(result.ok === 1) {
        res.sendStatus(200);
    }else {
        res.sendStatus(500);
    }
});

module.exports = router;