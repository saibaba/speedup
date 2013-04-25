curl -v -H "Content-Type: application/json" -X PUT http://localhost:8080/metadata/discounts/schema -d @discount.js
curl -v -H "Content-Type: application/json" -X PUT http://localhost:8080/metadata/promotions/schema -d @promotion.js
curl -v -H "Content-Type: application/json" -X PUT http://localhost:8080/metadata/campaigns/schema -d @campaigns.js
