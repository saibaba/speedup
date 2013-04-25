var ObjectID = require('mongodb').ObjectID,
    objstore  = require("./objstore"),
    mongoose = require("mongoose"),
    vm = require('vm'),   
    logging = require("./log");

var Schema = mongoose.Schema;

var log = logging.log

exports.create = function (req, res, next) {

    var objtype = req.params[0];
    var triggerName = req.params[1];


    if (! req.is('application/javascript') ) {
        next("Unsupported media type");
    } else {
   
        console.log(req.rawBody); 
        var scriptSrc = req.rawBody;
        console.log(triggerName);
        console.log(scriptSrc);
        var script = vm.createScript(scriptSrc, triggerName);


        log('creating trigger for objects of type ' + objtype);
        try {
            var objSchema = Schema(req.body);
            objstore.ObjStore(req.tenant, function(err, store) {
                if (!err) {
                    store.objects("metadata", function(err, collection) {

                        if (!err) {
                            var qry = { objtype :  objtype, type: "trigger", name: triggerName};
                            var trigger  = { objtype :  objtype, type: "trigger", name: triggerName, body: scriptSrc };
                            collection.update(qry, trigger, {upsert:true, w: 1}, function(err, items) {
                                if (! err) {
                                    res.set("Location", "/metadata/" + objtype + "/triggers/" + triggerName).status(201).end(); 
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

exports.findTrigger = function(store, objtype, triggerName, callback) {
    store.objects("metadata", function(err, collection) {
        if (!err) {
            var qry = { objtype : objtype, type: "trigger" , name: triggerName};
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
    var triggerName = req.params[1];

    log('get trigger for ' + objtype + ' for tenant ' + req.tenant + ' with name ' + triggerName);
    objstore.ObjStore(req.tenant, function(err, store) {
        if (!err) {
            store.objects("metadata", function(err, collection) {
                var qry = { objtype :  objtype, type: "trigger", name: triggerName};
                collection.findOne(qry, function(err, item) {
                    if (! err) {
                        if (item) { console.log(item);
                            res.type('application/javascript');
                            res.send(200, item.body);
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
