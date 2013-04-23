var logging = require("./log");

var log = logging.log

exports.Config = {
    mongoUrl : "mongodb://localhost:27017/"
};
 
exports.ObjStore = function(tenant, db_cb) {

    var MongoClient = require('mongodb').MongoClient;

    MongoClient.connect(exports.Config.mongoUrl + tenant , function(err, db) {
        if(!err) {
            log("We are connected");
            var store = {
                db : db,
                close: function() { this.db.close(); },
                objects: function(objtype, objs_cb) {
                    this.db.collection(objtype, function (err, collection) {
                        objs_cb(err, collection);
                    });
                }
            };
            db_cb(err, store);
        } else {
            log("We are not connected");
            db_cb(err, null);
        }
    });
};

/*
exports.Objects = function (store, objtype, callback) {
    store.objects(objtype, callback);
};
*/
