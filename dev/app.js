var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var bodyParser = require('body-parser'); //POST
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var connect = require('connect');

var app = express();
var request = require('request');
app.set('port', config.get('port'));

http.createServer(app).listen(config.get('port'), function () {
    console.log('Express server listening on port: ' + config.get('port'));
});

app.use(cookieSession({
    name: 'session',
    keys: ['key1'],
    cookie: {

    }
}));
app.use(bodyParser());

var notiCount = 2;

app.use((req, res, next) => {
    console.log('Ответ:' + req.session.authorized);
    req.session.authorized = true;
    if(typeof req.session.authorized == 'undefined')
    {
        req.session.authorized = true;
    }

    next();
});


app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates/page');
app.set('view engine', 'ejs');

app.get('/', function (req, res, next) {
    if(req.session.authorized == true)
        next();
    else
    {
        res.render('log', {
            UserName: req.session.name,
            NotiCount : notiCount,
        });
    }
});

app.get('/reg', function (req, res, next) {
    if(req.session.authorized == true)
        res.redirect('/');
    else {
        res.render('reg', {});
    }
});

app.get('/', function (req, res, next) {
    console.log(req.session.authorized);
    res.render('index', {
        UserName: req.session.name,
        NotiCount : notiCount,
    });

});

app.get('/profile', function (req, res, next) {
    if(req.session.authorized == false)
        res.redirect('/');
    else
    {
        res.render('profile', {
            UserName: req.session.name,
            NotiCount : notiCount,
        });
    }
});

app.get('/orders', function (req, res, next) {
    if(req.session.authorized == false)
        res.redirect('/');
    else
    {
        res.render('my_orders', {
            UserName: req.session.name,
            NotiCount : notiCount,
        });
    }
});

app.get('/settings', function (req, res, next) {
    if(req.session.authorized == false)
        res.redirect('/');
    else
    {
        res.render('settings', {
            UserName: req.session.name,
            NotiCount : notiCount,
        });
    }
});
app.post('/exit', function (req, res, next) {
    req.session.authorized = false;
    res.send(req.session.authorized);
});

/*app.engine('ejs', require('ejs-locals'));
 app.set('views', __dirname + '/templates/ext');
 app.set('view engine', 'ejs');*/

app.post('/ajax', function (req, res, next) {
    /*console.log('params: ' + JSON.stringify(req.params));
     console.log('body: ' + JSON.stringify(req.body));
     console.log('query: ' + JSON.stringify(req.query));*/

    request.post({
        url : 'http://becloudlogistics.westeurope.cloudapp.azure.com:8080/api/v1/user/user/auth',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            "email" : req.body.mail,
            "password" : req.body.pas
        })}, function(err, response, body) {
            var json = JSON.parse(body);
            if (response.statusCode === 200) {
                req.session.name = json.result.user.firstname;
                req.session.authorized = true;
                var answer = {
                    response: 200,
                    resp_body: req.session.authorized
                };
                res.send(answer);
            } else if (response.statusCode === 409) {
                if (json.response === "User not exist") {
                    var answer = {
                        response: 409,
                        resp_body: req.session.authorized
                    };
                    res.send(answer);
                } else if (json.response === "Bad password") {
                    var answer = {
                        response: 409,
                        resp_body: req.session.authorized
                    };
                    res.send(answer);
                } else {
                    var answer = {
                        response: 500,
                        resp_body: req.session.authorized
                    };
                    res.send(answer);
                    res.sendStatus(500);
                }
            } else {
                var answer = {
                    response: 500,
                    resp_body: req.session.authorized
                };
                res.send(answer);
                res.sendStatus(500);
            }
    })
});

app.post('/reg_query', function (req, res, next) {
    console.log(req.body.firstname + req.body.secondname + req.body.mail + req.body.phone + req.body.pas);
    request.post({
        url : 'http://becloudlogistics.westeurope.cloudapp.azure.com:8080/api/v1/user/user/register',
        headers: {
            'Content-Type': 'application/json'
        },
        body : JSON.stringify({
            "firstname" : req.body.firstname,
            "secondname" : req.body.secondname,
            "email" : req.body.mail,
            "phone" : req.body.phone,
            "password" : req.body.pas,
            "type" : "FREIGHTER"
        })}, function(err, response, body) {
        var json = JSON.parse(body);
        console.log(json);
        console.log(response.statusCode);
        if (response.statusCode === 201) {
            req.session.name = json.result.firstname;
            req.session.authorized = true;
            var answer = {
                response: 201,
                resp_body: req.session.authorized
            };
            res.send(answer);
        } else if (response.statusCode === 409) {
            if (json.response === "User not exist") {
                var answer = {
                    response: 409,
                    resp_body: req.session.authorized
                };
                res.send(answer);
            } else if (json.response === "Bad password") {
                var answer = {
                    response: 409,
                    resp_body: req.session.authorized
                };
                res.send(answer);
            } else {
                var answer = {
                    response: 500,
                    resp_body: req.session.authorized
                };
                res.send(answer);
                res.sendStatus(500);
            }
        } else {
            var answer = {
                response: 500,
                resp_body: req.session.authorized
            };
            res.send(answer);
            res.sendStatus(500);
        }
    })
});

app.use(express.static(path.join(__dirname + '/public')));

app.use(function (err, req, res, next) {
    if(app.get('env') == 'development') {
        res.send(500);
    } else {
        res.send(500);
    }
});

module.exports = app;