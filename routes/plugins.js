const express = require('express');
const router = express.Router();
const mongodb = require("mongodb");
const database = require('../utilities/mongoUtil');
const JSZip = require('jszip');
const mongodb = require('mongodb');
const fileUtil = require('../utilities/file-utils');

const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer = require('multer');


// POST new plugin
router.post('/', async function (req, res) {
    postFile(req, res).then((img) => {
        const collection = database.getDb().collection('plugins')
        req.body.filename = img.filename;
        collection.insertOne(req.body).then((r) => {
            res.sendStatus(200);
        }).catch((err) => {
            res.sendStatus(404)
        });
    }).catch((err) => {
        res.sendStatus(404)
    })
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
    collection.findOne(query, async (err, obj) => {
        if (err) {
            throw err;
        }
        console.log(`Requested plugin of id : ${id}`);
        const zipID = obj.zipID;
        const bucket = new mongodb.GridFSBucket(database.getDb(), {
            chunkSizeBytes: 1024,
            bucketName: 'plugins'
        });
        const zip = new JSZip();
        const content = await zip.loadAsync(bucket.openDownloadStream(zipID));
        Object.entries(content).forEach(file => {
            fileUtil.writeFileSyncRecursive(file);
        });
    });
});


const postFile = (req, res) => {
    return new Promise((resolve, reject) => {

        let storage = multer.diskStorage({
            destination: '../upload'
        });
        let upload = multer({
            storage: storage
        }).any();
        upload(req, res, function (err) {
            if (err) {
                console.log(err);
                throw new Error();
            } else {
                req.files.forEach(async function (item) {
                    // save into the db our file
                    var bucket = new mongodb.GridFSBucket(database.getDb(), {
                        chunkSizeBytes: 1024,
                        bucketName: 'images'
                    });
                    fs.createReadStream(item.path).pipe(
                        bucket.openUploadStream(item.filename)).on('error', function (error) {
                            console.log('Error:-', error);
                            throw new Error();
                        }).on('finish', function () {
                            console.log('File Inserted!!');
                            console.log(item);
                            resolve(item);
                        });
                });
            }
        });
    })
};



router.delete('/:id', async function (req, res, next) {
    var id = req.params.id;
    //console.log(id);
    const collection = database.getDb().collection('plugins');
    var myquery = { _id: ObjectID(id) };
    collection.deleteOne(myquery, function (err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        res.sendStatus(200);
    });
});


router.post('/:id/comments', async function (req, res, next) {
    var id = req.params.id;
    const collection = database.getDb().collection('plugins');
    collection.findOneAndUpdate({ _id: ObjectID(id) },
        { $addToSet: { comments: { author: req.body.author, text: req.body.text, rate: req.body.rate } } },
        { returnNewDocument: true },
        (err, doc) => {
            if (err) {
                console.log("Something wrong when updating data!");
            }
            if (doc.ok === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }
        });
});

module.exports = router;