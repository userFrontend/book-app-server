const  User = require('../models/userModel')
const Comment = require('../models/commentModule');
const Book = require('../models/bookModule');
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const {v4} = require('uuid');

const SECRET_KEY = "Top@lm|san"

const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, "../", "files");

const authCtrl = {
    signup: async (req, res) => {
        try {
            const {name, surname, email, password, role} = req.body
            const oldUser = await User.findOne({email});
            if(oldUser){
                return res.status(400).send('this is email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({name, surname, email, password: hashedPassword,  role});
            const token = JWT.sign({name: user.name, surname: user.surname, _id: user._id, role: user.role}, SECRET_KEY);
            res.status(201).send({message: 'Signup successfully', token, user: {_id: user._id, avatar: user.avatar, name: user.name, surname: user.surname, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt, role: user.role}})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    login: async (req, res) => {   
        try {
            const {email, password} = req.body
            if(!email || !password){
                return res.status(400).send("fill in all the lines")
            }
            const findUser = await User.findOne({email});   
            if(!findUser){
                return res.status(400).send('Login or Password is inCorrect');
            }
            const verifyPassword =  await bcrypt.compare(password, findUser.password);
            if(!verifyPassword){
                return res.status(400).send('Login or Password is inCorrect')
            }
            const token = JWT.sign({name: findUser.name, surname: findUser.surname, _id: findUser._id, role: findUser.role}, SECRET_KEY);

            res.status(200).send({message: 'Login successfully', token, user: {_id: findUser._id, avatar: findUser.avatar, name: findUser.name, surname: findUser.surname, email: findUser.email, createdAt: findUser.createdAt, updatedAt: findUser.updatedAt, role: findUser.role}})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    getAll: async (req, res) => {
        try {
            let users = await User.find();
            users = users.map(user => {
                const {password, role, ...otherDetails} = user._doc
                return otherDetails
            })
            res.status(200).send({message: 'All users', users})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    getOne: async (req, res) => {
        try {
            const {userId} = req.params;
            const findUser = await User.findById(userId)
            if(!findUser){
                return res.status(404).send('User is Not found');
            }
            const {password, ...otherDetails} = findUser._doc
            res.status(200).send({message: 'Find user', user: otherDetails})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    del: async (req, res) => {
        try {
            const {userId} = req.params;
            const {token} = req.headers;
            const {password} = req.body 
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const currentUser = JWT.decode(token);
            if(userId === currentUser._id || currentUser.role === "admin" || currentUser.role === "superadmin"){
                const deleteUser = await User.findById(userId);
                if(!deleteUser){
                    return res.status(404).send({message: 'User is Not Found'})
                }
                const findBooks = await Book.find({ownerId: userId})
                if(findBooks.length > 0){
                    return res.status(403).send({message: 'you added a book please delete the book or change the owner before deleting the account'})
                }
                if(deleteUser){
                    const verifyPassword = bcrypt.compareSync(password, deleteUser.password);
                    if(!verifyPassword){
                        return res.status(400).send({message: 'Password is inCorrect'})
                    }
                    await Comment.deleteMany({userId: userId});
                    await User.deleteOne({_id: userId});
                }
                if(deleteUser.avatar){
                    fs.unlinkSync(path.join(uploadsDir, deleteUser.avatar), (err) => {
                        if(err){
                            return res.status(503).send({message: err.message})
                        }
                    })
                }
                return res.status(200).send({message: 'Delete successfully', deleteUser})
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
    update: async (req, res) => {
        try {
            const {password} = req.body
            const {userId} = req.params;
            const {token} = req.headers;
            if(!token){
                return res.status(403).send({message: 'Token is required'})
            }
            const currentUser = JWT. decode(token);
            if(userId == currentUser._id || currentUser.role == "admin" || currentUser.role == "superadmin"){
                if(password && (password != "")){
                    const hashedPassword = await bcrypt.hash(password, 10);
                    req.body.password = hashedPassword;
                } else{
                    delete req.body.password
                }
                if(req.files){
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
                    req.body.avatar = nameImage;
                }

                const user = await User.findByIdAndUpdate(userId, req.body, {new: true});
                return res.status(200).send({message: 'Updated successfully', user});
            }
            res.status(405).send({message: 'Not Allowed!'})
        } catch (error) {
            res.status(503).send({message: error.message})
        }
    },
}

module.exports = authCtrl