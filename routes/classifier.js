var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");

/* GET trained classifier parameters. */
router.get("/:role([A-Za-z_\\-]+)", function(req, res) {
    role = req["params"]["role"];
    fs.readFile("learn/classifiers/" + role + "_classifier.json", function(err, data) {
        if (err) {
            res.end(JSON.stringify(err));
        } else {
            res.end(data);
        }
    });
});

module.exports = router;
