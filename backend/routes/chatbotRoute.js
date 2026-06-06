import express from 'express';
import { handleChatMessage } from '../controllers/chatbotController.js';

const chatbotRouter = express.Router();

chatbotRouter.post('/', handleChatMessage);

export default chatbotRouter;
