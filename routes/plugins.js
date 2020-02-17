const express = require('express');
const router = express.Router();
const ObjectID = require('mongodb').ObjectID;
const database = require('../utilities/mongoUtil');
const JSZip = require('jszip');
const mongodb = require('mongodb');



// POST new plugin
router.post('/', async function (req, res, next) {
    const collection = database.getDb().collection('plugins');
    const { result } = await collection.insertOne(req.body);
    if (result.ok === 1) {
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

router.get('/', async function (req, res, next) {
    const collection = database.getDb().collection('plugins');
    const result = await collection.find({}).toArray();
    if (result == null || result == undefined) {
        res.status(500);
    }
    res.status(200).send(result);
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const collection = database.getDb().collection('plugins');
    const query = { _id: ObjectID(id) };
    collection.findOne(query, (err, obj) => {
        if (err) {
            throw err;
        }
        console.log(`Requested plugin of id : ${id}`);
        const zipID = obj.zipID;
    });
});


router.delete('/:id', async function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    const collection = database.getDb().collection('plugins');
    var myquery = { _id: ObjectID(id) };
    collection.deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        res.sendStatus(200);
    });
});

module.exports = router;