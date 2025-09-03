import { Room, Client } from "colyseus";
import { MyRoomState } from "@gameserver-test/schemas";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate(options: any) {
    this.state = new MyRoomState();

    this.onMessage("type", (client, message) => {
      this.state.mySynchronizedProperty = message;
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // Send current client count to the joining client
    client.send("room-info", {
      clientCount: this.clients.length,
    });

    // Broadcast to all OTHER clients that a player joined
    this.broadcast(
      "player-joined",
      {
        sessionId: client.sessionId,
        clientCount: this.clients.length,
      },
      { except: client }
    );
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    // Broadcast to remaining clients that a player left
    this.broadcast("player-left", {
      sessionId: client.sessionId,
      clientCount: this.clients.length,
    });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
