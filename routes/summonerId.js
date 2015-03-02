var express = require("express");
var router = express.Router();
var path = require("path");
var request = require("request");

API_KEY_B = "e32f393e-c4c1-4214-87ba-866ac3d543e1";
REGION = "na";
URL_HOST = "https://" + REGION + ".api.pvp.net";

var requestPathForSummoner = function(summonerName) {
    return "/api/lol/" + REGION + "/v1.4/summoner/by-name/" + summonerName + "?api_key=" + API_KEY_B;
}

router.get("/:summonerName", function(req, res) {
    var summonerName = req["params"]["summonerName"];
    console.log("[!] Requesting id for " + summonerName + "...");
    request.get(URL_HOST + requestPathForSummoner(summonerName), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var summonerData = JSON.parse(body);
            res.end(String(summonerData[Object.keys(summonerData)[0]].id));
        } else {
            res.end(String(0));
        }
    });
});

module.exports = router;
