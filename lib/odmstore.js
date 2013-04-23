var logging = require("./log");

var log = logging.log

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.Config = {
    mongoUrl : "mongodb://localhost:27017/"
};

var findSchema = function(conn, objtype, callback) {
    conn.db.collection("metadata", function(err, collection) {
        if (!err) {
            var qry = { objtype : objtype, type: "schema" };
            collection.findOne(qry, function(err, item) {
                if (!err) {
                    var objSchema;
                    if (item) {
                        var body = item.body;
                        //callback(null, body);
                        objSchema = new Schema(body, { versionKey: '__r' });
                    } else {
                        objSchema = new Schema({ }, { strict: false, versionKey: '__r'}  );
                        // callback(null, { any: {} });    // mixed schema type (http://mongoosejs.com/docs/schematypes.html#mixed)
                        // http://stackoverflow.com/questions/5370846/how-do-you-use-mongoose-without-defining-a-schema
                    }
                    callback(null, objSchema);
                } else {
                    callback(err, null);
                }
            });
        } else {
            callback(err, null);
        }
    });
};

var inserter = function(conn, objtype, schema, body, callback) {


    try {
        var objSchema = schema; // new Schema(schema, { versionKey: '_r' });
        var M;
        try {
            M  = conn.model(objtype);
            log(" ***** model from cache on conn!!! ");
            log(M);
        } catch (e) {
            log(" ***** new model on conn !!! ");
            M = conn.model(objtype, objSchema, objtype);
        }
        M.create(body, function(err, result) { callback(err, [result]);} );  // to match the callback contract with native collection.insert

    } catch (e) {
        callback(e.toString(), null);
    }
};

var updater = function(conn, objtype, schema, id, body, callback) {

    try {
        var objSchema = schema;
        var M;
        try {
            M  = conn.model(objtype);
            log(" ***** model from cache on conn!!! ");
            log(M);
        } catch (e) {
            log(" ***** new model on conn !!! ");
            M = conn.model(objtype, objSchema, objtype);
        }
        var qry = { _id: new mongoose.Types.ObjectId(id)};
        if ('__r' in body) {
            var rev = body["__r"];
            qry['__r'] = rev;
            body['__r'] = rev+1;
        }

        M.update(qry, body, function(err, numberAffected, raw) { callback(err, numberAffected, raw);} );

    } catch (e) {
        callback(e.toString(), 0, null);
    }
};

exports.ObjStore = function(tenant, callback) {

    var mongoose = require('mongoose');
    var mymongoose = new mongoose.Mongoose();
    var conn  = new mongoose.Connection(mymongoose);
    conn.open(exports.Config.mongoUrl + tenant, function(err) {
        if (err) { callback(err, null); }
        else {
            
            var store = {
                db : conn,
                close: function() { this.db.close(); },
                objects: function(objtype, objs_cb) {
                    this.db.db.collection(objtype, function (err, collection) {

                        findSchema(conn, objtype, function(err, schema) {
                            var col_wrapper = null;

                            if (!err) {
                                if (!schema) {
                                    col_wrapper = {
                                        save: function(doc, cb) { return collection.insert(doc, cb); },
                                        find: function(qry, opts, cb) { return (cb ? collection.find(qry, opts, cb) : collection.find(qry, opts)); },
                                        findOne: function(qry, cb) { return collection.findOne(qry, cb); }
                                    };
                                } else {
                                    col_wrapper = {
                                        save: function(doc, save_cb) { inserter(conn, objtype, schema, doc, save_cb); return null; },
                                        find: function(qry, opts, cb) { return (cb ? collection.find(qry, opts, cb) : collection.find(qry, opts)); },
                                        findOne: function(qry, cb) { return collection.findOne(qry, cb); },
                                        update: function(id, doc, cb) { return updater(conn, objtype, schema, id, doc, cb); }
                                    };
                                }
                            }
                            objs_cb(err, col_wrapper);
                        });
                    });
                }
            };
            callback(err, store); 
        }
    });
};
