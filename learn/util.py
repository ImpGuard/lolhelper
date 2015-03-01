import json

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