var express = require("express");
var router = express.Router();
var path = require("path");
var request = require("request");

API_KEY = "8088e4ce-a8e4-48ea-aec3-c0ac14bfb5a3";
REGION = "na";
URL_HOST = "https://" + REGION + ".api.pvp.net";

var requestPathForSummoner = function(summonerName) {
    return "/api/lol/" + REGION + "/v1.4/summoner/by-name/" + summonerName + "?api_key=" + API_KEY;
}

var requestPathForMatchHistory = function(summonerId) {
    return "/api/lol/" + REGION + "/v2.2/matchhistory/" + summonerId + "?rankedQueues=RANKED_SOLO_5x5&api_key=" + API_KEY;
}

var requestPathForMatchData = function(matchId) {
    return "/api/lol/" + REGION + "/v2.2/match/" + matchId + "?api_key=" + API_KEY;
}

var fetchMatchesAndWriteResponse = function(res, matchIds) {
    var matchDataList = [];
    var responseCount = 0;
    matchIds.forEach(function(matchId) {
        console.log("[!] Requesting match id " + matchId + "...");
        request.get(URL_HOST + requestPathForMatchData(matchId), function(error, response, body) {
            if (!error && response.statusCode == 200) {
                matchDataList.push(JSON.parse(body));
            } else {
                console.log("[-] Error requesting data for " + matchId + " (code " + response.statusCode + ")");
            }
            responseCount++;
            if (responseCount == matchIds.length)
                res.end(JSON.stringify(matchDataList));
        });
    });
}

router.get("/:summonerName", function(req, res) {
    var summonerName = req["params"]["summonerName"];
    console.log("[!] Requesting id for " + summonerName + "...");
    request.get(URL_HOST + requestPathForSummoner(summonerName), function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var summonerData = JSON.parse(body);
            var summonerId = summonerData[Object.keys(summonerData)[0]].id;
            console.log("[!] Requesting match history for " + summonerId + "...");
            request.get(URL_HOST + requestPathForMatchHistory(summonerId), function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var matchHistory = JSON.parse(body);
                    fetchMatchesAndWriteResponse(res, matchHistory.matches.map(function(match) {
                        return match.matchId;
                    }));
                } else {
                    res.end(JSON.stringify(error));
                }
            });
        } else {
            res.end(JSON.stringify(error));
        }
    });
});

module.exports = router;
