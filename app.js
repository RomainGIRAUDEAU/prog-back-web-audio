const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
var multer = require('multer');
const cors = require('cors');
var upload = multer();
const withAuth = require('./utilities/middleware');

const accountRouter = require('./routes/account');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const pluginsRouter = require('./routes/plugins');
const mongoUtil = require("./utilities/mongoUtil");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if(app.get('env')=== 'development') {
  app.use(cors());
}
app.use('/account', accountRouter);
app.use('/',withAuth, indexRouter);
app.use('/users', withAuth ,usersRouter);
app.use('/plugins', pluginsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

mongoUtil.connectToServer( function( err, client ) {
  if (err) console.log(err);


  // start the rest of your app here
} );
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
