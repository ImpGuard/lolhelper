$(function() {
    var $title = $("#title");
    var $fakeTitle = $(".fake-title");
    var $dial = $title.find(".dial");
    var $content = $("#content");
    var dial;

    //------------------------------------------------------------
    // Create main dial
    //------------------------------------------------------------

    var createDial = function() {
        var progressBar = new ProgressBar.Circle($dial[0], {
            color: "#e99002",
            strokeWidth: 4.0,
            trailColor: "#e99002",
            trailWidth: 1.0,
            text: {
                value: "0",
                color: "black"
            },
            step: function(state, bar) {
                bar.setText((bar.value() * 100).toFixed(0) + "%")
            },
            easing: "bounce",
            duration: 2000
        });

        return progressBar;
    }

    dial = createDial();

    //------------------------------------------------------------
    // Resizing the fake title
    //------------------------------------------------------------

    var resizeFakeTitle = function() {
        $fakeTitle.height($title.outerHeight());
    };

    //------------------------------------------------------------
    // Knob code
    //------------------------------------------------------------

    // HACK HACK Knob width is constant
    KNOB_WIDTH = 120

    var createKnob = function($parent, min, max, release, text) {
        $parent.knob({
            min: min,
            max: max,
            width: KNOB_WIDTH,
            height: KNOB_WIDTH,
            fgColor: "#b9e672",
            thickness: 0.2,
            angleOffset: -100,
            angleArc: 200,
            release: release
        });
    }

    /**
     * Knobs is a list of "specifications" that will be used to build each knob.
     * Each specification is a dictionary containing:
     *
     * min      - min width
     * max      - max width
     * initial  - initial value
     * text     - title
     * change   - a function that will be called when the knob's value changes
     */
    var createModule = function(knobs) {
        var $module = $("<div />").addClass("row module");
        var numOfKnobs = knobs.length
        for (var i = 0; i < numOfKnobs; i++) {
            var knob = knobs[i];
            var initial = knob.initial;
            var min = knob.min;
            var max = knob.max;
            var text = knob.text;
            var change = knob.change;

            // HACKHACK, assumes number of knobs is a factor of 12
            var columnSize = 12 / numOfKnobs;

            var $element = $("<div />").addClass("col-md-" + columnSize).addClass("module-column");
            var $knob = $("<input />").addClass("knob").attr("value", initial)
            var $text = $("<div />").addClass("text").text(text).css({
                width: KNOB_WIDTH,
                position: "absolute",
                top: KNOB_WIDTH / 2 + 30,
                textAlign: "center"
            });

            $element.append($knob);
            createKnob($knob, min, max, change, text);
            // HACKHACK assumes the internals of the library
            $knob.parent().append($text);

            $module.append($element);
        }

        $content.append($module)
    };

    //------------------------------------------------------------
    // Entry point
    //------------------------------------------------------------

    var queryDict = {};
    window.location.search.substr(1).split("&").forEach(function(item) {
        keyAndParam = item.split("=");
        queryDict[keyAndParam[0]] = keyAndParam[1];
    });

    var generateModules = function(classifier, matchData) {
        var module1 = [
            {
                min: 0,
                max: 100,
                initial: 0,
                title: "hi",
                change: function(val) {
                    // Mutate matchData
                    // var features = featuresFromMatches(matchData, username, role);
                    var percent = classifier.predict(features);
                    dial.animate(percent);
                }
            }
        ]

        createModule(module1);
    };

    var start = function() {
        username = queryDict["username"];
        role = queryDict["role"];
        var region = queryDict["region"];

        getMatchData(username, function(_matchData) {
            matchData = _matchData
            features = featuresFromMatches(matchData, username, role);

            getClassifier(role, function(classifier) {
                var percent = classifier.predict(features);
                dial.animate(percent);
                // generateModules(classifier, matchData);
            });
        });
    };

    start();
});