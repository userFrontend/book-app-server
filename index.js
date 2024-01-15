const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const mongoose = require('mongoose')

const path = require('path');
// routes
const userRouter = require("./src/routes/userRouter")
const categoryRouter = require("./src/routes/categoryRouter")
const bookRouter = require("./src/routes/bookRouter");
const commentRouter = require('./src/routes/commentRouter');

const app = express();
const PORT = process.env.PORT || 4000;

// static folder
app.use(express.urlencoded({extended: true}));

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'files')))
app.use(fileUpload())
app.use(cors()) 

app.get('/', (req, res) => {
    res.send('Ok')
})

// use router
app.use('/api', userRouter)
app.use('/api', categoryRouter)
app.use('/api', bookRouter)
app.use('/api', commentRouter)

const start = async() => {
    try {
        await mongoose.connect('mongodb://localhost:27017/bookApp', {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        })
        app.listen(PORT, () => console.log(`PORT started with ${PORT}`))
    } catch (error) {
        console.log(error);
    }
}
start()



