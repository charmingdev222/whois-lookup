const path = require("path");
const express = require("express");
const app = express();
const util = require("util");
const whois = util.promisify(require("whois").lookup);
var bodyParser = require("body-parser");
const log = require("morgan");
const ROOT = path.join(__dirname, "public");
const VIEW_ROOT = path.join(__dirname, "pages");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
app.use(bodyParser());
app.set("json spaces", 2);
app.use(log("dev"));
app.use(express.static(ROOT));
app.set("view engine", "ejs");
app.set("views", VIEW_ROOT);

app.use((req, res, next) => {
  res.locals.hostname = req.hostname;
  next();
});

app.get("/", async (req, res) => {
  res.render("index");
});

app.get(["/whois/:query", "/whois"], async (req, res, next) => {
  let query = req.params.query || req.query.query;
  if (!query) return res.render("result", { query, result: "Error: Bad Request" });
  try {
  //  if (cache[query]) return res.render("result", { query, result: cache[query] });
    let result = (await whois(query, { follow: 0 })).trim();
  //  cache[query] = result;
    res.render("result", { query, result });
  } catch (e) {
    res.render("result", { query, result: "Error : " + e.message });
    console.log(e);
  }
});

app.get(['/api/whois/:query', '/api/whois'], async (req, res, next) => {
res.type("text/plain");
let query = req.params.query || req.query.query;
if (!query) return res.status(400).send('400: Bad Request');
try {
  //  if (cache[query]) return res.send(cache[query].trim());
    let result = await whois(query, { follow: 0 });
  //  cache[query] = result;
    res.send(result.trim());
  } catch (e) {
    res.status(500).send("Error: "+e.message);
    console.log(e);
  }
})

app.use((req, res, next) => {
  res.sendStatus(404);
});

const listener = app.listen(PORT);

console.log(
  "[ EXPRESS ] Your app listen on port " + listener.address()?.port || 443
);
