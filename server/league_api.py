import json
import requests as req
import time

API_KEY = "8088e4ce-a8e4-48ea-aec3-c0ac14bfb5a3"
REGION = "na"
URL_PREFIX = "https://%s.api.pvp.net/" % REGION

def get_featured_games():
    res = req.get("%sobserver-mode/rest/featured?api_key=%s" % (URL_PREFIX, REGION, API_KEY))
    return res.status_code if res.status_code != 200 else res.json()["gameList"]

def get_challengers(queue="RANKED_SOLO_5x5"):
    res = req.get("%sapi/lol/%s/v2.5/league/challenger?type=%s&api_key=%s" % (URL_PREFIX, REGION, queue, API_KEY))
    return res.status_code if res.status_code != 200 else res.json()["entries"]

def get_match_history_for_summoner(summonerId, queue="RANKED_SOLO_5x5"):
    res = req.get("%sapi/lol/%s/v2.2/matchhistory/%s?rankedQueues=%s&api_key=%s" % (URL_PREFIX, REGION, summonerId, queue, API_KEY))
    return res.status_code if res.status_code != 200 else res.json()["matches"]

def get_match_data_from_id(matchId):
    res = req.get("%sapi/lol/%s/v2.2/match/%s?api_key=%s" % (URL_PREFIX, REGION, matchId, API_KEY))
    return res.status_code if res.status_code != 200 else res.json()

def challenger_match_ids(queue="RANKED_SOLO_5x5"):
    uniqueMatches = set()
    challengers = get_challengers(queue=queue)
    if type(challengers) is not list:
        print "Failed to get list of challengers (error code %d)" % challengers
        return list(uniqueMatches)
    challengerIds = [challenger["playerOrTeamId"] for challenger in challengers]
    try:
        for challengerId in challengerIds:
            time.sleep(1.5)
            matches = get_match_history_for_summoner(challengerId, queue=queue)
            print "Attempting to fetch matches for summoner %s..." % challengerId
            if type(matches) is list:
                [uniqueMatches.add(match["matchId"]) for match in matches]
            else:
                print "Failed to get matches for id %s (error code %d)" % (challengerId, matches)
    except Exception as e:
        print "Exiting early with error: %r" % e
    return list(uniqueMatches)

def matches_by_id_for_ids(matchIds):
    matches = {}
    try:
        for matchId in matchIds:
            time.sleep(1.5)
            if matchId in matches:
                continue
            match = get_match_data_from_id(matchId)
            print "Attempting to fetch match %s..." % matchId
            if type(match) is dict:
                matches[matchId] = match
            else:
                print "Failed to get match %s (error code %d)" % (matchId, match)
    except Exception as e:
        print "Exiting early with error: %r" % e
    return matches
