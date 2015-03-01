from util import *
from league_api import *
from training import *
import matplotlib.pyplot as plt
import numpy as np
import json
import requests as req
import time

from pprint import pprint

class MatchDataCollection(object):
    def __init__(self, matches):
        self.matches = matches

    def data_per_participant(self, keyPath, winner=None, role=None, lane=None):
        if role is not None:
            role = role.lower()
        if lane is not None:
            lane = lane.lower()
        keyPath = keyPath.split("/") if type(keyPath) is str else keyPath
        filter_participant = lambda participant: winner is None or participant["stats"]["winner"] == winner\
            and role is None or participant["timeline"]["role"].lower() == role\
            and lane is None or participant["timeline"]["lane"].lower() == lane
        data = []
        for matchId, match in self.matches.items():
            for participant in [participant for participant in match["participants"] if filter_participant(participant)]:
                value = data_at_keypath(participant, keyPath)
                if value is not None:
                    data.append(value)
        return np.array(data)

    def pprint(self, index):
        pprint(self.matches[matches.keys()[index]])

    def featurize(self):
        pass

def kill_death_scatterplot():
    winKills = matchData.data_per_participant("stats/kills", winner=True)
    winAssists = matchData.data_per_participant("stats/assists", winner=True)
    winDeaths = matchData.data_per_participant("stats/deaths", winner=True)
    lossKills = matchData.data_per_participant("stats/kills", winner=False)
    lossAssists = matchData.data_per_participant("stats/assists", winner=False)
    lossDeaths = matchData.data_per_participant("stats/deaths", winner=False)
    show_scatterplot((winAssists + winKills, winDeaths), altData=(lossAssists + lossKills, lossDeaths), alpha=0.1)
