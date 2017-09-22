var mongoose = require("mongoose");
var campground = require("./models/campground");
var comment    = require("./models/comment");


var data = [
     {
          name: "Canyon Beast",
          image: "https://farm3.staticflickr.com/2311/2123340163_af7cba3be7.jpg",
          description: "I used to admire this camp because of the female developer that constructed it.",
     },
     {
          name: "Kulli Katcha",
          image: "https://farm3.staticflickr.com/2580/3942698066_9157ac5123.jpg",
          description: "Kansas is one of my favorite camps to visit. this is because it gives you free access to beauty of the nature."
     },
     {
          name: "Betwayli Falls",
          image: "https://farm4.staticflickr.com/3221/5710775718_bfd8078fb7.jpg",
           description: "Betwayli is one of my favorite camps to visit. this is because it gives you free access to beauty of the nature."
     }
]

function seedDB(){
     campground.remove({}, function(error){
          if(error){
               console.log(error);
          }else{
               data.forEach(function(seed){
                    campground.create(seed, function(error, newCampground){
                         if(error){
                              console.log(error);
                         }else{
                              comment.create({
                                   text: "This comment applies to all campgrounds for now. Real comments comments coming later.",
                                   author: "Musa Abugi"
                              }, function(error, comment){
                                   if(error){
                                        console.log(error);
                                   }else{
                                        newCampground.comments.push(comment);
                                        newCampground.save();
                                   }
                              });
                         }
                    });
               });
          }
     });
}
module.exports = seedDB;
