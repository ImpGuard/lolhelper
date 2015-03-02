var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET analysis page. */
router.get('/analysis', function(req, res) {
    var role = req.query.role
    var region = req.query.region
    var username = req.query.username
    
    res.render('analysis', { role: role, region: region, username: username })
});

module.exports = router;
