const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { JWT_SECRET } = require('./keys');

passport.use('userJwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        const Database = require('../../database/Database.js');
        const webDatabase = new Database();
        const { username } = webDatabase.config.general;
        if (username !== payload.user)
            return done(null, false, { message: 'username does not exist!'});
        done(null, true);
    } catch (error) {
        done(error, false);
    }
}));

passport.serializeUser(function(username, done) {
    done(null, username);
});

passport.deserializeUser(function(username, done) {
    done(err, username);
});