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

};
