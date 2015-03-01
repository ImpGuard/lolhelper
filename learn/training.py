from util import *
import numpy as np
from sklearn.linear_model import LogisticRegression

class LogisticClassifier(object):
    def __init__(self, coef=None, offset=None):
        assert not ((coef is None) ^ (offset is None)), "Exactly one of coefficients or offset is None."
        self.coef = coef
        self.offset = offset

    def train(self, data, labels):
        if self.coef is None and self.offset is None:
            model = LogisticRegression()
            model.fit(data, labels)
            self.coef = model.coef_[0]
            self.offset = model.intercept_[0]

    def save(self, filename="classifier.json"):
        save_object_as_json(filename, {
            "coef": [c for c in self.coef],
            "offset": self.offset
        })

    def load(self, filename="classifier.json"):
        obj = load_json_as_object(filename)
        self.coef = np.array(obj["coef"])
        self.offset = obj["offset"]

    """
    Returns the probability of winning given a feature vector x.
    """
    def predict(self, x):
        assert len(x) == len(self.coef), "Input data length should be the same as parameter length."
        return 1. / (1. + np.exp(-np.dot(x, self.coef) - self.offset))

    """
    Returns a list of indices sorted in order from the most impactful feature to the least impactful
    feature.
    """
    def feature_indices_by_importance(self):
        return np.argsort(coef)[::-1]

def kfcv_accuracy(allData, allLabels, k=3):
    dataset = collect_data_for_kfcv_training(allData, allLabels, k=k)
    accuracies = np.zeros(len(dataset))
    for index, (data, labels) in enumerate(dataset):
        trainingData = np.vstack([dataset[i][0] for i in xrange(len(dataset)) if i != index])
        trainingLabels = np.hstack([dataset[i][1] for i in xrange(len(dataset)) if i != index])
        cls = LogisticClassifier()
        cls.train(trainingData, trainingLabels)
        numCorrectPredictions = 0
        validationData, expectedLabels = dataset[index]
        predictedLabels = np.array([(1 if cls.predict(x) > 0.5 else 0) for x in validationData])
        accuracies[index] = prediction_accuracy(predictedLabels, expectedLabels)
    accuracies = np.array(accuracies)
    return accuracies.mean(), accuracies
