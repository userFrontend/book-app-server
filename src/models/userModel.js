const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            minlength: 3,
        },
        surname: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
        },
        password: {
            type: String,
            require: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            default: "user",
            enum: ["user", "admin", "superadmin"]
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);