$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
          res.render("home",{article: data});
        window.location = "/"
    })
});



//Handle Save Article button
$(".save").on("click", function() {
    // var thisId = $(this).attr("data-id");

    var thisId = $(this).attr("data-id");
    $.ajax({
        method: "POST",
        url: "/articles/save/" + thisId
    }).done(function(data) {
        window.location = "/"
    })
});
