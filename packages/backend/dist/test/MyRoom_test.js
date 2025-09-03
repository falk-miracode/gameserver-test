"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const testing_1 = require("@colyseus/testing");
// import your "app.config.ts" file here.
const app_config_1 = __importDefault(require("../src/app.config"));
describe("testing your Colyseus app", () => {
    let colyseus;
    before(async () => (colyseus = await (0, testing_1.boot)(app_config_1.default)));
    after(async () => colyseus.shutdown());
    beforeEach(async () => await colyseus.cleanup());
    it("connecting into a room", async () => {
        // `room` is the server-side Room instance reference.
        const room = await colyseus.createRoom("my_room", {});
        // `client1` is the client-side `Room` instance reference (same as JavaScript SDK)
        const client1 = await colyseus.connectTo(room);
        // make your assertions
        assert_1.default.strictEqual(client1.sessionId, room.clients[0].sessionId);
        // wait for state sync
        await room.waitForNextPatch();
        assert_1.default.deepStrictEqual({ mySynchronizedProperty: "Hello world" }, client1.state.toJSON());
    });
});
