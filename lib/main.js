var express = require("express"),
    logging = require("./log"),
    api = require("./api.js"),
    trigger = require("./trigger.js"),
    schema = require("./schema.js");


function javascriptParser(req, res, next) {

    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
        data += chunk;
    });

    req.on('end', function() {
        req.rawBody = data;
        next();
    });
}

function authenticator(req, res, next) {
    req.tenant = "demo"; 
    log("tenant set to " + req.tenant);
     next();
}

logging.Config.debug = true;

var log = logging.log;

var app = express();

var tenant = "demo";

app.use(function(err, req, res, next) { console.error(err.stack); res.send(500, 'Something broke!'); });

app.use(authenticator);  // or app.all("*", authenticator);

app.get(/^\/([^\/]+)(?:\/)([^\/]+)$/, api.findOne);
app.get(/^\/([^\/]+)$/, api.findAll);
app.post(/^\/([^\/]+)$/, express.bodyParser(), api.create);
app.patch(/^\/([^\/]+)(?:\/)([^\/]+)$/, express.bodyParser(), api.update);
app.delete(/^\/([^\/]+)(?:\/)([^\/]+)$/, api.delete);
app.delete(/^\/([^\/]+)$/, api.deleteAll);


app.put(/^\/metadata\/([^\/]+)\/schema$/, express.bodyParser(), schema.create);
app.get(/^\/metadata\/([^\/]+)\/schema$/, schema.findOne);

app.put(/^\/metadata\/([^\/]+)\/triggers\/([^\/]+)$/, javascriptParser, trigger.create);
app.get(/^\/metadata\/([^\/]+)\/triggers\/([^\/]+)$/, trigger.findOne);
app.listen(8080);

log("Listening on port 8080...");
