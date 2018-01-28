var express = require("express");
var router  = express.Router();
var campground = require("../models/campground");
var multer = require('multer');
var env = require('dotenv/config');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
   

//CREATE - page that creates new record for DB
router.post("/campgrounds", isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.uploader.upload(req.file.path, function (result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        campground.create(req.body.campground, function (err, campground) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
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