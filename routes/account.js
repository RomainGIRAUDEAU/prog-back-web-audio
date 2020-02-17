var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const mongoUtil = require('../utilities/mongoUtil');

const saltRounds = 10;
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});


// Creation d'un compte pour les nouveaux utilisateurs
router.post('/create_account', async function (req, res, next) {
    console.log(req.body);
    var db = mongoUtil.getDb();
    var authColl = db.collection("Users");
    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(req.body.password, salt);
    authColl.insertOne(
        {
            usrname: req.body.name,
            password: hash,
            role: "admin"
        }
    );
    res.status(200).send({});
});


// Verification du mot de passe hashé avec le mot de post donnée
router.post('/check_account', async function (req, res, next) {
    console.log(req.body);
    let db = mongoUtil.getDb();
    let authColl = db.collection("Users");
    let answer = await authColl.findOne({usrname: req.body.name});
    if(answer === null ){
        res.send(400)
    }
    let passwordGiven = req.body.password;
    let passwordFromDataBase = answer.password;
    let response = bcrypt.compareSync(passwordGiven, passwordFromDataBase); // true
    if( response === true){
        res.status(200).send(answer);
    }
    else{
        res.status(401).send({});
    }



});

module.exports = router;
