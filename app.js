var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    localStrategy = require("passport-local"),
    session     = require("express-session"),
    campground  = require("./models/campground"),
    comment     = require("./models/comment"),
    User        = require("./models/user"),
    flash       = require("connect-flash"),
    methodOverride = require("method-override"),
    seedDB      =require("./seed");

//ROUTER CONFIGURATION
var indexRoutes      = require("./routes/auth");
var commentRoutes    = require("./routes/comment");
var campgroundRoutes = require("./routes/campground");



//seedDB(); //calling the seed.js file
//mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://abugi:jankara@ds147864.mlab.com:47864/yelpcamp");


//PASSPORT CONFIGURATION
app.use(session({
    secret: "she is my favorite girl",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.use(function(req, res, next){
    res.locals.currentUser = req.user,
    res.locals.error = req.flash("error"),
    res.locals.success = req.flash("success"),
    next();
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);

app.listen(process.env.PORT || 3000, function(){
    console.log("Now serving the campgrounds app");
});