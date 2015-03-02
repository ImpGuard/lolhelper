$(function() {
    var $searchBtn = $(".search");
    var $usernameInput = $(".username")
    var $regionGrp = $(".region");
    var $roleGrp = $(".role");

    $searchBtn.click(function() {
        var region = $regionGrp.find("button .value").text().toLowerCase();
        var role = $roleGrp.find("button .value").text().toLowerCase();
        var username = $usernameInput[0].value.toLowerCase();
        var url = "/analysis";

        window.location = url + "?" + $.param({role: role, region: region, username: username});
    });

    $regionGrp.add($roleGrp).find("li a").click(function() {
        $this = $(this)
        var selection = $this.text();
        $this.closest(".btn-group").find("button .value").html(selection)
    });
});