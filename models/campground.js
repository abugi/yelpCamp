var mongoose = require("mongoose");

//Schema for yelp camp
var campgroundSchema = mongoose.Schema({
    name: String,
    image: String,
    description: String,
    upload: Buffer,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ]
});

//compiling Schema into model
var campground = mongoose.model("campground", campgroundSchema);

module.exports = campground;