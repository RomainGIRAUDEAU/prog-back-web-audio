const express = require('express');
const mongoUtil = require( '../utilities/mongoUtil');
const mongodb = require("mongodb");
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer  = require('multer');
const upload = multer();

const router = express.Router();

// Downloading a single file
router.get('/file/:filename', (req, res) => {
  let db = mongoUtil.getDb();
  const collection = db.collection('images.files');
  const collectionChunks = db.collection('images.chunks');


  collection.find({filename: req.params.filename}).toArray(function(err, docs){
    if(err){
      return res.render('index', {
        title: 'File error',
        message: 'Error finding file',
        error: err.errMsg});
    }
    if(!docs || docs.length === 0){
      return res.render('index', {
        title: 'Download Error',
        message: 'No file found'});
    }else{

      //Retrieving the chunks from the db
      collectionChunks.find({files_id : docs[0]._id})
          .sort({n: 1}).toArray(function(err, chunks){
        if(err){
          return res.render('index', {
            title: 'Download Error',
            message: 'Error retrieving chunks',
            error: err.errmsg});
        }
        if(!chunks || chunks.length === 0){
          //No data found
          return res.render('index', {
            title: 'Download Error',
            message: 'No data found'});
        }

        let fileData = [];
        for(let i=0; i<chunks.length;i++){
          //This is in Binary JSON or BSON format, which is stored
          //in fileData array in base64 endocoded string format

          fileData.push(chunks[i].data.toString('base64'));
        }


        res.send( fileData);
      });
    }
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
