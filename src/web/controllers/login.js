const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');

const signToken = (username, rememberme) => {
    return JWT.sign({user: username}, JWT_SECRET, (!rememberme) ? {
        expiresIn: '30m'
    } : null);
}

const render = async (req, res) => {
    res.render('login', {
        title: 'Mellow Login',
        successMsg: this.successMsg,
        errorMsg: this.errorMsg
    });
}

const login = async (req, res) => {
    const { username, password, rememberme } = req.body;
    const general = req.webserver.WebDatabase.getConfig()['general'];
    if (username === general.username && await bcrypt.compare(password, general.password)) {
        const token = signToken(username);
        const dMaxAge = new Date();
        dMaxAge.setSeconds(dMaxAge.getSeconds() + 5);
        res
        .status(200)
        .cookie('token' , token, { 'maxAge': dMaxAge })
        .redirect('/config');
    }
    else {
        res
        .render('login', {
            title: 'Mellow Login',
            errorMsg: 'Login failed! Username or password incorrect.',
            successMsg: ''
        });
    }
}

const logout = async (req, res) => {
    res
    .status(200)
    .cookie('token', '', { 'maxAge': Date.now() })
    .redirect('/login');
}

module.exports = {
    render,
    login,
    logout
}
