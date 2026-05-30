require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "https://plasticscreations.in",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    port: PORT,
  });
});

app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Send to Google Script
    const response = await axios.post(process.env.GOOGLE_SCRIPT_URL, {
      secret: process.env.GOOGLE_SECRET,
      name,
      email,
      subject,
      message,
    });

    return res.json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("Contact request failed:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data || "Upstream request failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});