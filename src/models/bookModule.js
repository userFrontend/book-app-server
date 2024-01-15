const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
            minlength: 3,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
        photo: {
            type: String,
            require: true,
        },
        like: {
            type: Array,
            default: [],
        },
        dislike: {
            type: Array,
            default: [],
        },
        author: {
            type: String,
            require: true,
            minlength: 3,
        },
        ownerId:{
            type: String,
            require: true,
        },
        categoryId: {
            
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Book", bookSchema);