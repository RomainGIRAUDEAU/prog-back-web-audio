const express = require('express');
const mongoUtil = require('../utilities/mongoUtil');
const mongodb = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer = require('multer');


const router = express.Router();


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
})};



router.post('/post', async function uploadAudio(req, res) {
    postFile(req, res).then((resolve,reject)=>{
        res.status(200).send(resolve)
    }).catch(
        res.status(400).send(reject)
    );
});


module.exports = router;
