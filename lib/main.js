var express = require("express"),
    logging = require("./log"),
    api = require("./api.js"),
    schema = require("./schema.js");


logging.Config.debug = true;

var log = logging.log;

var app = express();

var tenant = "demo";

app.use(function(err, req, res, next) { console.error(err.stack); res.send(500, 'Something broke!'); });

app.use(function(req, res, next) { req.tenant = "demo"; log("tenant set"); next(); });

app.use(express.bodyParser());

app.get(/^\/([^\/]+)(?:\/)([^\/]+)$/, api.findOne);
app.get(/^\/([^\/]+)$/, api.findAll);
app.post(/^\/([^\/]+)$/, api.create);
app.patch(/^\/([^\/]+)(?:\/)([^\/]+)$/, api.update);
app.put(/^\/metadata\/([^\/]+)\/schema$/, schema.create);

app.listen(8080);

log("Listening on port 8080...");
