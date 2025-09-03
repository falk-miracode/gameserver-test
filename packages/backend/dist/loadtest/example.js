"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const colyseus_js_1 = require("colyseus.js");
const loadtest_1 = require("@colyseus/loadtest");
async function main(options) {
    const client = new colyseus_js_1.Client(options.endpoint);
    const room = await client.joinOrCreate(options.roomName, {
    // your join options here...
    });
    console.log("joined successfully!");
    room.onMessage("message-type", (payload) => {
        // logic
    });
    room.onStateChange((state) => {
        console.log("state change:", state);
    });
    room.onLeave((code) => {
        console.log("left");
    });
}
(0, loadtest_1.cli)(main);
