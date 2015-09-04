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

var getAllPoints = function(req, res) {
    Point.find(function(err, points) {
        if (err)
            res.send(err);
        res.json(points);
    });
}
var getPointsForPage = function(req, res, pageNumber, query) {
  var entryLimit = 50;
  var skipEntries = entryLimit*(pageNumber-1);
  var displayObject = {};
  displayObject['site_name'] = 1;
  displayObject['technology'] = 1;

  if(pageNumber!=0){
    query.skip(skipEntries).limit(entryLimit)
  }

  query.select(displayObject)
  .exec('find', function(err, points) {
    if (err)
        res.send(err);
    res.json(points);
  });
};

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
    .get(function(req, res){
      getAllPoints(req, res);
    });

router.route('/points/:page')
  .get(function(req, res) {
    var pageNumber = req.params.page;
  if (pageNumber == 0) {
    getAllPoints(req, res);
  }  else {
    var query = Point.find({});
    getPointsForPage(req, res, pageNumber, query);
  }
 });

router.route('/points/:page/:property/:value')
  .get(function(req, res) {
    var pageNumber = req.params.page;
    var property = req.params.property;
    var value = req.params.value;
    if (property == 'null' && value == 'null') {
      var query = Point.find();
      getPointsForPage(req, res, pageNumber, query);
    }
    else {
      var queryObject = {};
      queryObject[property] = value;
      var query = Point.find(queryObject);
      getPointsForPage(req, res, pageNumber, query);
    }
  });

router.route('/points/wildfind/:wildid')
.get(function(req, res) {
	var queryObject = {
      "position.coordinates_source.radius":parseInt(req.params.wildid,10)
    };
  console.log(queryObject);
	Point.find(queryObject).exec(function(err, point) {
		if (err)
			res.send(err);
		res.json(point);
	}) ;
});

  // REGISTER OUR ROUTES -------------------------------
  app.use('/api', router);
  app.use('/', express.static('../frontend'));

  // START THE SERVER
  // =============================================================================
  app.listen(port);
  console.log('Server running on port ' + port);
