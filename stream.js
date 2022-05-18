#!/usr/bin/env node

"use strict";

const path = require("path");
const fs = require("fs");
const zlib = require("zlib");
const Transform = require("stream").Transform;

const args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "uncompress"],
  string: ["file",]
});
console.log(args);

const BASEPATH = path.resolve(process.env.BASEPATH || __dirname);
let OUTPATH = path.join(BASEPATH, "out.txt");
main().catch(error);

async function main() {
  if (args.help || process.argv.length <= 2) error(null, true);
  else if (args._.includes('-') || args.in) {
    await capitalize(process.stdin);
    console.log("Complete!!!");
  }
  else if (args.file) {
    let outStream = fs.createReadStream(path.resolve(BASEPATH, args.file));
    await capitalize(outStream);
    console.log("Complete!!!");
  }
  else error("Usage Incorrect", true);
}

function error(err, showHelp = false) {
  if (err) console.error(err);
  console.log();
  if (showHelp) renderHelp();
}

async function capitalize(inputStream) {
  var stream = inputStream;
  
  let upperCaseStream = new Transform(
    {
      transform(chunk, encoding, cb) {
        this.push(chunk.toString().toUpperCase());
        cb();
      }
    }
  );
  stream = stream.pipe(upperCaseStream);

  let targetStream;
  if (args.compress) {
    OUTPATH = `${OUTPATH}.gz`;
    stream = stream.pipe(zlib.createGzip());
  }
  
  if (args.out) targetStream = process.stdout;
  else targetStream = fs.createWriteStream(OUTPATH);

  stream.pipe(targetStream);

  await streamComplete(stream);
}

function streamComplete(stream) {
  return new Promise(function c(res) {
    stream.on("end", res);
  })
}

function renderHelp() {
  console.log("cl usage:");
	console.log("");
	console.log("--help                      print this help");
	console.log("-, --in                     read file from stdin");
	console.log("--file={FILENAME}           read file from {FILENAME}");
  console.log("-, --compress               compress the output with gzip");
	console.log("-, --out                    write to terminal");

	console.log("");
	console.log("");
}