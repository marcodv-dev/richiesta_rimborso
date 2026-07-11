import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { Nome, Cognome, Email, Password, ConfermaPassword, Ruolo } = req.body;

    if (!Nome || !Nome.trim()) {
      res.status(400).json({ error: 'Il nome è obbligatorio' });
      return;
    }

    if (!Cognome || !Cognome.trim()) {
      res.status(400).json({ error: 'Il cognome è obbligatorio' });
      return;
    }

    if (!Email || !Email.trim()) {
      res.status(400).json({ error: "L'email è obbligatoria" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      res.status(400).json({ error: 'Formato email non valido' });
      return;
    }

    if (!Password) {
      res.status(400).json({ error: 'La password è obbligatoria' });
      return;
    }

    if (Password.length < 6) {
      res.status(400).json({ error: 'La password deve essere lunga almeno 6 caratteri' });
      return;
    }

    if (Password !== ConfermaPassword) {
      res.status(400).json({ error: 'La password e la conferma password non coincidono' });
      return;
    }

    const [existing] = await pool.execute('SELECT * FROM utenti WHERE Email = ?', [Email]);
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(409).json({ error: 'Email già registrata' });
      return;
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    await pool.execute(
      'INSERT INTO utenti (Nome, Cognome, Email, Password, Ruolo) VALUES (?, ?, ?, ?, ?)',
      [Nome, Cognome, Email, hashedPassword, Ruolo || 'dipendente']
    );

    res.status(201).json({ message: 'Registrazione completata con successo' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      res.status(400).json({ error: 'Email e Password sono obbligatori' });
      return;
    }

    const [rows] = await pool.execute('SELECT * FROM utenti WHERE Email = ?', [Email]);
    const users = rows as any[];
    if (users.length === 0) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(Password, user.Password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }

    const token = jwt.sign(
      { UtenteID: user.UtenteID, Ruolo: user.Ruolo },
      process.env.JWT_SECRET || 'supersecretkeytemplate2025',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        UtenteID: user.UtenteID,
        Nome: user.Nome,
        Cognome: user.Cognome,
        Email: user.Email,
        Ruolo: user.Ruolo,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router;
