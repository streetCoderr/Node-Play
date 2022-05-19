#!/usr/bin/env node

"use strict";

const path = require("path");
const util = require("util");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const { lookup } = require("dns");

const DB_PATH = path.join(__dirname, "my.db");
const DB_SQL_PATH = path.join(__dirname, "mydb.sql");

let args = require("minimist")(process.argv.slice(2), {
  string: ["other"],
});

main().catch(console.error);
var SQL3;


async function main() {
  if (!args.other) {
    error("Missing argument: [other]");
    return;
  }

  var myDb = new sqlite3.Database(DB_PATH);

  SQL3 = {
    run(...args) {
      return new Promise(function c(res, rej) {
        myDb.run(...args, function onRes(err) {
          if (err) rej(err);
          else res(this);
        });
      });
    },
    get: util.promisify(myDb.get.bind(myDb)),
    all: util.promisify(myDb.all.bind(myDb)),
    exec: util.promisify(myDb.exec.bind(myDb)),
  }

  let initSQL = fs.readFileSync(DB_SQL_PATH, "utf-8");
  await SQL3.exec(initSQL);

  let other = args.other;
  let something = Math.trunc(Math.random() * 1E9);

  let otherId = await lookupOrInsertOther(other);
  if (otherId) {
    let inserted = await insertSomething(otherId, something);
    if (inserted) {
      let records = await getAllRecords()
      console.table(records);
      return;
    }
    
  }
  error("Oops..");
}

async function lookupOrInsertOther(other) {
  let result = await SQL3.get(
    `SELECT
      id
    FROM
      Other
    WHERE 
      data = ?`,
    other
  );
  if (result != null) {
    console.log("lookup complete\n");
    console.log(result);
    return result.id;
  }
  else {
    result = await SQL3.run(
    `INSERT INTO
      Other 
      (data)
    VALUES
      (?)
    `, other
    );
    console.log("insert complete\n");
    console.log(result);
    if (result && result.changes > 0) return result.lastID;
  }
}

async function insertSomething(otherId, something) {
  let result = await SQL3.run(
    `
    INSERT INTO
      Something (otherID,data)
    VALUES
      (?,?)  
    `,
    otherId,something
  );
  return result && result.changes > 0;
}

async function getAllRecords() {
  let result = await SQL3.all(
    `
    SELECT
      Something.data as "something",
      Other.data as "other"
    FROM
      Something JOIN Other ON
      (Other.id = Something.otherID)
    ORDER BY
      Other.id DESC, Something.data
    `
  );
  return result;
}

function error(err, showHelp = false) {
  if (err) console.error(err);
  console.log();
  if (showHelp) renderHelp();
}

function renderHelp() {
  console.log("cl usage:");
	console.log("");
	console.log("--help                      print this help");
	console.log("--other                     insert provided string value into the database");
	console.log("");
	console.log("");
}



