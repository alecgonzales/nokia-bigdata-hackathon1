// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/local');

var Point     = require('./app/models/point');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/point/:point_id')
    .get(function(req, res) {
        Point.findById(req.params.point_id, function(err, point) {
            if (err)
                res.send(err);
            res.json(point);
        });
    });

router.route('/points')
    .get(function(req, res) {
        Point.find(function(err, points) {
            if (err)
                res.send(err);

            res.json(points);
        });
    });

router.route('/points/:page')
  .get(function(req, res) {
    var entryLimit = 50;
    var pageNumber = req.params.page;
    var skipEntries = entryLimit*(pageNumber-1);

    var query = Point.find({});
    query.skip(skipEntries).limit(entryLimit).select({'site_name':1}).exec('find', function(err, points) {
      if (err)
          res.send(err);

      res.json(points);
    });

 });

  router.route('/points/:page/:property/:value')

  .get(function(req, res) {
    var entryLimit = 50;
    var pageNumber = req.params.page;
    var skipEntries = entryLimit*(pageNumber-1);
    var queryObject = {};
    queryObject[req.params.property] = req.params.value;
    var displayObject = {};
    displayObject['site_name'] = 1;
    displayObject['technology'] = 2;

    var query = Point.find(queryObject);
    query.skip(skipEntries).limit(entryLimit).select(displayObject).exec('find', function(err, points) {
      if (err)
          res.send(err);

      res.json(points);
    });

  });


  // REGISTER OUR ROUTES -------------------------------
  app.use('/api', router);
  app.use('/', express.static('../frontend'));

  // START THE SERVER
  // =============================================================================
  app.listen(port);
  console.log('Server running on port ' + port);
