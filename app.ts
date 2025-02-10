
import express from 'express';
const app = express();
import auth from "./src/routes/auth"
import { AppDataSource } from './src/config/data-source';
import { DataSource } from 'typeorm';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './swagger';
import cors from "cors";
import bodyParser from'body-parser';
import activity from './src/routes/activity'
import telegramBot from 'node-telegram-bot-api'
import { handleMessage } from './src/service/telegram.service';
import { Request, Response } from "express";
import { pollForTasks } from './src/service/polling.service';

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_TOKEN || ""



var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions))

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for form data
app.use(bodyParser.json());

// Swagger setup
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes setuphttps://fboxmschac.sharedwithexpose.com
app.use('/api/auth', auth)
app.use('/api/activity', activity)


// Create a bot that uses 'polling' to fetch new updates
const bot = new telegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  const message = handleMessage(msg) || ""
  console.log("------ ", msg)
  bot.sendMessage(chatId, message);
});


app.post('/api/process', (req: Request, res: Response) => {
  const data = req.body;
  // Example processing logic; replace with your actual logic.]
  console.log("--------- process", data)
  const result = { processedData: data, message: 'Processed via Express in TypeScript.' }
  res.status(200).json(result);
});

app.post('/api/process', (req: Request, res: Response) => {
  const data = req.body;
  // Example processing logic; replace with your actual logic.]
  console.log("--------- process", data)
  const result = { processedData: data, message: 'Processed via Express in TypeScript.' }
  res.status(200).json(result);
});

// Start polling
pollForTasks()

// Start server
const PORT = process.env.PORT || 3000

  AppDataSource.initialize()
  .then(async () => {
    console.log("Connection initialized with database...");
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
  })
  .catch((error) => console.log(error));

export const getDataSource = (delay = 3000): Promise<DataSource> => {
  if (AppDataSource.isInitialized) return Promise.resolve(AppDataSource);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (AppDataSource.isInitialized) resolve(AppDataSource);
      else reject("Failed to create connection with database");
    }, delay);
  });
};

export default app;
