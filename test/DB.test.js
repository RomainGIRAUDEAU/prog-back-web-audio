const ObjectID = require('mongodb').ObjectID;
const chai = require('chai');
var expect = chai.expect;

var database = require('../utilities/mongoUtil');


beforeEach( function(done) {
    database.connectToServer( function (err, client) {
        done();
    } );
});



describe('Test connection with db', async function(){
    it('add an element to db', async function () {
        var coll = database.getDb().collection("test");
        var result = await coll.insertOne({name: 'ballons', quantity: 1000});
        expect(result.insertedCount).to.be.equal(1);
    });



    it('Get a value from an element in DB', async function () { // added "done" as parameter
        var coll = database.getDb().collection("test");
        var answer = await coll.findOne({name: 'ballons'});
        expect(answer.quantity).to.be.equal(1000)
    });


    it('update an element in db', async function () {
        var coll = database.getDb().collection("test");
        var updateResult = await coll.updateOne({name: 'ballons'}, {$set: {quantity: 40}});
        expect(updateResult.modifiedCount).to.be.equal(1);

        var answer = await coll.findOne({name: 'ballons'});
        expect(answer.quantity).to.be.equal(40)
    });

    it('delete an element in db', async function () {
        var coll = database.getDb().collection("test");
        var result = await coll.deleteOne({name: 'ballons'});
        expect(result.deletedCount).to.be.equal(1);
    });

});
