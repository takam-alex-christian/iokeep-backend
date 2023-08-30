
//install dep
// importing libraries
//connect to db

require("dotenv").config()


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const cookiesParser = require("cookie-parser")


const expressApp = express();
const port = process.env.PORT || 3000


//app config
expressApp.use(bodyParser.urlencoded({ extended: true }));
expressApp.use(bodyParser.json());

expressApp.use(cookiesParser());


//db connection here
mongoose.connect(process.env.DB_URI).catch((err) => {
    // console.log("connection mostlikely failed")
    throw new Error(err) // connection
});

//schemas

const UserSchema = new mongoose.Schema({
    _id: {
        type: mongoose.SchemaTypes.ObjectId,
        default: () => new mongoose.mongo.ObjectId(),
    },
    username: { type: String, required: true },
    password: { type: String, required: true }, // will be replaced by a hash later
    _authToken: {
        type: mongoose.SchemaTypes.ObjectId,
        default: () => {
            return new mongoose.mongo.ObjectId()
        }
    }, //the 
    collectionsIdArray: [mongoose.SchemaTypes.ObjectId]
})

const CollectionSchema = new mongoose.Schema({
    _ownerUserId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    name: String,
    lastConsulted: {
        type: Date,
        default: () => {
            return Date.now();
        }
    },
})

const NoteSchema = new mongoose.Schema({
    _ownerCollectionId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },// one note is not expected to be owned by multiple collections
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



expressApp.get("/auth/check_username", async (req, res) => {

    let responseObject = {
        available: false,
    }

    await UserModel.exists({ username: req.query.username }).then(doc => {
        //username found
        if (doc == null) responseObject.available = true
        //else username not found
    })

    res.send(responseObject);


    // console.log(req.cookies)
})

expressApp.post("/auth/signin", async (req, res) => {

    console.log(req.cookies)
    // console.log(req.body)

    let jsonResponseBody = {
        message: "",
        doc: {},
        err: [],

        //standard response
        succeeded: false //this can be checked on the front end
    }

    const currentDate = new Date(); currentDate.setDate(currentDate.getMonth() + 1);


    await UserModel.findOne({ username: req.body.username }).then(async (fetchedDoc) => {
        if (fetchedDoc != null) {
            if (req.body.password == fetchedDoc.password) {
                let _authToken = new mongoose.mongo.ObjectId();

                fetchedDoc._authToken = _authToken;

                await fetchedDoc.save().then((savedDoc) => {
                    jsonResponseBody.message = "signin successful";
                    jsonResponseBody.doc = savedDoc;
                    jsonResponseBody.succeeded = true;

                    // //we set the _authToken
                    res.cookie("_authToken", savedDoc.username + _authToken.toString(), {
                        httpOnly: true,
                        domain: "localhost", //it's the guy that actually received the cookies
                        path: "/"
                    })
                })


            } else {
                jsonResponseBody.err.push("Wrong Password")
            }
        } else {
            jsonResponseBody.err.push("No account with username <" + req.body.username + "> exists")
        }
    })

    res.send(JSON.stringify(jsonResponseBody))

})

expressApp.post("/auth/signup", async (req, res) => {
    //we validate the data received
    //not quite validated yet.

    //req.body keys could be validated here before use

    let newUserModel = new UserModel({
        username: req.body.username,
        password: req.body.password,
    })

    //response
    let jsonResponseBody = {
        message: "",
        doc: {},
        err: [], //array of errors
        succeeded: false
    }

    const currentDate = new Date( Date.now() ); 
    currentDate.setMonth(currentDate.getMonth() + 1);

    // console.log(req.cookies)

    await UserModel.findOne({
        username: req.body.username
    }).then(async (doc) => {
        if (doc == null) {

            await newUserModel.save().then(newDoc => {
                console.log(newDoc)
                jsonResponseBody.message = "success";
                jsonResponseBody.doc = newDoc;

                res.cookie("_authToken", newDoc._authToken.toString(), {
                    httpOnly: true,
                    domain: "localhost",
                    expires: currentDate,
                    path: "/"
                })

            }, (err) => {
                console.log(err);
                jsonResponseBody.message = "failed";
                jsonResponseBody.err = err;
            })

        } else {
            jsonResponseBody.err = "username already taken"
        }
    })

    res.send(JSON.stringify(jsonResponseBody))

}


)


expressApp.route("/user")
    //unimplemented. untested. not production ready
    .get(async (req, res) => {
        //username = 

        let jsonResponseBody = {
            username: ""
        }

        await UserModel.findOne({ _authToken: req.cookies._authToken }).then((userDoc) => {
            if (userDoc !== null) {
                jsonResponseBody.username = userDoc.username;
            }
        }, (err) => {
            //if it fails to find
            throw new Error(err)
        })

        res.send(JSON.stringify(jsonResponseBody));

    })
    //untested. not production ready
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

    //unimplemented. untested. not production ready
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