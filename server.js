var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

//var Note = require("./models/Note.js");
//var Article = require("./models/Article.js");

//var request = require("request");
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");
var db = require("./models")
var app = express();

//Define port
var PORT = process.env.PORT || 3000

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main",
partialsDir: path.join(__dirname, "/views/layouts/partials")
 }));
app.set("view engine", "handlebars");
// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/MongoScraper");
mongoose.connect("mongodb://heroku_vkbz8fcc:2lfqguqsgc6hl9ep5a0edohd1o@ds161312.mlab.com:61312/heroku_vkbz8fcc");
var connection = mongoose.connection;
connection.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
connection.once("open", function() {
  console.log("Mongoose connection successful.");
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/MongoScraper";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from reddit's webdev board:" +
            "\n***********************************\n");

//Scrape data from one site and place it into the mongodb db
//app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`

  app.get("/", function(req, res) {
    db.Article.find({}, function(error, data) {

      console.log(data);
      res.render("home",{article: data});
    });
  });

  app.get("/saved", function(req, res) {
    db.Article.find({"saved": true}, function(error, data) {

      // app.get("/saved", function(req, res) {
      //   db.Article.find({"saved": true}).populate("notes").then(function(error, data) {
      console.log(data);
      res.render("saved",{article: data});
    });
  });

  

  app.get("/scrape", function(req, res) { 
  axios.get("https://www.webmd.com/news/articles").then(function(response) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(response.data);
    
    //For each element with a "title" class
    $(".article-title").each(function(i, element) {
        var result = {};
      //Save the text and href of each link enclosed in the current element
      result.title = $(this).text();
      result.summary = $(this).next().text();
      result.link = $(this).parent("a").attr("href");

      console.log(result);

// Create a new Article using the `result` object built from scraping
db.Article.create(result)
.then(function(dbArticle) {
  // View the added result in the console
  console.log(dbArticle);
  res.render("home", {article: dbArticle});
})
.catch(function(err) {
  // If an error occurred, send it to the client
  return res.json(err);
});
});

// If we were able to successfully scrape and save an Article, send a message to the client

});
  });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  



  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("notes")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/save/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    console.log(req.body.myData);
  
    
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
      
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
//Delete an article

app.post("/articles/delete/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false,"notes": [] })
  
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
  });

  // Create a new note
  app.post("/notes/save/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    console.log('request here', req)
    var newNote = new Note({
      body: req.body.text,
      article: req.params.id
    });
    console.log(req.body.text)
    // And save the new note the db
    // newNote.save(function(error, notes) {
      // Log any errors
      // if (error) {
        // console.log(error);
      // }
      // Otherwise
      // else {
        // Use the article id to find and update it's notes {$push: {friends: friend}}
        
        db.Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { notes: newNote } }, { new : true })
        // Execute the above query
        .then(function(err) {
          // Log any errors
          if (err) {
            console.log(err);
            res.send(err);
          }
          else {
            // Or send the note to the browser
            console.log('notes here', notes);
            res.send(notes);
          }
        });
      })
    // });
  // });


  // Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });


