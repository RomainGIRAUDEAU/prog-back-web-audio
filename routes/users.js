const express = require('express');
const mongoUtil = require( '../utilities/mongoUtil');
const mongodb = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer  = require('multer');
const test = require("assert");
const upload = multer();

const router = express.Router();

// Downloading a single file
router.get('/file/:filename', async (req, res) => {
    let bucket = new mongodb.GridFSBucket(mongoUtil.getDb(), {bucketName: 'images'});
    let fileCollection = mongoUtil.getDb().collection("images.files");
    let result = await fileCollection.findOne({filename: req.params.filename});
    console.log(result);



    let downloadStream = bucket.openDownloadStream(ObjectID(result._id));

    downloadStream.on('data', (chunk) => {
        res.write(chunk);
    });

    downloadStream.on('error', () => {
        res.sendStatus(404);
    });

    downloadStream.on('end', () => {
        res.end();
    });

});

/* GET users listing. */
router.post('/image',function uploadAudio(req, res) {
  let storage = multer.diskStorage({
    destination: '/upload'
  });
  let upload = multer({
    storage: storage
  }).any();
  upload(req, res, function(err) {
    if (err) {
      console.log(err);
      return res.end('Error');
    } else {
      req.files.forEach(function(item) {
        console.log(item);
        // save into the db our file
        var bucket = new mongodb.GridFSBucket(mongoUtil.getDb(), {
          chunkSizeBytes: 1024,
          bucketName: 'images'
        });
        fs.createReadStream(item.path).pipe(
            bucket.openUploadStream(item.originalname)).on('error', function(error) {
          console.log('Error:-', error);
        }).on('finish', function() {
          console.log('File Inserted!!');
          process.exit(0);
        });
      });
      res.end('File uploaded');
    }
  });
  });
/**

 **/


module.exports = router;
