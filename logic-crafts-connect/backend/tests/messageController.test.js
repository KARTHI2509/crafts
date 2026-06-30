import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { sendNewMessage } from '../controllers/messageController.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
// Mock middleware
app.post('/api/messages', (req, res, next) => {
  req.user = { id: req.headers.userid };
  next();
}, sendNewMessage);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Message.deleteMany({});
  await User.deleteMany({});
});

describe('Message Controller', () => {
  describe('sendNewMessage', () => {
    it('should send a new message successfully', async () => {
      const sender = new mongoose.Types.ObjectId();
      const receiver = new mongoose.Types.ObjectId();

      app.set('io', {
        to: () => ({ emit: () => {} })
      });

      const response = await request(app)
        .post('/api/messages')
        .set('userid', sender.toString())
        .send({
          receiver_id: receiver.toString(),
          message_text: 'Hello world'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message.message_text).toBe('Hello world');
    });

    it('should fail if receiver is the same as sender', async () => {
      const sender = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post('/api/messages')
        .set('userid', sender.toString())
        .send({
          receiver_id: sender.toString(),
          message_text: 'Hello me'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot send message to yourself');
    });
  });
});
