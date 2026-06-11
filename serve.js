// zero-dependency local dev server — run: node serve.js → http://localhost:5517
const http = require("http");
const fs = require("fs");
const path = require("path");
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };
http.createServer((req, res) => {
  let p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";
  const file = path.join(__dirname, decodeURIComponent(p));
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(5517, () => console.log("serving on 5517"));
