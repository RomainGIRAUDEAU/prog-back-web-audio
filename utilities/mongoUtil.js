const MongoClient = require( 'mongodb' );
const url = "mongodb+srv://comandoRG:ASG6gXcLZl0cnVXh@cluster0-6ecvf.mongodb.net/test?retryWrites=true";


var _db;

module.exports = {

    connectToServer: function( callback ) {
        MongoClient.MongoClient.connect( url,  { useNewUrlParser: true }, function( err, client ) {
            _db  = client.db('webaudio');
            return callback( err );
        } );
    },

    getDb: function() {
        return _db;
    },
    createBucket:function (db) {
        return new MongoClient.GridFSBucket(db,{
            chunkSizeBytes: 1024,
            bucketName: 'images'
        });
    },

    getBucket:function(db,bucketName){
       return new MongoClient.GridFSBucket(db,{
            chunkSizeBytes:100000,
            bucketName: bucketName

        });
    }
};
