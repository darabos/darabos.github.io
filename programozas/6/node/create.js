var pg = require('pg');
client = new pg.Client(process.env.DATABASE_URL);
client.connect();
var query = client.query('CREATE TABLE adatok (azonosito TEXT, datum TEXT, suly TEXT)');
query.on('end', function() { client.end(); });
