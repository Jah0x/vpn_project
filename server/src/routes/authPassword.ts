import { Router } from 'express';
import * as userService from '../services/userService';

const router = Router();

router.post('/login', async (req, res) => {
  const { login, password } = req.body as { login: string; password: string };
  try {
    const tokens = await userService.login(login, password);
    res.json(tokens);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body as {
    email: string;
    username: string;
    password: string;
  };
  try {
    const tokens = await userService.register(email, username, password);
    res.status(201).json(tokens);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
