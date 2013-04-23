{ 
    "name" : { "type" : "String" , "required": true, "unique": true}
  , "currency": { "type": "String", "enum": [ "USD", "GBP" ], "required": true }
  , "description": { "type": "String" }
  , "valueType": { "type": "String", "required": true, "enum": ["amount", "percent"] }
  , "value": { "type" : "Number" , "required": true } 
  , "term":  { "type" : "Number", "required": true }
  , "billingCode": { "type" : "String", "required": true }
}
