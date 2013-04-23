

var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var tenant = "demo";
var url = 'mongodb://localhost/' + tenant

console.log('Running mongoose version %s', mongoose.version);

/**
 * Campaign schema
 */
var campaignSchema = Schema({
    name: { type: String,  unique: true }
  , currency: { type: String, enum: [ 'USD', 'GBP' ], required: true }
  , details: String
  , startDate: { type: Date, required: true }
  , endDate: Date
  , owner: String
});


var connection = new mongoose.Connection(new mongoose.Mongoose());

var Campaign = connection.model('Campaign', campaignSchema);

var connection2 = new mongoose.Connection(new mongoose.Mongoose());

connection.open(url, function (err) {
    console.log("open err: " + err);
    if (err) throw err;
    createData();
});



/**
 * Data generation
 */

function createData () {
  Campaign.create({
      name: 'DELL CONF 2013 - US'
    , currency : 'USD'
    , details : 'DELL CONF 2013 - US'
    , startDate: 'September 29, 1996'
    , owner: 'MKTG-TEAM'
  }, function (err, campaign) {
    if (err) return done(err);
    Campaign.create({
        name: 'BELL CONF 2013 - US'
      , currency : 'USD'
      , details : 'DELL CONF 2013 - US'
      , startDate: 'September 29, 1996'
      , owner: 'MKTG-TEAM'
    }, function (err, campaign) {
      if (err) return done(err);

      console.log("campaign DELL and BELL created!");
      //connection.collections["campaigns"].insert({ "override" : true}, function(err, result) {
      connection.db.collection("campaigns", function (err, collection) { collection.insert({ "override" : true}, function(err, result) {
        console.log(collection);
        if (err) return done(err);
        console.log("override insert done");
        example();    });
      });
    });
  });
}

/**
 * Testing
 */

function example () {
  Campaign
  .find({ name: /^[BD]ELL.+2013.+/ }, function (err, campaigns) {
    if (err) return done(err);

    campaign = campaigns[1]; 
    console.log(
        '"%s" was created with the currency %s on %s'
      , campaign.name
      , campaign.currency
      , campaign.startDate.toLocaleDateString());

    done();
  });
}

function done (err) {
  if (err) console.error(err);
  //Campaign.remove(function () {
    connection.close();
  //});
}
