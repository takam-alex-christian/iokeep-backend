
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
    username: { type: String, required: true },
    password: { type: String, required: true }, // will be replaced by a hash later
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


expressApp.route("/auth")
    .get(async (req, res) => {

        //this whole api will be documented later
        switch (req.query.q) { //q is pretty much like action
            case "check_username": {
                let responseObject = {
                    available: false,
                }

                await UserModel.exists({ username: req.query.username }).then(doc => {
                    //username found
                    if (doc == null) responseObject.available = true
                    //else username not found
                })

                res.send(responseObject);

                break;
            }default: {
                console.log("wrong q")
            }
        }


    })


expressApp.route("/user")
    .get(async (req, res) => {

        switch (req.query.action) {
            case "check_username": { //"check_username"

                let responseObject = {
                    available: false,
                }

                await UserModel.exists({ username: req.query.username }).then(doc => {
                    //username found
                    if (doc == null) responseObject.available = true
                    //else username not found
                })

                res.send(responseObject);

                break;
            }

            default: {
                console.log("wrong action received")
            }
        }

        // UserModel.findOne({ username: req.body.username, password: req.body.password }).then(doc => {
        //     console.log(doc);
        //     res.send({ message: "welcome back " + doc.username });
        // })
    })

    .post(async (req, res) => {
        //we validate the data received
        //not quite validated yet.
        let newUserModel = new UserModel({
            username: req.body.username,
            password: req.body.password,
        })

        let jsonResponseBody = {
            message: "",
            doc: {},
            err: null,
        }

        await newUserModel.save().then(newDoc => {
            console.log(newDoc)
            jsonResponseBody.message = "success";
            jsonResponseBody.doc = newDoc;

        }, (err) => {
            console.log(err);
            jsonResponseBody.message = "failed";
            jsonResponseBody.err = err;
        })

        res.send(JSON.stringify(jsonResponseBody))

    })
    .delete(async (req, res) => {
        //user may terminate their account

        let jsonResponseBody = {
            _id: ""
        }

        await UserModel.findByIdAndDelete(req.body._id).then(doc => {
            console.log(doc);

        }, (err) => {

            //handle error here
            console.log(err)
        })

        res.send(
            jsonResponseBody
        )

    })
    .patch((req, res) => {
        //user may change their password later
        //user may change their username later
        res.send("user partially updated")
    })


expressApp.route("/collection")
    .get((req, res) => { //logic to get notes
        res.send({ message: "you get a list of user collections by id and name" })
    })
    .post((req, res) => {
        res.send({ message: "new collection added" })
    })

expressApp.listen(port, () => {
    console.log(`server running on port ${port}`)
})