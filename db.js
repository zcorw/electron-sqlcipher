var sqlite3 = require('@journeyapps/sqlcipher').verbose();
var db = new sqlite3.Database('new.db');

db.serialize(function () {
    db.run("PRAGMA key = 'mysecret'");
    db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();
    new Promise((resolve, reject) => {
        db.get("SELECT COUNT (*) AS count FROM lorem", function (err, row) {
            resolve(row.count);
        });
    })
        .then((count) => {
			console.log("TCL: count", count)
            return new Promise((resolve) => {
                const rows = [];
                db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
                    rows.push(row.id + ": " + row.info);
                    if(rows.length == count) resolve(rows)
                })
            })

        })
        .then((rows) => console.log(rows));
});