$(function() {
    var $title = $("#title");
    var $fakeTitle = $(".fake-title");
    var $dial = $title.find(".dial");
    var $content = $("#content");

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

    var dial = createDial();
    dial.animate(0.7);

    //------------------------------------------------------------
    // Resizing the fake title
    //------------------------------------------------------------

    var resizeFakeTitle = function() {
        $fakeTitle.height($title.outerHeight());
    };

    resizeFakeTitle();

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

            var $element = $("<div />").addClass("col-md-" + columnSize);
            var $knob = $("<input />").addClass("knob").attr("value", initial)
            var $text = $("<div />").addClass("text").text(text).css({
                position: "absolute",
                width: KNOB_WIDTH,
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

    createModule([
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Gold",
            change: function(v) { console.log(v) }
        },
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Creep Score",
            change: function(v) { console.log(v) }
        },
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Your age",
            change: function(v) { console.log(v) }
        }
    ])
    createModule([
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Gold",
            change: function(v) { console.log(v) }
        },
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Creep Score",
            change: function(v) { console.log(v) }
        },
        {
            initial: 0,
            min: 0,
            max: 100,
            text: "Your age",
            change: function(v) { console.log(v) }
        }
    ])

});