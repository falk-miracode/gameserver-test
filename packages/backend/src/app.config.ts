import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { RedisDriver, RedisPresence } from "colyseus";

const redis = process.env.REDIS
  ? process.env.REDIS.toLowerCase() === "true"
  : false;

export default config({
  options: {
    driver: redis
      ? new RedisDriver({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
            ? parseInt(process.env.REDIS_PORT)
            : 6379,
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
        })
      : undefined,
    presence: redis
      ? new RedisPresence({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
            ? parseInt(process.env.REDIS_PORT)
            : 6379,
          username: process.env.REDIS_USERNAME,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
        })
      : undefined,
  },

  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("my_room", MyRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    app.get("/hello_world", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground());
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/monitor", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
