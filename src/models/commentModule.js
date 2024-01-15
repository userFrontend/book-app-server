const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            require: true,
            minlength: 3,
        },
        userId: {
            type: String,
            require: true,
        },
        bookId: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Comment", commentSchema);