import { Request } from 'express';

export interface User {
  UtenteID: number;
  Nome: string;
  Cognome: string;
  Email: string;
  Password: string;
  Ruolo: string;
}

export interface AuthRequest extends Request {
  user?: {
    UtenteID: number;
    Ruolo: string;
  };
}
