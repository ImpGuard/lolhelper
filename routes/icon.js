var express = require("express");
var path = require("path");
var request = require("request");
var fs = require("fs");

var router = express.Router();

API_KEY_B = "e32f393e-c4c1-4214-87ba-866ac3d543e1";
REGION = "na";
URL_HOST = "https://" + REGION + ".api.pvp.net";
DDRAGON_HOST = "http://ddragon.leagueoflegends.com"

var requestPathForIcon = function(id) {
    return "/cdn/5.3.1/img/profileicon/" + id + ".png"
}

var requestPathForSummoner = function(summonerName) {
    return "/api/lol/" + REGION + "/v1.4/summoner/by-name/" + summonerName + "?api_key=" + API_KEY_B;
}

router.get("/:summonerName", function(req, res) {
    var summonerName = req["params"]["summonerName"];
    console.log("[!] Requesting id for " + summonerName + "...");
    request.get(URL_HOST + requestPathForSummoner(summonerName), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var summonerData = JSON.parse(body);
            var profileId = summonerData[Object.keys(summonerData)[0]].profileIconId;
            res.end(DDRAGON_HOST + requestPathForIcon(profileId));
        } else {
            res.end(DDRAGON_HOST + requestPathForIcon(0));
        }
    });
});

module.exports = router;
