#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const getStdin = require("get-stdin");

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file",]
});
console.log(args);

const BASEPATH = path.resolve(process.env.BASEPATH || __dirname);

if (args.help || process.argv.length <= 2) error(null, true);
else if (args._.includes('-') || args.in) getStdin().then(capitalize).catch(error);
else if (args.file) {
  fs.readFile(path.resolve(BASEPATH, args.file), (err, data) => {
    if (err) error(err.toString());
    else capitalize(data.toString());
  });
}
else error("Usage Incorrect", true);


function error(err, showHelp = false) {
  if (err) console.error(err);
  console.log();
  if (showHelp) renderHelp();
}

function capitalize(content) {
  process.stdout.write(content.toUpperCase());
}

function renderHelp() {
  console.log("cl usage:");
	console.log("");
	console.log("--help                      print this help");
	console.log("-, --in                     read file from stdin");
	console.log("--file={FILENAME}           read file from {FILENAME}");
	console.log("");
	console.log("");
}