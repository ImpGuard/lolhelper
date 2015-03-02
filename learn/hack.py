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
        
        # Break up the role into role and land that are required for accessing match data.
        lane, role = roleToLaneAndRole[role]

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

# featureExtractors[featureName] is a function that takes in a MatchDataCollection, winner, role and
# lane to return a tuple of two lists (win and loss) of numbers, respresenting observations for that feature. 
featureExtractors = {}

# featureNormalizers[featureName] is a function that takes in a vector of observations about a
# feature, and then return the normalized values.
featureNormalizers = {}

# Normalize a vector to have values between 0 and 1.
def normalize_feature(v):
    # No need to normalize if everything is already between 0 and 1 (for bool) or all 0's (for max = 0)
    if type(v[0]) == bool or max(v) == 0:
        return v
    else:
        return np.array(v, dtype=np.float32) / np.max(np.abs(v))

def stats_data_getter(name):
    keyPath = "stats/" + name
    def foo(m, winner, role, lane):
        return m.data_per_participant(keyPath, winner=winner, role=role, lane=lane)
    return foo

def timeline_data_getter(name, timeline):
    keyPath = "timeline/%s/%s" % (name, timeline)
    def foo(m, winner, role, lane):
        return m.data_per_participant(keyPath, winner=winner, role=role, lane=lane)
    return foo

statsFeatures = ['assists', 'champLevel', 'deaths', 'doubleKills', 
                'firstBloodAssist', 'firstBloodKill', 'firstInhibitorAssist', 'firstInhibitorKill', 
                'firstTowerAssist', 'firstTowerKill', 'goldEarned', 'goldSpent', 'inhibitorKills', 
                #'item0', 'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 
                'killingSprees', 'kills',
                'largestCriticalStrike', 'largestKillingSpree', 'largestMultiKill', 'magicDamageDealt',
                'magicDamageDealtToChampions', 'magicDamageTaken', 'minionsKilled', 
                'neutralMinionsKilled', 'neutralMinionsKilledEnemyJungle', 
                'neutralMinionsKilledTeamJungle', 'pentaKills', 
                'physicalDamageDealt', 'physicalDamageDealtToChampions', 'physicalDamageTaken', 
                'quadraKills', 'sightWardsBoughtInGame', 'totalDamageDealt', 
                'totalDamageDealtToChampions', 'totalDamageTaken', 'totalHeal', 
                'totalTimeCrowdControlDealt', 'totalUnitsHealed', 'towerKills', 
                'tripleKills', 'trueDamageDealt', 'trueDamageDealtToChampions', 'trueDamageTaken', 
                'unrealKills', 'visionWardsBoughtInGame', 'wardsKilled', 'wardsPlaced'
                ]

timelineFeatures = ['creepsPerMinDeltas', 'csDiffPerMinDeltas', 'damageTakenDiffPerMinDeltas', 
                    'damageTakenPerMinDeltas', 'goldPerMinDeltas', 'xpDiffPerMinDeltas',
                    'xpPerMinDeltas'
                    ]

# Defining the extractors and normalizers
for f in statsFeatures:
    featureExtractors[f] = stats_data_getter(f)

timelines = ["tenToTwenty", "thirtyToEnd", "twentyToThirty", "zeroToTen"]
for f in timelineFeatures:
    for timeline in timelines:
        featureExtractors[f + "_" + timeline] = timeline_data_getter(f, timeline)

# Misc. features
spellNameToId = {
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
                }
def spell_feature_getter(spellName):
    def foo(m, winner, role, lane):
        spell1s = m.data_per_participant("spell1Id", winner=winner, role=role, lane=lane)
        spell2s = m.data_per_participant("spell2Id", winner=winner, role=role, lane=lane)
        spellId = spellNameToId[spellName]

        x = []
        for i in xrange(len(spell1s)):
            if spell1s[i] == spellId or spell2s[i] == spellId:
                x.append(True)
            else:
                x.append(False)
        return np.array(x)
    return foo
for f in spellNameToId:
     featureExtractors[f] = spell_feature_getter(f)

for f in featureExtractors:
    # If a feature doesn't have a normalizer, jsut use the default
    if f not in featureNormalizers:
        featureNormalizers[f] = normalize_feature

if __name__ == "__main__":
    # startTime = time.time()
    # print "Reading matches data..."
    # with open("challenger_matches.json") as json_file:
    #     data = json.load(json_file)
    #     m = MatchDataCollection(dict(data.items()[:10]))
    #     print "    Took %.2f second" % (time.time() - startTime)
    # x, y = m.featurize(role="MID")
    print


