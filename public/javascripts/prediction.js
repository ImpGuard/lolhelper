$(function() {
    function dataPerParticipant(matches, userName, keyPath, winner, role, lane) {
        if (role != null)
            var role = role.toLowerCase()
        var lane = lane.toLowerCase()
        var keyPath = keyPath.split("/")
        var filter_participant = function(participant) {
                if (participant["stats"]["winner"] == winner
                    && (role == null || participant["timeline"]["role"].toLowerCase().indexOf(role) != -1)
                    && participant["timeline"]["lane"].toLowerCase().indexOf(lane) != -1)
                    return true
                else
                    return false
            }
        var data = []
        matches.forEach(function(match) {
            var pids = match["participants"]
            var pid
            pids.forEach(function(participantIdentity) {
                if (participantIdentity["summonerName"] == userName) {
                    pid = participantIdentity["participantId"]
                }
            })
            participants = match["participants"]
            var user
            participants.forEach(function(p) {
                if (p["participantId"] == pid)
                    user = p
            })

            data.push(dataAtKeypath(user, keyPath))
        })
        return data
    }

    function dataAtKeypath(data, keyPath) {
        keyPath.forEach(function(key) {
            if (!(key in data))
                return 0.0
            data = data[key]
        })
        return data
    }

    roleToLaneAndRole = {
                            "BOT":          ["BOT", "DUO_CARRY"],
                            "SUPPORT":      ["BOT", "DUO_SUPPORT"],
                            "MID":          ["MID", null],
                            "JUNGLE":       ["JUNGLE", null],
                            "TOP":          ["TOP", null]
                        }

   /* function featuresFromMatches(matches, userName, role) {
        var X = []
        var Y = []
        
        var res = roleToLaneAndRole[role]
        var lane = res[0]
        var role = res[1]

        wins, losses = self.win_loss(lane=lane, role=role)
        Y += [1] * wins
        Y += [0] * losses

        for featureName, extractor in featureExtractors.items():
            print "Extracting feature '%s'" % featureName
            stats = np.hstack([extractor(self, winner=True, role=role, lane=lane), 
                extractor(self, winner=False, role=role, lane=lane)])
            stats = featureNormalizers[featureName](stats)
            X.append(stats)

        X = np.array(X, dtype=np.float32)
        X = X.T             # Transpose so that each row correspondes to features of one player in one game.
        Y = np.array(Y)
        assert len(X) == len(Y), "Number of observations should match that of labels."
        return X, Y
    }*/


    function getMatchData(summonerName, callback) {
        $.get("http://localhost:3000/matches/" + summonerName, function(responseText) {
            callback(JSON.parse(responseText));
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
    function getClassifier(name, callback) {
        $.get("http://localhost:3000/classifier/" + name, function(responseText) {
            var data = JSON.parse(responseText);
            if ("coef" in data && "offset" in data) {
                console.log("SUCCESS!");
                callback(new LogisticClassifier(data["coef"], data["offset"]));
            } else {
                console.log("FAILURE. Error: ");
                console.log(data)
                callback(null);
            }
        });
    }

    function sigma(x) {
        return 1 / (1 + exp(-x));
    }

    /**
     * Dot product between two vectors. If they have
     * different lengths, use the minimum of the two
     * lengths.
     */
    function dot(u, v) {
        var k = min(u.length, v.length);
        var res = 0;
        for (var i = 0; i < k; i++) {
            res += u[i] * v[i];
        }
        return res;
    }

    function LogisticClassifier(coef, offset) {
        this.coef = coef;
        this.offset = offset;
    }

    LogisticClassifier.prototype.predict = function(x) {
        return sigma(dot(x, this.coef) + this.offset);
    }

    window.getClassifier = getClassifier;
    window.getMatchData = getMatchData;
    window.getProfilePictureURL = getProfilePictureURL;
});
