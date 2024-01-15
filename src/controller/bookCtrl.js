const  Category = require('../models/categoryModel')
const  Book = require('../models/bookModule')
const  User = require('../models/userModel')
const  Comment = require('../models/commentModule')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const {v4} = require('uuid');

const SECRET_KEY = "Top@lm|san"

const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, "../", "files");

const bookCtrl = {
    add: async (req, res) => {
        try {
            const {token} = req.headers;
            if(!req.files){
                return res.status(403).send({message: 'Book image is required'})
            }
            const findCategory = await Category.findById(req.body.categoryId)
            if(!findCategory){
                return res.status(403).send({message: 'Category is Not Found'})
            }
            const ownerId = JWT.decode(token)._id;
            req.body.ownerId = ownerId
            const {image} = req.files;
            const format = image.mimetype.split('/')[1];
            if(format !== 'png' && format !== 'jpeg') {
                return res.status(403).send({message: 'file format incorrect'})
            }

            const nameImage = `${v4()}.${format}`
            image.mv(path.join(uploadsDir, nameImage), (err) => {
                if(err){
                    return res.status(503).send({message: err.message})
                }
            })
            req.body.photo = nameImage
            const book = await Book.create(req.body);
            res.status(201).send({message: 'Book added successfully', book});


        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    get: async (req, res) => {
        try {
            let books = await Book.find();
            res.status(200).send({message: 'All books', books})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    getOne: async (req, res) => {
        try {
            const {bookId} = req.params;
            let book = await Book.findById(bookId);
            if(!book) {
                return res.status(404).send({message: "Book is Not Found"})
            }
            const comments = await Comment.find({bookId}); 
            for (const comment of comments) {
                const user = await User.findById(comment.userId)
                comment._doc.user = user.email
   
            }
            book._doc.comments = comments
            res.status(200).send({message: 'Book', book});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    delete: async (req, res) => {
        try {
            const {bookId} = req.params;
            const {token} = req.headers
            const book = await Book.findById(bookId)
            if(!book){
                return res.status(404).send({message: "Book not found"})
            }
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const currentUser = JWT.decode(token);
            if(book.ownerId == currentUser._id || currentUser.role == "admin" || currentUser.role == "superadmin"){
                const book = await Book.findByIdAndDelete(bookId)
                await fs.unlink(path.join(uploadsDir, book.photo), (err) => {
                    if(err){
                        return res.status(503).send({message: err.message})
                    }
                })
                await Comment.deleteMany({bookId: bookId});
                return res.status(201).send({message: 'Book delete successfully', book});   
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    like: async (req, res) => {
        try {
            const {bookId} = req.params;
            const {token} = req.headers
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const UserId = JWT.decode(token)._id;
            const book = await Book.findById(bookId);
            if(!book){
                return res.status(404).send({message: "Book is Not Found"})
            }
            if(book.like.includes(UserId)){
                await book.updateOne({$pull: {like: UserId}})
                res.status(200).send({message: "Like lancled"})
            } else {
                if(book.dislike.includes(UserId)){
                    await book.updateOne({$pull: {dislike: UserId}})
                }
                await book.updateOne({$push: {like: UserId}})
                res.status(200).send({message: "Like added"})
            }
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    dislike: async (req, res) => {
        try {
            const {bookId} = req.params;
            const {token} = req.headers
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const UserId = JWT.decode(token)._id;
            const book = await Book.findById(bookId);
            if(!book){
                return res.status(404).send({message: "Book is Not Found"})
            }
            if(book.dislike.includes(UserId)){
                await book.updateOne({$pull: {dislike: UserId}})
                res.status(200).send({message: "dislike lancled"})
            } else {
                if(book.like.includes(UserId)){
                    await book.updateOne({$pull: {like: UserId}})
                }
                await book.updateOne({$push: {dislike: UserId}})
                res.status(200).send({message: "dislike added"})
            }
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    download: async (req, res) => {
        try {
            const {bookId} = req.params;
            const {token} = req.headers
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const UserId = JWT.decode(token)._id;
            const book = await Book.findById(bookId);
            if(!book){
                return res.status(404).send({message: "Book is Not Found"})
            }
            await book.updateOne({$inc: {downloadCount: 1}})

            res.status(200).download(uploadsDir + "/" + book.photo, book.title);
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    update: async (req, res) => {
        try {
            const {bookId} = req.params;
            const {token} = req.headers;
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const findBook = await Book.findById(bookId)
            if(!findBook){
                return res.status(404).send({message: "Book not found"})
            }
            const currentUser = JWT.decode(token);
            console.log(currentUser);
            if(findBook.ownerId == currentUser._id || currentUser.role == "admin" || currentUser.role == "superadmin"){
                if(req.files){
                    const {image} = req.files;
                    if(findBook && image){
                        await fs.unlink(path.join(uploadsDir, findBook.photo), (err) => {
                            if(err){
                                return res.status(503).send({message: err.message});
                            }})
                        }
                        const format = image.mimetype.split('/')[1];
                    if(format !== 'png' && format !== 'jpeg') {
                        return res.status(403).send({message: 'file format incorrect'})
                    }
                    const nameImage = `${v4()}.${format}`
                    image.mv(path.join(uploadsDir, nameImage), (err) => {
                        if(err){
                            return res.status(503).send({message: err.message})
                        }
                    })
                    req.body.photo = nameImage;
                }
                if(req.body.ownerId == ''){
                    delete req.body.ownerId 
                }
                if(req.body.categoryId === ''){
                    delete req.body.categoryId
                }
                const book = await Book.findByIdAndUpdate(bookId, req.body, {new: true});
                return res.status(200).send({message: 'Updated successfully', book});
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
}

module.exports = bookCtrl