const { app, BrowserWindow, ipcMain } = require("electron");
var sqlite3 = require('@journeyapps/sqlcipher').verbose();
var db = new sqlite3.Database('new.db');
db.serialize(function () {
    db.run("PRAGMA key = 'mysecret'");
    db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");
});

app.on("ready", () => {
    // BrowserWindow.addDevToolsExtension('./extensions/react-dev-tool');
    let win = new BrowserWindow({ width: 800, height: 600, frame: false });
    win.loadFile("index.html");
    win.webContents.openDevTools();
    win.on('closed', () => {
        win = null
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

ipcMain.on('add', (event, value) => {
    db.run(`INSERT INTO lorem VALUES ("${value}")`);
    event.returnValue = value
});

ipcMain.on('get', (event, value) => {
    new Promise((resolve, reject) => {
        db.get("SELECT COUNT (*) AS count FROM lorem", function (err, row) {
            resolve(row.count);
        });
    }).then((count) => {
        return new Promise((resolve) => {
            const rows = [];
            db.each("SELECT * FROM lorem", function (err, row) {
                rows.push({ name: row.info });
                if (rows.length == count) event.sender.send("users", rows)
            })
        })

    })
});