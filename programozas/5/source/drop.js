var pg = require('pg');
client = new pg.Client(process.env.DATABASE_URL);
client.connect();
var query = client.query('DROP TABLE adatok');
query.on('end', function() { client.end(); });
