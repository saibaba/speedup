var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var tenant = "demo";

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

var Campaign = mongoose.model('Campaign', campaignSchema);

mongoose.connect('mongodb://localhost/' + tenant , function (err) {
  // if we failed to connect, abort
  if (err) throw err;

  // we connected ok
  createData();
})

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
      example();
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
  Campaign.remove(function () {
    mongoose.disconnect();
  });
}
