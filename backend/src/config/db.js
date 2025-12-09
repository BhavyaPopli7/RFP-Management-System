const mongoose =  require("mongoose");

const DATABASE_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";

const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);   }
};

module.exports = connectDB;
