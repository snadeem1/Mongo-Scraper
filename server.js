//var express = require("express");
//var bodyParser = require("body-parser");
//var logger = require("morgan");
//var mongoose = require("mongoose");
//var path = require("path");


var request = require("request");
var cheerio = require("cheerio");

//var app = express();

console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from reddit's webdev board:" +
            "\n***********************************\n");

//Scrape data from one site and place it into the mongodb db
//app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`
  request("https://www.webmd.com/news/articles", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    var results = [];
    //For each element with a "title" class
    $(".article-title").each(function(i, element) {
      //Save the text and href of each link enclosed in the current element
      var title = $(element).text();
      var summary = $(element).next().text();
      var link = $(element).parent("a").attr("href");


    // $("a").each(function(i, element) {
    // var title = $(element).children("span.article-title").text();
    // var summary = $(element).children("p.article-description").text();
    // var link = $(element).attr("href");


      results.push({
        title: title,
        summary: summary,
        link: link
      });
    });
  
    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results);
  });