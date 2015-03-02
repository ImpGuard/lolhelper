var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");

/* GET trained classifier parameters. */
router.get("/:name([A-Za-z_\\-]+)", function(req, res) {
    classifierName = req["params"]["name"];
    fs.readFile("learn/classifiers/" + classifierName + ".json", function(err, data) {
        if (err) {
            res.end(JSON.stringify(err));
        } else {
            res.end(data);
        }
    });
});

module.exports = router;
