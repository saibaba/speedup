var ObjectID = require('mongodb').ObjectID,
    objstore  = require("./objstore"),
    mongoose = require("mongoose"),
    logging = require("./log");

var Schema = mongoose.Schema;

var log = logging.log

exports.create = function (req, res, next) {

    var objtype = req.params[0];
    if (! req.is('application/json') ) {
        next("Unsupported media type");
    } else {

        log('creating schema for objects of type ' + objtype);
        try {
            var objSchema = Schema(req.body);
            objstore.ObjStore(req.tenant, function(err, store) {
                if (!err) {
                    store.objects("metadata", function(err, collection) {

                        if (!err) {
                            var qry = { objtype :  objtype, type: "schema"};
                            var schema  = { objtype :  objtype, type: "schema", body: req.body };
                            collection.update(qry, schema, {upsert:true, w: 1}, function(err, items) {
                                if (! err) {
                                    res.set("Location", "/metadata/" + objtype + "/schema").status(201).end(); 
                                } else {
                                    next(err.toString());
                                }
                                log("Finally closing store!");
                                store.close();
                            });
                        } else {
                            log("Err - Finally closing store!");
                            store.close();
                            next(err.toString());
                        }
                    });
                } else {
                    next(err.toString());
                }
            });
        } catch (e) {
            res.send(400, e.toString());
        }

    }
};

exports.findSchema = function(store, objtype, callback) {
    store.objects("metadata", function(err, collection) {
        if (!err) {
            var qry = { objtype : objtype, type: "schema" };
            collection.findOne(qry, function(err, item) {
                if (!err) {
                    if (item) {
                        var body = item.body;
                        callback(null, body);
                    } else {
                        callback(null, null);
                    }
                } else {
                    callback(err, null);
                }
            });
        } else {
            callback(err, null);
        }
    });
};


exports.findOne = function (req, res, next) {
    log(req.params);
    var objtype = req.params[0];
    log('get schema for ' + objtype + ' for tenant ' + req.tenant);
    objstore.ObjStore(req.tenant, function(err, store) {
        if (!err) {
            store.objects("metadata", function(err, collection) {
                var qry = { objtype :  objtype, type: "schema"};
                collection.findOne(qry, function(err, item) {
                    if (! err) {
                        if (item) {
                            res.type('application/json');
                            res.json(item.body);
                        } else {
                            res.send(404, "Not found");
                        }
                        log("Finally closing store!");
                        store.close();
                    } else {
                        log("Err - Finally closing store!");
                        store.close();
                        next(err.toString());
                    }
                });
            });
        } else {
            next(err.toString());
        }
    });
};
