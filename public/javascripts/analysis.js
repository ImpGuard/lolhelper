$(function() {
    var $title = $(".title")
    var $fakeTitle = $(".fake-title")
    var $dial = $title.find(".dial")

    //------------------------------------------------------------
    // Create main dial
    //------------------------------------------------------------

    var createDial = function() {
        var progressBar = new ProgressBar.Circle($dial[0], {
            color: "#e99002"
        })

        return progressBar
    }

    var dial = createDial()
    dial.animate(0.7)

    //------------------------------------------------------------
    // Resizing the fake title
    //------------------------------------------------------------

    var resizeFakeTitle = function() {
        $fakeTitle.height($title.outerHeight());
    };

    resizeFakeTitle();

    $(".dial").knob({
        "min":0,
        "max":100,
        "width": 120,
        "height": 120,
        "fgColor": "#b9e672",
        "thickness": 0.2,
        "angleOffset": -90,
        "angleArc": 180,
    });
});