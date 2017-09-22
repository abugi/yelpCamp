var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

//Root Route    
router.get("/", function(req, res){
    res.render("campgrounds/home");
});

//AUTH ROUTES
//SIGN UP ROUTE
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(error, user){
        if(error){
            req.flash("error", error.message);
            return res.redirect("/register");
        }
            passport.authenticate("local")(req,res, function(){
            req.flash("success", "Welcome to YelpCamp! " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTE
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"  
}), function(req, res){
    
});

//LOGOUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "See you soon!!");
    res.redirect("/campgrounds");
});

module.exports = router;
