from util import *
from league_api import *
from training import *
import matplotlib.pyplot as plt
import numpy as np
import json
import time

from pprint import pprint

roleToLaneAndRole = {
    "BOT":          ("BOT", "DUO_CARRY"),
    "SUPPORT":      ("BOT", "DUO_SUPPORT"),
    "MID":          ("MID", None),
    "JUNGLE":       ("JUNGLE", None),
    "TOP":          ("TOP", None)
}

class MatchDataCollection(object):
    def __init__(self, matches):
        self.matches = matches

    def data_per_participant(self, keyPath, winner=None, role=None, lane=None):
        if role is not None:
            role = role.lower()
        if lane is not None:
            lane = lane.lower()
        keyPath = keyPath.split("/") if type(keyPath) is str else keyPath
        filter_participant = lambda participant: (winner is None or participant["stats"]["winner"] == winner)\
            and (role is None or role in participant["timeline"]["role"].lower())\
            and (lane is None or lane in participant["timeline"]["lane"].lower())
        data = []
        for matchId, match in self.matches.items():
            for participant in [participant for participant in match["participants"] if filter_participant(participant)]:
                value = data_at_keypath(participant, keyPath)
                if value is not None:
                    data.append(value)
                else:
                    data.append(0.0)
        return np.array(data)

    # Return the number of wins and losses for a given role and lane
    def win_loss(self, lane=None, role=None):
        if role is not None:
            role = role.lower()
        if lane is not None:
            lane = lane.lower()
        filter_participant = lambda participant, winner: winner is None or participant["stats"]["winner"] == winner \
            and (role is None or role in participant["timeline"]["role"].lower())\
            and (lane is None or lane in participant["timeline"]["lane"].lower())
        res = [0, 0]
        for match in self.matches.values():
            winners = [p for p in match["participants"] if filter_participant(p, winner=True)]
            res[0] += len(winners)
            losers = [p for p in match["participants"] if filter_participant(p, winner=False)]
            res[1] += len(losers)
        return res

    # Return the matches that does not have players matching the criteria.
    def exclusive_matches(self, winner=None, role=None, lane=None):
        if role is not None:
            role = role.lower()
        if lane is not None:
            lane = lane.lower()
        filter_participant = lambda participant: winner is None or participant["stats"]["winner"] == winner\
            and (role is None or role in participant["timeline"]["role"].lower())\
            and (lane is None or lane in participant["timeline"]["lane"].lower())
        matches = []
        for match in self.matches.values():
            p = [p for p in match["participants"] if filter_participant(p)]
            if len(p) == 0:
                matches.append(match)
        return matches

    def pprint(self, index):
        pprint(self.matches[matches.keys()[index]])

    # role should be "BOT"/"SUPPORT"/"MID"/"JUNGLE"/"TOP"
    def featurize(self, role):
        # X is the list of features for a player of the given role and lane
        # For N games, there are at most 2N vectors in X, as there should be at most one player of a role and lane on each team
        # Y is the corresponding labels: wether that player win or lost the game 
        X = []
        Y = []

        wins, losses = self.win_loss(lane=lane, role=role)
        Y += [1] * wins
        Y += [0] * losses

        # Break up the role into role and land that are required for accessing match data.
        lane, role = roleToLaneAndRole[role]
        for featureName, extractor in featureExtractors.items():
            stats = np.hstack([extractor(self, winner=True, role=role, lane=lane), 
                extractor(self, winner=False, role=role, lane=lane)])
            stats = featureNormalizers[featureName]
            X.append(stats)

        X = np.array(X, dtype=np.float32)
        X = X.T             # Transpose so that each row correspondes to features of one player in one game.
        Y = np.array(Y)
        assert len(X) == len(Y), "Number of observations should match that of labels."
        return X, Y

# featureExtractors[featureName] is a function that takes in a MatchDataCollection, winner, role and
# role to return a tuple of two lists (win and loss) of numbers, respresenting observations for that feature. 
featureExtractors = {}

# featureNormalizers[featureName] is a function that takes in a vector of observations about a
# feature, and then return the normalized values.
featureNormalizers = {}


if __name__ == "__main__":
    startTime = time.time()
    print "Reading matches data..."
    with open("challenger_matches.json") as json_file:
        data = json.load(json_file)
        m = MatchDataCollection(data)
        print "    Took %.2f second" % (time.time() - startTime)



