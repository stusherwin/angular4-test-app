var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

import {api} from './api'

var app = express();

app.use(express.static('dist/client'));
app.use(bodyParser.json());

app.use('/api', api);

app.all('/*', function(req: any, res: any) {
  res.sendFile(path.resolve('dist/client/index.html'));
});

app.listen(+(process.argv[2]), function () {
  console.log('Started. Listening...');
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err: any, req: any, res: any, next: any) {
    // res.status(err.status || 500);
    // res.render('error', {
    //     message: err.message,
    //     error: err
    // });
    let error = err instanceof Error ? '' + err : err;
    console.error(error);
    res.status(500).json({ error: error });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err: any, req: any, res: any, next: any) {
  let error = err instanceof Error ? '' + err : err;
  console.error(error);
  res.status(500).json({ error: error });
    // res.status(err.status || 500);
    // res.render('error', {
    //     message: err.message,
    //     error: {}
    // });
});