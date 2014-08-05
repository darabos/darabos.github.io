var pg = require('pg');
var parancs = process.argv[2];
pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  var query = client.query(parancs, function(err, result) {
    done();
    console.log(err || result.rows);
  });
});
pg.end();
