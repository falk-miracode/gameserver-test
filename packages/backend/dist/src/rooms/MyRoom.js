"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
const colyseus_1 = require("colyseus");
const schemas_1 = require("@gameserver-test/schemas");
class MyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 4;
    }
    onCreate(options) {
        this.state = new schemas_1.MyRoomState();
        this.onMessage("type", (client, message) => {
            this.state.mySynchronizedProperty = message;
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
}
exports.MyRoom = MyRoom;
