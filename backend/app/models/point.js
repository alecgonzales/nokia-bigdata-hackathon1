var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PointSchema   = new Schema({
});

module.exports = mongoose.model('Point', PointSchema, 'points');
