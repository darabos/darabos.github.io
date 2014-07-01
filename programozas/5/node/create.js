var pg = require('pg');
pg.connect(process.env.DATABASE_URL, function(err, client) {
  console.log(err);
  client.query('CREATE TABLE adatok (azonosito TEXT, datum TEXT, suly TEXT)');
});
