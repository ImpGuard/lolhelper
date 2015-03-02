$(function() {
    function dataPerParticipant(matches, userName, keyPath, role, lane) {
        if (role != null)
            var role = role.toLowerCase();

        var lane = lane.toLowerCase();
        var keyPath = keyPath.split("/");
        var filter_participant = function(participant) {
            return ((role == null || participant["timeline"]["role"].toLowerCase().indexOf(role) != -1)
                && participant["timeline"]["lane"].toLowerCase().indexOf(lane) != -1);
        }
        var data = [];
        matches.forEach(function(match) {
            var pids = match["participantIdentities"]
            var pid;
            pids.forEach(function(participantIdentity) {
                if (participantIdentity["player"]["summonerName"].toLowerCase() == userName.toLowerCase()) {
                    pid = participantIdentity["participantId"];
                }
            });
            participants = match["participants"]
            var user;
            participants.forEach(function(p) {
                if (p["participantId"] == pid)
                    user = p;
            });
            data.push(dataAtKeypath(user, keyPath));
        });
        return data;
    }

    function dataAtKeypath(data, keyPath) {
        keyPath.forEach(function(key) {
            if (!(key in data))
                return 0.0;
            data = data[key];
        });
        return data;
    }

    roleToLaneAndRole = {
                            "BOT":          ["BOT", "DUO_CARRY"],
                            "SUPPORT":      ["BOT", "DUO_SUPPORT"],
                            "MID":          ["MID", null],
                            "JUNGLE":       ["JUNGLE", null],
                            "TOP":          ["TOP", null]
                        };


    var statsFeatures = ["assists", "champLevel", "deaths", "doubleKills", "firstBloodAssist", "firstBloodKill", "firstInhibitorAssist", "firstInhibitorKill", "firstTowerAssist", "firstTowerKill", "goldEarned", "goldSpent", "inhibitorKills", "killingSprees", "kills", "largestCriticalStrike", "largestKillingSpree", "largestMultiKill", "magicDamageDealt", "magicDamageDealtToChampions", "magicDamageTaken", "minionsKilled", "neutralMinionsKilled", "neutralMinionsKilledEnemyJungle", "neutralMinionsKilledTeamJungle", "pentaKills", "physicalDamageDealt", "physicalDamageDealtToChampions", "physicalDamageTaken", "quadraKills", "sightWardsBoughtInGame", "totalDamageDealt", "totalDamageDealtToChampions", "totalDamageTaken", "totalHeal", "totalTimeCrowdControlDealt", "totalUnitsHealed", "towerKills", "tripleKills", "trueDamageDealt", "trueDamageDealtToChampions", "trueDamageTaken", "unrealKills", "visionWardsBoughtInGame", "wardsKilled", "wardsPlaced"];
    var timelineFeatures = ["creepsPerMinDeltas", "csDiffPerMinDeltas", "damageTakenDiffPerMinDeltas", "damageTakenPerMinDeltas", "goldPerMinDeltas", "xpDiffPerMinDeltas", "xpPerMinDeltas"];
    var spellNameToId = {
        "spell_cleanse" : 1,
        "spell_clairv"  : 2,
        "spell_exhaust" : 3,
        "spell_flash"   : 4,
        "spell_ghost"   : 6,
        "spell_heal"    : 7,
        "spell_revive"  : 10,
        "spell_smite"   : 11,
        "spell_teleport": 12,
        "spell_clarity" : 13,
        "spell_ignite"  : 14,
        "spell_garrison": 17,
        "spell_barrier" : 21
    };

    function featuresFromMatches(matches, username, role) {
        var featureVectors = [];
        var laneAndRole = roleToLaneAndRole[role.toUpperCase()];
        statsFeatures.forEach(function(featureName) {
            sum = 0.0;
            featureValues = dataPerParticipant(matches, username, "stats/" + featureName, laneAndRole[1], laneAndRole[0]);
            featureValues.forEach(function(data) {
                if (typeof data === "boolean")
                    data = (data ? 1.0 : 0.0)
                sum += 1.0 * data;
            });
            sum /= featureValues.length;
            featureVectors.push(sum);
        });

        var timelines = ["tenToTwenty", "thirtyToEnd", "twentyToThirty", "zeroToTen"];
        timelineFeatures.forEach(function(featureName) {
            timelines.forEach(function(timeline) {
                sum = 0.0;
                featureValues = dataPerParticipant(matches, username, "timeline/" + featureName + "/" + timeline, laneAndRole[1], laneAndRole[0]);
                featureValues.forEach(function(data) {

                    if (typeof data === "boolean")
                        data = (data ? 1.0 : 0.0)
                    sum += 1.0 * data;
                });
                sum /= featureValues.length;
                featureVectors.push(sum);
            });
        });
        var spellNames = Object.keys(spellNameToId);
        spellNames.sort();
        spellNames.forEach(function(spellName) {
            sum = 0.0;
            spell1 = dataPerParticipant(matches, username, "spell1Id", laneAndRole[1], laneAndRole[0]);
            spell2 = dataPerParticipant(matches, username, "spell2Id", laneAndRole[1], laneAndRole[0]);
            spellId = spellNameToId[spellName];
            for (var i = 0; i < spell1.length; i++) {
                if (spell1[i] == spellId || spell2[i] == spellId)
                    sum += 1.0
            }
            featureValues.forEach(function(data) {
                if (typeof data === "boolean")
                    data = (data ? 1.0 : 0.0)
                sum += 1.0 * data;
            });
            sum /= spell1.length;
            featureVectors.push(sum);
        });
        return featureVectors;
    }

    function getUrlParameter(param) {
        var pageURL = window.location.search.substring(1);
        var urlVariables = pageURL.split("&");
        for (var i = 0; i < urlVariables.length; i++) {
            var parameterName = urlVariables[i].split("=");
            if (parameterName[0] == param)
                return parameterName[1];
        }
    }

    function getMatchData(summonerName, callback) {
        $.get("http://localhost:3000/matches/" + summonerName, function(responseText) {
            callback(JSON.parse(responseText));
        });
    }

    function getSummonerId(summonerName, callback) {
        $.get("http://localhost:3000/summonerId/" + summonerName, function(responseText) {
            callback(responseText);
        });
    }

    function getProfilePictureURL(summonerName, callback) {
        $.get("http://localhost:3000/icon/" + summonerName, function(responseText) {
            callback(responseText);
        });
    }


    /**
     * Sends a GET request to the server for a particular classifier, specified by a coefficient
     * vector and an offset value.
     */
    function getClassifier(role, callback) {
        $.get("http://localhost:3000/classifier/" + role, function(responseText) {
            var data = JSON.parse(responseText);
            if ("coef" in data && "offset" in data) {
                console.log("SUCCESS!");
                callback(new LogisticClassifier(data["coef"], data["offset"], data["maxima"]));
            } else {
                console.log("FAILURE. Error: ");
                callback(null);
            }
        });
    }

    function sigma(x) {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Dot product between two vectors. If they have
     * different lengths, use the minimum of the two
     * lengths.
     */
    function dot(u, v) {
        var k = Math.min(u.length, v.length);
        var res = 0;
        for (var i = 0; i < k; i++) {
            res += u[i] * v[i];
        }
        return res;
    }

    function LogisticClassifier(coef, offset, maxima) {
        this.coef = coef;
        this.offset = offset;
        this.maxima = maxima.map(function(element) {
            return Number(element);
        });
    }

    LogisticClassifier.prototype.predict = function(x) {
        var maxima = this.maxima;
        return sigma(dot(x.map(function(element, index) { return maxima[index] == 0 ? 0 : element / maxima[index]; }), this.coef) + this.offset);
    }

    window.getClassifier = getClassifier;
    window.getMatchData = getMatchData;
    window.getProfilePictureURL = getProfilePictureURL;
    window.dataPerParticipant = dataPerParticipant;
    window.featuresFromMatches = featuresFromMatches;
});
