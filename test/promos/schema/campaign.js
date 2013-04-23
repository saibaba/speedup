{
    "name": { "type": "String",  "unique": true }
  , "currency": { "type": "String", "enum": [ "USD", "GBP" ], "required": true }
  , "description": "String"
  , "startDate": { "type": "Date", "required": true }
  , "endDate": "Date"
  , "owner": "String"
  , "links": [ { "rel" : { "type" : "String", "enum" : ["self", "promotions"] , "required": true}, "href" : { "type": "String", "required" : true }  } ]
}
