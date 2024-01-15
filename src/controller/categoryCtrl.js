const  Category = require('../models/categoryModel')
const  Book = require('../models/bookModule')
const  Comment = require('../models/commentModule')
const JWT = require('jsonwebtoken');
const {v4} = require('uuid');

const path = require('path');
const fs = require('fs');


const SECRET_KEY = "Top@lm|san";

const uploadsDir = path.join(__dirname, "../", "files");
const categoryCtrl = {
    add: async (req, res) => {
        try {
            const {title} = req.body;
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
            const category = await Category.create({title, image: nameImage});
            res.status(201).send({message: 'Category added successfully', category});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    
    get: async (req, res) => {   
        try {
            const category = await Category.find()

            res.status(201).send({message: 'Category list', category});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    delete: async (req, res) => {
        try {
            const {id} = req.params;
            const {token} = req.headers
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const currentUser = JWT.decode(token);
            if(currentUser.role == "superadmin"){
                const category = await Category.findById(id)
                if(!category){
                    return res.status(404).send({message: "Category not found"})
                }
                const books = await Book.find({categoryId: id});
                books.forEach(async book =>  {
                    fs.unlinkSync(path.join(uploadsDir, book.photo), (err) => {
                        if(err){
                            return res.status(503).send({message: err.message})
                        }
                    })
                    await Comment.deleteMany({bookId: book._id});
                })
                fs.unlinkSync(path.join(uploadsDir, category.image), (err) => {
                    if(err){
                        return res.status(503).send({message: err.message})
                    }
                })
                await Category.findByIdAndDelete(id)
                await Book.deleteMany({categoryId: id});
                return res.status(201).send({message: 'Category delete successfully', category});
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    update: async (req, res) => {
        try {
            const {id} = req.params;
            const {title} = req.body;
            const {token} = req.headers
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const currentUser = JWT.decode(token);
            if(currentUser.role == "superadmin" || currentUser.role == "admin"){
            const findProduct = await Category.findById(id);
            if(!findProduct){
                return res.status(404).send({message: "Category not found"});
            }

            if(req.files){
                const {image} = req.files;
                if(findProduct && image){
                    await fs.unlink(path.join(uploadsDir, findProduct.image), (err) => {
                        if(err){
                            return res.status(503).send({message: err.message});
                        }
                })
    
                const format = image.mimetype.split('/')[1];
                if(format !== 'png' && format !== 'jpeg') {
                    return res.status(403).send({message: 'file format incorrect'});
                }
    
                const nameImg = `${v4()}.${format}`;
    
                image.mv(path.join(uploadsDir, nameImg), (error) => {
                if (error) {
                    return res.status(503).send({ message: err.message });
                }
                });
    
                findProduct.image = nameImg;
                }
            }
            findProduct.title = title  ? title : findProduct.title;
            const updatePrduct = await Category.findByIdAndUpdate(id, findProduct, {new: true,});
            return res.status(201).send({message: 'Category updaten successfully', category: updatePrduct});
        }
        return res.status(405).send({message: "Not allowed !"})
        } catch (error) {
            res.status(503).send({message: error.message});
        }

    },
    getOne: async (req, res) => {
        try {
            const {bookId} = req.params;
            let category = await Category.findById(bookId);
            if(!category) {
                return res.status(404).send({message: "Category is Not Found"})
            }
            const books = await Book.find({categoryId: bookId});
            category._doc.books = books
            res.status(200).send({message: 'Category', category});
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    }
}

module.exports = categoryCtrl;