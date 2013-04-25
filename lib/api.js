var ObjectID = require('mongodb').ObjectID,
    logging = require("./log"),
    lschema = require("./schema"),
    objstore = require("./objstore"),
    odmstore = require("./odmstore");

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var  log = logging.log

exports.findAll = function (req, res, next) {
    var objtype = req.params[0];
    var skip = req.query.skip || 0;
    var limit = req.query.limit || 10;
    log('findAll objects of type ' + objtype + ' for tenant ' + req.tenant);
    odmstore.ObjStore(req.tenant, function(err, store) {
        if (!err) {
            store.objects(objtype, function(err, collection) { 
                if (!err) {
                    var cursor = collection.find({}, {skip:skip, limit: limit});
                    cursor.toArray(function(err, items) {
                        if (! err) {
                            res.type('application/json');
                            res.json(items);
                            log("Finally closing store!");
                            store.close();
                        } else {
                            log("Err - Finally closing store!");
                            store.close();
                            next(err.toString());
                        }
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
};

exports.create = function (req, res, next) {

    var objtype = req.params[0];
    if (! req.is('application/json') ) {
        next("Unsupported media type");
    } else {
        log('creating an object of type ' + objtype);
        odmstore.ObjStore(req.tenant, function(err, store) {

            if (!err) {
       
                log('now getting my collection'); 
                store.objects(objtype, function(err, collection) {
                    if (!err) {
                        log('now saving doc '); log(req.body); 
                        log(collection);
                        collection.save(req.body, function(err, items) {
                            if (! err) {
                                var id  =  items[0]._id;
                                log("INSERTED ITEM ID: " + id);
                                res.set("Location", objtype + "/" + id).status(201).end(); 
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
    }
};

exports.findOneGen = function(tenant, objtype, id, callback) {

    odmstore.ObjStore(tenant, function(err, store) {
        if (!err) {
            store.objects(objtype, function(err, collection) {
                collection.findOne({ "_id" : ObjectID(id) }, function(err, item) {
                    store.close();
                    if (! err) {
                        if (item) {
                            callback(null, item);
                        } else {
                            callback(null, null);
                        }
                    } else {
                        callback(err.toString(), null);
                    }
                });
            });
        } else {
            callback(err.toString(), null);
        }
    });
}


exports.findOne = function (req, res, next) {
    log(req.params);
    var objtype = req.params[0];
    log('findOne objects of type ' + objtype + ' for tenant ' + req.tenant);
    odmstore.ObjStore(req.tenant, function(err, store) {
        if (!err) {
            store.objects(objtype, function(err, collection) {
                var id = req.params[1];
                log("id = " + id);
                collection.findOne({ "_id" : ObjectID(id) }, function(err, item) {
                    if (! err) {
                        if (item) {
                            res.type('application/json');
                            res.json(item);
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

exports.update = function (req, res, next) {

    var objtype = req.params[0];

    if (! req.is('application/json') ) {
        next("Unsupported media type");
    } else {
        log('updating an object of type ' + objtype);
        odmstore.ObjStore(req.tenant, function(err, store) {

            if (!err) {
       
                log('now getting my collection'); 
                store.objects(objtype, function(err, collection) {
                    if (!err) {
                        var id = req.params[1];
                        log('now updating doc with id: ' + id); log(req.body); 
                        log(collection);
                        collection.update(id, req.body, function(err, numberAffected, raw) {
                            if (! err) {
                                var id  =  raw._id;
                                log("Updated ITEM count: " + numberAffected);
                                log("Updated ITEM ID: " + id);
                                res.set("Location", objtype + "/" + id);
                                if (numberAffected == 1) {
                                    res.status(200);
                                    res.json(raw);
                                } else {
                                    res.status(404).end();
                                }
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
    }
};

exports.delete = function (req, res, next) {

    var objtype = req.params[0];

    log('deleting an object of type ' + objtype);
    objstore.ObjStore(req.tenant, function(err, store) {

        if (!err) {
       
                log('now getting my collection'); 
                store.objects(objtype, function(err, collection) {
                    if (!err) {
                        var id = req.params[1];
                        log('now deleting doc with id: ' + id); log(req.body); 
                        log(collection);
                        collection.remove({"_id" : ObjectID(id)}, { single: true}, function(err, numberOfRemovedDocs) {
                            if (! err) {
                                log("Remove ITEM count: " + numberOfRemovedDocs);
                                if (numberOfRemovedDocs == 1) {
                                    res.status(200).end();
                                } else {
                                    res.status(404).end();
                                }
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
};

exports.deleteAll = function (req, res, next) {

    var objtype = req.params[0];

    log('deleting all objects of type ' + objtype);
    objstore.ObjStore(req.tenant, function(err, store) {

        if (!err) {
       
            log('now getting my collection'); 
            store.objects(objtype, function(err, collection) {
                if (!err) {
                    log('now deleting all docs ' );
                    collection.remove({}, { single: false}, function(err, numberOfRemovedDocs) {
                        if (! err) {
                            log("Remove ITEMS count: " + numberOfRemovedDocs);
                            res.status(200).end();
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
};
