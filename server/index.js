require('dotenv').config()
const express = require('express')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , session = require('express-session')
    , passport = require('passport')
    , Auth0Strategy = require('passport-auth0')
    , massive = require('massive')



const app = express()
app.use( cors() )
app.use( bodyParser.json() )

massive( process.env.DB_CONNECTION ).then( db => {
    app.set( 'db', db )
})

//Session
app.use( session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 50000
    }
}))
app.use( express.static(__dirname+ '/../build'))
app.use( passport.initialize() )
app.use( passport.session() )

//Strategy
passport.use( new Auth0Strategy({   //<-- building a new instance of the strategy using the clients info
    //CREATE AUTH CLIENT AND PUT IN .ENV
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL
}, function( accessToken, refreshToken, extraParams, profile, done ) {
    //set up sql query to find/create user on login
    // console.log(profile);
    const db = app.get( 'db' )
    let userData = profile._json, // <-- this is the json object coming from the profile parameter from above that we get back when we login w/ auth to our app.
        auth_id = userData.user_id.split('|')[1]
        console.log(userData);
    /*
        1: user_name? userData.name    we are trying to fill these properties with what we are pulling off of our user obj that we are pulling off the json object from google or whatever they are logging in with
        2: email? userData.email
        3: img? userData.picture
        4: auth_id? userData.user_id.split('|')[1]
    */ 
    db.find_user( [auth_id] ).then( user => {  //<-- this is where the placeholder in the find_user.sql file is filled.
        if ( user[0] ) {
            return done( null, user[0].id )
        } else {
            db.create_user( [userData.name, userData.email, userData.picture, auth_id] )
            .then( user => {
                return done( null, user[0].id)
            } )
        }
    } )
} ) )

//Endpoints
app.get( '/auth', passport.authenticate( 'auth0' )) //takes you to auth0 and google, sends back data in the profile param in the strategy. then invoke done, serialize gets hit.
app.get( '/auth/callback', passport.authenticate( 'auth0', {
    successRedirect: process.env.AUTH_PRIVATE_REDIRECT,
    failureRedirect: process.env.AUTH_LANDING_REDIRECT
}))

passport.serializeUser( function( ID, done ){   //
    return done( null, ID ) // usually save user id from DB to session... serialize puts user id to session
})

passport.deserializeUser( function( ID, done ) {
    // user === 1
    // const db = app.get( 'db' )
    db.find_user_by_session( [ID] )  //<--- making call to database in postgres to get info using query file
    .then( user => {
        done( null, user[0] )
    } )
   //make query call to find the user that matches req.user
    
} )

app.get( '/auth/me', function( req, res, next ) {
    let response = req.user,
    status = 200

    !response && ( response = "LOGIN REQUIRED", status = 403) 

    res.status( status ).send( response )
})

app.get( '/auth/logout', function( req, res, next ) {
    req.logout()
    res.redirect( process.env.AUTH_LANDING_REDIRECT )
})


app.listen( process.env.SERVER_PORT, () => {
    console.log(`<('.'<) on port: ${process.env.SERVER_PORT}`);
})