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

router.route('/points')
    .get(function(req, res) {
        Point.find(function(err, points) {
            if (err)
                res.send(err);

            res.json(points);
        });
    });
    
router.route('/point/:point_id')
    .get(function(req, res) {
        Point.findById(req.params.point_id, function(err, point) {
            if (err)
                res.send(err);
            res.json(point);
        });
    });


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);
app.use('/', express.static('../frontend'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);