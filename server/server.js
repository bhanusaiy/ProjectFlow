const tls = require("tls");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const testTlsConnection = () => {
  const socket = tls.connect(
    {
      host: "ac-hhw308p-shard-00-00.lbsnoyx.mongodb.net",
      port: 27017,
      servername: "ac-hhw308p-shard-00-00.lbsnoyx.mongodb.net",
      rejectUnauthorized: true,
    },
    () => {
      console.log("TLS TEST: connection established");
      console.log("TLS TEST: protocol:", socket.getProtocol());
      socket.end();
    }
  );

  socket.on("error", (error) => {
    console.error("TLS TEST ERROR:", error.message);
    console.error("TLS TEST CODE:", error.code);
  });
};

const startServer = async () => {
  try {
    // Temporary TLS diagnostic
    testTlsConnection();

    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`ProjectFlow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    process.exit(1);
  }
};

startServer();