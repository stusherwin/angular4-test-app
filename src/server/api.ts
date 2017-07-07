var express = require('express');

export let api = express.Router();

api.get('/', function(req: any, res: any, next: any) {
  res.json({hi: 'there'})
});

api.all('/*', function(req: any, res: any) {
  res.sendStatus(404);
});