const express = require('express');
const router = express.Router();
const mongodb = require("mongodb");
const mongoUtil = require('../utilities/mongoUtil');

const database = require('../utilities/mongoUtil');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer = require('multer');


// POST new plugin
router.post('/', async function (req, res) {
    postFile(req, res).then((img) => {
        console.log("yo");
        const collection = database.getDb().collection('plugins')
        req.body.filename = img.filename;
        collection.insertOne(req.body).then((r) => {
            console.log(r);
            res.sendStatus(200);
        }).catch((err) => {
            console.log(err);
            res.sendStatus(404)
        });
    }).catch((err) => {
        console.log(err);
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
                    var bucket = new mongodb.GridFSBucket(mongoUtil.getDb(), {
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




module.exports = router;