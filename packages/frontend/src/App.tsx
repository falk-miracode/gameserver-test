import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
import { Client, Room } from "colyseus.js";
import { MyRoomState } from "@gameserver-test/schemas";
import "./App.css";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  type: "sent" | "received" | "system";
}

const App: Component = () => {
  const [client, setClient] = createSignal<Client | null>(null);
  const [room, setRoom] = createSignal<Room<MyRoomState> | null>(null);
  const [connected, setConnected] = createSignal(false);
  const [connecting, setConnecting] = createSignal(false);
  const [roomState, setRoomState] = createSignal<MyRoomState | null>(null);
  const [synchronizedProperty, setSynchronizedProperty] =
    createSignal<string>("");
  const [message, setMessage] = createSignal("");
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [playerCount, setPlayerCount] = createSignal(0);
  const [roomId, setRoomId] = createSignal<string>("");

  let messageIdCounter = 0;

  const addMessage = (
    content: string,
    type: "sent" | "received" | "system" = "system"
  ) => {
    const newMessage: Message = {
      id: ++messageIdCounter,
      content,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  onMount(() => {
    const newClient = new Client("ws://localhost:2567");
    setClient(newClient);
    addMessage("Client initialized. Ready to connect to server.", "system");
  });

  onCleanup(() => {
    const currentRoom = room();
    if (currentRoom) {
      currentRoom.leave();
    }
  });

  const connectToRoom = async () => {
    const currentClient = client();
    if (!currentClient || connecting()) return;

    setConnecting(true);
    addMessage("Connecting to room...", "system");

    try {
      const newRoom = await currentClient.joinOrCreate<MyRoomState>("my_room");
      setRoom(newRoom);
      setConnected(true);
      setConnecting(false);
      setRoomState(newRoom.state);
      setRoomId(newRoom.roomId);
      setSynchronizedProperty(newRoom.state.mySynchronizedProperty);

      addMessage(`Connected to room: ${newRoom.roomId}`, "system");

      // Listen for state changes
      newRoom.onStateChange((state) => {
        console.log("Room state changed:", state);
        setRoomState(state);
        setSynchronizedProperty(state.mySynchronizedProperty);
      });

      // Listen for messages
      newRoom.onMessage("type", (messageContent: string) => {
        addMessage(messageContent, "received");
      });

      // Listen for room info (initial client count)
      newRoom.onMessage("room-info", (data: any) => {
        setPlayerCount(data.clientCount);
      });

      // Handle player join
      newRoom.onMessage("player-joined", (data: any) => {
        addMessage(`Player ${data.sessionId} joined the room`, "system");
        setPlayerCount(data.clientCount);
      });

      // Handle player leave
      newRoom.onMessage("player-left", (data: any) => {
        addMessage(`Player ${data.sessionId} left the room`, "system");
        setPlayerCount(data.clientCount);
      });

      // Handle room leave
      newRoom.onLeave((code) => {
        setConnected(false);
        setRoom(null);
        setRoomState(null);
        setRoomId("");
        setPlayerCount(0);
        setSynchronizedProperty("");
        addMessage(`Disconnected from room (code: ${code})`, "system");
      });

      // Handle room errors
      newRoom.onError((code, message) => {
        addMessage(`Room error (${code}): ${message}`, "system");
      });

      // Initial player count will be set via room-info message
    } catch (error) {
      console.error("Failed to connect to room:", error);
      setConnecting(false);
      addMessage(`Failed to connect: ${error}`, "system");
    }
  };

  const sendMessage = () => {
    const currentRoom = room();
    const messageContent = message().trim();

    if (currentRoom && messageContent) {
      currentRoom.send("type", messageContent);
      addMessage(messageContent, "sent");
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const disconnect = () => {
    const currentRoom = room();
    if (currentRoom) {
      currentRoom.leave();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div class="app-container">
      <div class="header">
        <h1>🎮 Gameserver Test</h1>
        <p>SolidJS Frontend mit Colyseus Backend</p>
      </div>

      <div class="card">
        <div class="connection-section">
          <div class={`status ${connected() ? "connected" : "disconnected"}`}>
            {connecting()
              ? "Verbindung wird hergestellt..."
              : connected()
              ? "✅ Verbunden"
              : "❌ Getrennt"}
          </div>

          {!connected() ? (
            <button
              class="btn"
              onClick={connectToRoom}
              disabled={!client() || connecting()}
            >
              {connecting() ? "Verbinde..." : "Mit Raum verbinden"}
            </button>
          ) : (
            <button class="btn danger" onClick={disconnect}>
              Verbindung trennen
            </button>
          )}
        </div>
      </div>

      {connected() && roomState() && (
        <>
          <div class="card">
            <h3>📊 Raum Informationen</h3>
            <div class="room-info">
              <div class="info-item">
                <h4>Raum ID</h4>
                <p>{roomId()}</p>
              </div>
              <div class="info-item">
                <h4>Synchronisierte Eigenschaft</h4>
                <p>{synchronizedProperty()}</p>
              </div>
              <div class="info-item">
                <h4>Spieler im Raum</h4>
                <p>{playerCount()}</p>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>💬 Nachrichten</h3>
            <div class="message-form">
              <input
                class="message-input"
                type="text"
                value={message()}
                onInput={(e) => setMessage(e.currentTarget.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nachricht eingeben..."
              />
              <button
                class="btn success"
                onClick={sendMessage}
                disabled={!message().trim()}
              >
                Senden
              </button>
            </div>

            <div class="messages-list">
              <For each={messages()}>
                {(msg) => (
                  <div class="message-item">
                    <div class="message-time">
                      {formatTime(msg.timestamp)} -{" "}
                      {msg.type === "sent"
                        ? "Du"
                        : msg.type === "received"
                        ? "Empfangen"
                        : "System"}
                    </div>
                    <div class="message-content">{msg.content}</div>
                  </div>
                )}
              </For>
              {messages().length === 0 && (
                <p style={{ color: "#6c757d", "text-align": "center" }}>
                  Noch keine Nachrichten...
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
