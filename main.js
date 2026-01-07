const express = require("express");
const { PrismaClient } = require("./generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to AIGNusaHub API" });
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: error.message,
    });
  }
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
