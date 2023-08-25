
//install dep
// importing libraries
//connect to db

require("dotenv").config()


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")



const expressApp = express();
const port = process.env.PORT || 3000


//app config
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());



//db connection here
mongoose.connect(process.env.DB_URI).catch((err)=>{
    // console.log("connection mostlikely failed")
    throw new Error(err) // connection
});

//schemas

const UserSchema = new mongoose.Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    username: String,
    password: String, // will be replaced by a hash later
    session: String,
    collections: [{
        _id: [mongoose.SchemaTypes.ObjectId],
    }]
})

const CollectionSchema = new mongoose.Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    _ownerId: mongoose.SchemaTypes.ObjectId,
    name: String,
    lastConsulted: {
        type: Date,
        default: ()=>{
            return Date.now();
        }
    },
})

const NoteSchema = new mongoose.Schema({
    _id: mongoose.SchemaTypes.ObjectId,
    _collectionId: mongoose.SchemaTypes.ObjectId,// one note is not expected to be owned by multiple collections
    title: String,
    body: String,
    tags: [String],
    creationDate: {
        type: Date,
        default: ()=>{
            return Date.now()
        }
    },
    lastModified: {
        type: Date,
        default: ()=>{
            return Date.now()
        }
    }
})

//models 
const UsersModel = mongoose.model("User", UserSchema);
const CollectionModel = mongoose.model("Collection", CollectionSchema);
const NoteModel = mongoose.model("Note", NoteSchema);

//routes handlers

expressApp.route("/users")
    .get((req, res) => {
        res.send("users getted");
    })
    .post((req, res)=>{
        res.send("new user posted");
    })
    .delete((req, res)=>{
        res.send("user deleted");
    })
    .patch((req, res)=>{
        res.send("user partially updated")
    })
    .put((req, res)=>{
        res.send("user resources entirely replaced")
    })

    
expressApp.listen(port, () => {
    console.log(`server running on port ${port}`)
})