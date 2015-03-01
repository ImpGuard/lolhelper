import json
import numpy as np

def filename_with_extension(filename, extension):
    extension = "." + extension if extension[0] != "." else extension
    return filename + extension if filename[-len(extension):] != extension else filename

def data_at_keypath(data, keyPath):
    if not hasattr(keyPath, "__iter__"):
        keyPath = (keyPath,)
    for key in keyPath:
        if key not in data:
            return None
        data = data[key]
    return data

def load_json_as_object(filename):
    filename = filename_with_extension(filename, "json")
    jsonFile = open(filename, "r")
    dataAsString = jsonFile.read()
    jsonFile.close()
    return json.loads(dataAsString)

def save_object_as_json(filename, data):
    filename = filename_with_extension(filename, "json")
    dataAsString = json.dumps(data, ensure_ascii=True)
    out = open(filename, "w")
    out.write(dataAsString)
    out.close()

def show_histogram(priData, altData=None, bins=10):
    altData = np.array([]) if altData is None else altData
    _, aggregateBins = np.histogram(np.hstack((priData, altData)), bins=bins)
    priHeights, _ = np.histogram(priData, bins=aggregateBins)
    altHeights, _ = np.histogram(altData, bins=aggregateBins)
    width = (aggregateBins[1] - aggregateBins[0]) / 2. if len(altData) > 0 else aggregateBins[1] - aggregateBins[0]
    plt.bar(aggregateBins[:-1], priHeights, width=width, color="b")
    plt.bar(aggregateBins[:-1] + width, altHeights, width=width, color="r")
    plt.show()

def show_scatterplot(priData, altData=None, alpha=0.1):
    plt.scatter(priData[0],priData[1], c="b", marker=".", alpha=alpha, lw=0, s=300)
    if altData is not None:
        plt.scatter(altData[0], altData[1], c="r", marker=".", alpha=alpha, lw=0, s=300)
    plt.show()

"""
Returns a randomly scrambled copy of a set of training data and its corresponding labels.
"""
def scramble_data_and_labels(data, labels):
    indices = np.array([i for i in xrange(len(labels))], dtype=np.int)
    np.random.shuffle(indices)
    return data[indices], labels[indices]

"""
Runs the given function, wrapping execution of the function with timing outputs.
"""
def run_and_time(message, function, messageLimit=70):
    print message, " " * (messageLimit - len(message)),
    sys.stdout.flush()
    currentTime = time()
    result = function()
    print "    done. (%.2f seconds)" % (time() - currentTime)
    return result

"""
Converts raw data into a dictionary mapping each classification to an array containing
image data for that classification.
"""
def data_by_class(data, labels):
    dataByClass = {}
    for label in labels:
        if int(label) not in dataByClass:
            dataByClass[int(label)] = data[np.where(labels == label)[0]]
    return dataByClass

"""
Given training data by classes, a total sample size and the number of partitions k to
divide the data into, returns a list of k (training data, classification) tuples.
"""
def collect_data_for_kfcv_training(data, labels, k=8):
    totalSize = len(data)
    data, labels = scramble_data_and_labels(data, labels)
    partitionSize = int(round(totalSize / float(k)))
    result = []
    for offset in xrange(0, totalSize, partitionSize):
        end = min(offset + partitionSize, totalSize)
        if offset is end:
            continue
        result.append((data[offset:end], labels[offset:end]))
    return result

"""
Computes the fraction of entries in the given arrays that match.
"""
def prediction_accuracy(predicted, expected):
    correctEvaluationCount = 0
    for prediction, expectation in zip(predicted, expected):
        if prediction == expectation:
            correctEvaluationCount += 1
    return float(correctEvaluationCount) / len(predicted)
