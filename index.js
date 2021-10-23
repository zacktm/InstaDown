const express = require("express");
const app = express();
app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

let server = require("http").createServer(app);
app.use(express.static("down"));

var port = process.env.PORT || 3001;

server.listen(port, function () {
  console.log("listening in http://localhost:" + port);
});

app.get("/", (req, res) => {
  res.json({ status: "online" });
});

const startAccount = require("./modules/account");

startAccount(
  "rania_khalidz",
  "123456x",
  "http://daudyqrb:45aepqafokdz@154.85.103.78:6369"
);

startAccount(
  "sarazoss",
  "123456x",
  "http://daudyqrb:45aepqafokdz@144.168.241.34:8628"
);

startAccount(
  "mirnasaideshta",
  "123456x",
  "http://daudyqrb:45aepqafokdz@185.164.57.80:7583"
);
