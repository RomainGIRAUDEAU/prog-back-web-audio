const express = require('express');
const router = express.Router();
const database = require('../utilities/mongoUtil');
const JSZip = require('jszip');
const mongodb = require('mongodb');
const fileUtil = require('../utilities/file-utils');
const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');
const multer = require('multer');
const path = require('path');


router.post('/', async function (req, res) {
    postFile(req, res).then((img) => {
        const collection = database.getDb().collection('plugins')
        const plugin = {
            name: req.body.name,
            description: req.body.description,
            version: req.body.version,
            categories: req.body.categories,
            isOpenSource: req.body.isOpenSource,
            zipName: img[1],
            imageName: img[0]
        }
        collection.insertOne(plugin).then((r) => {
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

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const collection = database.getDb().collection('plugins');
    const query = { _id: ObjectID(id) };
    try {
        const plugin = await collection.findOne(query)
        res.status(200).send(plugin);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

router.get('/:id/plugin', async (req, res) => {
    const id = req.params.id;
    const collection = database.getDb().collection('plugins');
    const query = { _id: ObjectID(id) };
    try {
        const plugin = await collection.findOne(query);
        const pluginBucket = new mongodb.GridFSBucket(database.getDb(), {
            chunkSizeBytes: 1024,
            bucketName: 'zips'
        });
        const zip = new JSZip();
        const buffer = await readZip(pluginBucket, plugin.zipName);
        const content = await zip.loadAsync(buffer);
        if (!fs.existsSync(path.join('public/temp/', id))) {
            Object.entries(content.files).forEach(async ([key, value]) => {
                try{
                    const data = await zip.file(value.name).async('nodebuffer');
                    if (data) {
                        fileUtil.writeFileSyncRecursive(path.join('public/temp/', id, value.name), data);
                    }
                }catch(err) {
                    console.log(err);
                    res.sendStatus(500);
                }
                
            });
            res.status(200).send({ url: `/temp/${id}` });
        }else {
            res.status(200).send({ url: `/temp/${id}` });
        }

    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

const readZip = async (bucket, name) => {
    return new Promise((resolve, reject) => {
        const contentChunks = [];
        const contentStream = bucket.openDownloadStreamByName(name);
        contentStream.on('error', (err) => reject(err));
        contentStream.on('data', (chunk) => {
            contentChunks.push(chunk);
        });
        contentStream.on('end', () => {
            const content = Buffer.concat(contentChunks);
            resolve(content);
        });
    });

}

router.get('/:id/image', async (req, res) => {
    const id = req.params.id;
    const collection = database.getDb().collection('plugins');
    const query = { _id: ObjectID(id) };
    try {
        const plugin = await collection.findOne(query);
        const imageBucket = new mongodb.GridFSBucket(database.getDb(), {
            chunkSizeBytes: 1024,
            bucketName: 'images'
        });
        imageBucket.openDownloadStreamByName(plugin.imageName).pipe(res);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


const postFile = (req, res) => {
    return new Promise((resolve, reject) => {

        let storage = multer.diskStorage({
            destination: './public/uploads'
        });
        let upload = multer({
            storage: storage
        }).any();
        upload(req, res, async function (err) {
            if (err) {
                console.log(err);
                throw new Error();
            } else {
                const files = [];
                for (item of req.files) {
                    // save into the db our file
                    var bucket = new mongodb.GridFSBucket(database.getDb(), {
                        chunkSizeBytes: 1024,
                        bucketName: item.fieldname + "s"
                    });
                    try {
                        const insert = await insertIntoGFS(item, bucket);
                        files.push(insert);
                        //TODO remove file

                    } catch (err) {
                        console.log(err);
                        reject(err);
                    }
                }

                if (files.length === 2) {
                    resolve(files);
                    fileUtil.deleteFolderRecursive("./public/uploads");
                } else {
                    reject(new Error("Failed to insert in db"));
                }

            }
        });
    })
};

const insertIntoGFS = (item, bucket) => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                reject(err);
            }
            const filename = buf.toString('hex') + path.extname(item.originalname);
            fs.createReadStream(item.path).pipe(
                bucket.openUploadStream(filename)).on('error', function (error) {
                    console.log('Error:-', error);
                    reject(error);
                }).on('finish', function () {
                    console.log('File Inserted!!');
                    console.log(item);
                    resolve(filename);
                });
        });

    });

}



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
    collection.findOneAndUpdate({ _id: ObjectID(id) }, { $addToSet: { comments: { author: req.body.author, text: req.body.text, rate: req.body.rate } } }, { returnNewDocument: true },
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