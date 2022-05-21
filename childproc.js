#!/usr/bin/env node

"use strict";

var util = require("util");
var childProc = require("child_process");
var http = require("http");


// ************************************

const HTTP_PORT = 8039;
const MAX_CHILDREN = 1500;

var delay = util.promisify(setTimeout);

main().catch(console.error);


// ************************************

async function main() {
	console.log(`Load testing http://localhost:${HTTP_PORT}...`);

  while (true) {
    let children = [];

    console.log(`Sending ${MAX_CHILDREN} requests`);
    for (let i = 0; i < MAX_CHILDREN; i++) {
      children.push(childProc.spawn("node", ["child.js"]));
    }
    let childrenP = children.map(child => (
      new Promise(res => {
        child.on("exit", code => {
          if (code === 0) res(true);
          else res(false);
        });
      })
    ));

    childrenP = await Promise.all(childrenP);

    if (childrenP.every(Boolean)) {
      console.log("Success...");
    } else {
      console.log("Failures...");
    }

  }
}
