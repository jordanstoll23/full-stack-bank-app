require('dotenv').config();
const express = require('express'),
      bodyParser = require('body-parser'),
      massive = require('massive'),
      session = require('express-session'),
      passport = require('passport'),
      Auth0Strategy = require('passport-auth0');
const app = express();
app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true
}));
app.use(passport.initialize());
app.use(passport.session());
massive(process.env.CONNECTION_STRING).then( db => {
    app.set('db', db);
}).catch(err => console.log(err))
passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
}, function(accessToken, refreshToken, extraParams, profile, done){
    //database
    const db = app.get('db');
    console.log (profile.identities[0].user_id);
    db.get_user([profile.identities[0].user_id]).then(user => {
        if (user[0]){
            done(null, user[0].id)
        } else {
            db.create_user([profile.displayName, profile.emails[0].value, profile.picture, profile.identities[0].user_id])
            .then(user => {
                done(null, user[0].id)
            })
        }
    }); 
}))
passport.serializeUser(function(userID, done){
    done(null, userID);
})
passport.deserializeUser(function(userID, done){
    app.get('db').current_user([userID]).then(user => {
        done(null, user[0])
    })
})
app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback', passport.authenticate('auth0',{
    successRedirect: 'http://localhost:3000/#/private',
    failureRedirect: '/auth'
}))

app.get('/auth/user', (req,res) => {
    if (!req.user) {
        return res.status(404).send('User not found');
    } else {
        return res.status(200).send(req.user);
    }
})

app.get('/auth/logout', (req,res) => {
    req.logOut();
    res.redirect(302, 'http://localhost:3000')
});



const PORT = 3535;
app.listen(PORT, () => console.log('listening on port: ', PORT));