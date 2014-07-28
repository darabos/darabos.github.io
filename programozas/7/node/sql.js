var pg = require('pg');
var client = new pg.Client(process.env.DATABASE_URL);
client.connect();
var query = client.query(process.argv[2]);
query.on('end', function() { client.end(); });
