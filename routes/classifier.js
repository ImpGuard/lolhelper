var express = require("express");
var router = express.Router();
var path = require("path");
var childProcess = require("child_process");
var fs = require("fs");

/* GET trained classifier parameters. */
router.get("/:name([A-Za-z_\\-]+)", function(req, res) {
    classifierName = req["params"]["name"]
    fs.readFile("learn/classifiers/" + classifierName + ".json", function(err, data) {
        res.end(err ? "Error: could not load learn/classifiers/" + classifierName + ".json" : data)
    });
});

module.exports = router;
