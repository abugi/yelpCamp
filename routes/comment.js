var express = require("express");
var router = express.Router();
var campground = require("../models/campground");
var comment = require("../models/comment");

//COMMENTS ROUTES
//GET ROUTE - displays the comment form
router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
    campground.findById(req.params.id, function(error, camps){
        if(error){
            console.log(error);
        }else{
            res.render("comments/new", {camps: camps});
        }
    }); 
});

//POST ROUTE - adds new comment to the DB
router.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    campground.findById(req.params.id, function(error, camps){
        if(error){
            req.flash("error", error.message);
            res.redirect("/campgrounds");
        }else{
            comment.create(req.body.comment, function(error, comment){
                if(error){
                    req.flash("error", error.message);
                    res.redirect("/campgrounds");
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    camps.comments.push(comment);
                    camps.save();
                    res.redirect("/campgrounds/" + camps._id);
                }
            });
        }
    });
});

//EDIT - dispalys the edit form for comments
router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    comment.findById(req.params.comment_id, function(error, foundComment){
        if(error){
            req.flash("error", error.message);
            res.redirect("back");
        }else{
            res.render("comments/edit", {camps_id: req.params.id, comment: foundComment});
        }
    })
});

router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(error, updatedComment){
        if(error){
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    comment.findByIdAndRemove(req.params.comment_id, function(error){
        if(error){
            res.redirect("back");
        }else{
            req.flash("success", "Comment successfully deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must login to add a comment");
    res.redirect("/login")
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(error, foundComment){
            if(error){
                req.flash("error", "Something went wrong!");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "Sorry! You don't have permission to carryout this action.");
                    res.redirect("/campgrounds")
                }
            }
        });
    }else{
        res.redirect("/login")
    }
}

module.exports = router;