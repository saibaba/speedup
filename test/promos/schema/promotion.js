{
    "name": { "type": "String",  "unique": true }
  , "currency": { "type": "String", "enum": [ "USD", "GBP" ], "required": true }
  , "description": "String"
  , "displayName": "String"
  , "active": "Boolean"
  , "redemptionCriteria": "String"
  , "links": [ { "rel" : { "type" : "String", "enum" : ["self", "discount"] , "required": true}, "href" : { "type": "String", "required" : true }  } ]
}
