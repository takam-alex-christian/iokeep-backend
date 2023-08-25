
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
mongoose.connect(process.env.DB_URI).catch((err) => {
    // console.log("connection mostlikely failed")
    throw new Error(err) // connection
});

//schemas

const UserSchema = new mongoose.Schema({
    username: String,
    password: String, // will be replaced by a hash later
    _authToken: mongoose.SchemaTypes.ObjectId, //the 
    collectionsIdArray: [mongoose.SchemaTypes.ObjectId]
})

const CollectionSchema = new mongoose.Schema({
    _ownerUserId: mongoose.SchemaTypes.ObjectId,
    name: String,
    lastConsulted: {
        type: Date,
        default: () => {
            return Date.now();
        }
    },
})

const NoteSchema = new mongoose.Schema({
    _ownerCollectionId: mongoose.SchemaTypes.ObjectId,// one note is not expected to be owned by multiple collections
    title: String,
    body: String,
    tags: [String],
    creationDate: {
        type: Date,
        default: () => {
            return Date.now()
        }
    },
    lastModified: {
        type: Date,
        default: () => {
            return Date.now()
        }
    }
})

//models 
const UserModel = mongoose.model("User", UserSchema);
const CollectionModel = mongoose.model("Collection", CollectionSchema);
const NoteModel = mongoose.model("Note", NoteSchema);

//routes handlers

expressApp.route("/user")
    .get((req, res) => {
        UserModel.findOne({ username: req.body.username, password: req.body.password }).then(doc => {
            console.log(doc);
            res.send({ message: "welcome back " + doc.username });
        })
    })
    .post((req, res) => {
        //we validate the data received
        let newUserModel = new UserModel({
            username: req.body.username,
            password: req.body.password,
        })

        newUserModel.save().then(newDoc => {
            console.log(newDoc)

            res.send(newDoc)
        })
    })
    .delete((req, res) => {
        //user may terminate their account
        res.send("user deleted");
    })
    .patch((req, res) => {
        //user may change their password later
        //user may change their username later
        res.send("user partially updated")
    })


expressApp.route("/collection")
    .get((req, res)=>{ //logic to get notes
        res.send({message: "you get a list of user collections by id and name"})
    })
    .post((req, res)=>{
        res.send({message: "new collection added"})
    })

expressApp.listen(port, () => {
    console.log(`server running on port ${port}`)
})