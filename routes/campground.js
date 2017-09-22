var express = require("express");
var router  = express.Router();
var campground = require("../models/campground");

//INDEX - shows the main page
router.get("/campgrounds", function(req, res){
    campground.find({}, function(error, allCampgrounds){
        if(error){
            console.log(error)
        }else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
});
   

//CREATE - page that creates a enw record for DB
router.post("/campgrounds", isLoggedIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newcampground = {name: name, image: image, description: description, author: author}
    // Create a new campground and save to database
    campground.create(newcampground, function(error, newlyCreated){
        if(error){
            console.log(error)
        }else{
            res.redirect("/campgrounds")
        }
    });
 });

//NEW - show the form
router.get("/campgrounds/new", isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//SHOW - dispay a page by id
router.get("/campgrounds/:id", function(req, res){
    campground.findById(req.params.id).populate("comments").exec(function(error, camps){
        if(error){
            console.log(error)
        }else{
            res.render("campgrounds/show", {camps: camps});
        }
    });
});

//EDIT ROUTE - Displays the pre-filled form to update a campground
router.get("/campgrounds/:id/edit", checkCampgroundOnership, function(req, res){
   campground.findById(req.params.id, function(error, camps){
        if(error){
            res.redirect("/campgrounds");
        }else{
            res.render("campgrounds/edit", {camps: camps});
        }
    });   
});

//UPDATE ROUTE - to recieve data from the edit form and add to DB
router.put("/campgrounds/:id", checkCampgroundOnership, function(req, res){
    campground.findByIdAndUpdate(req.params.id, req.body.camps, function(error, updatedCampground){
        if(error){
            console.log(error);
            res.redirect("/campgrounds")
        }else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

//DESTROY ROUTE - Removes a particular campground
router.delete("/campgrounds/:id", checkCampgroundOnership, function(req, res){
    campground.findByIdAndRemove(req.params.id, function(error){
        if(error){
            res.redirect("/campgrounds")
        }else{
            req.flash("success", "Deleted Successfully")
            res.redirect("/campgrounds")
        }
    });
});

//Middleware to check if the user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must login to add a campground");
    res.redirect("/login")
}

function checkCampgroundOnership(req, res, next){
    //check if the user is logged in
    if(req.isAuthenticated()){
        campground.findById(req.params.id, function(error, camps){
            if(error){
                res.redirect("back");
            }else{
                //check if the user is the owner of the campground
                if(camps.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "Sorry!!! You don't have permission to carryout this action");
                    res.redirect("back");
                }
            }
        });   
    }else{
        res.redirect("/login");
    }
}

module.exports = router;