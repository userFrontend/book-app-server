const  Comment = require('../models/commentModule')
const  Book = require('../models/bookModule')
const JWT = require('jsonwebtoken');

const path = require('path');
const fs = require('fs');
const { log } = require('console');


const SECRET_KEY = "Top@lm|san";

const uploadsDir = path.join(__dirname, "../", "files");

const commentCtrl = {
    add: async (req, res) => {
        try {
            const {bookId} = req.params
            const {token} = req.headers;
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const findBook = await Book.findById(bookId);
            if(!findBook){
                return res.status(404).send({message: "Book not found"})
            }
            const currentUser = await JWT.decode(token)._id;
            req.body.userId = currentUser
            req.body.bookId = bookId;
            const comment = await Comment.create(req.body);
            res.status(201).send({message: 'Comment added successfully', comment});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    delete: async (req, res) => {
        try {
            const {commentId} = req.params;
            const {token} = req.headers
            const currentUser = JWT.decode(token);
            const comment = await Comment.findById(commentId)
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            if(!comment){
                return res.status(404).send({message: "Comment not found"})
            }
            if(comment.userId == currentUser._id || currentUser.role == "admin" || currentUser.role == "superadmin"){
                const comment = await Comment.findByIdAndDelete(commentId)
                return res.status(201).send({message: 'Comment delete successfully', comment});   
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    update: async (req, res) => {
        try {
            const {commentId} = req.params;
            const {token} = req.headers
            const currentUser = JWT.decode(token);
            const findComment = await Comment.findById(commentId);
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            if(!findComment){
                return res.status(404).send({message: "Cooment not found"});
            }
            if(findComment.userId == currentUser._id || currentUser.role == "admin" || currentUser.role == "superadmin"){ 
                const updatePrduct = await Comment.findByIdAndUpdate(commentId, req.body, {new: true,});
                return res.status(201).send({message: 'Comment update successfully', Comment: updatePrduct});
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message});
        }

    },

}

module.exports = commentCtrl;