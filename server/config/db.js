const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );
   } catch (error) {
    console.error("MongoDB connection failed");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    if (error.reason?.servers) {
      for (const [address, server] of error.reason.servers) {
        console.error(
          "MongoDB server:",
          address,
          "error:",
          server.error?.message,
          "code:",
          server.error?.code
        );
      }
    }

    process.exit(1);
  }
};


module.exports = connectDB;