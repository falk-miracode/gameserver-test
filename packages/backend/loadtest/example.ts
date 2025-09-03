import { Client, Room } from "colyseus.js";
import { cli, Options } from "@colyseus/loadtest";

export async function main(options: Options) {
  const client = new Client(options.endpoint);
  const room: Room = await client.joinOrCreate(options.roomName, {
    // your join options here...
  });

  console.log("joined successfully!");

  room.onMessage("message-type", (payload: any) => {
    // logic
  });

  room.onStateChange((state: any) => {
    console.log("state change:", state);
  });

  room.onLeave((code: any) => {
    console.log("left");
  });
}

cli(main);
