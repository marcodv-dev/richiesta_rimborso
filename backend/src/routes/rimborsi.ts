import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { stato, categoriaId, mese, dipendenteId } = req.query;

    let sql = `
      SELECT r.*, c.Descrizione as CategoriaDescrizione,
             u.Nome as DipendenteNome, u.Cognome as DipendenteCognome,
             rv.Nome as ValutatoreNome, rv.Cognome as ValutatoreCognome
      FROM richiestarimborso r
      JOIN categoriaspesa c ON r.CategoriaID = c.CategoriaID
      JOIN utenti u ON r.DipendenteID = u.UtenteID
      LEFT JOIN utenti rv ON r.ResponsabileValutazioneID = rv.UtenteID
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.Ruolo === 'dipendente') {
      sql += ' AND r.DipendenteID = ?';
      params.push(user.UtenteID);
    }

    if (stato) {
      sql += ' AND r.Stato = ?';
      params.push(stato);
    }

    if (categoriaId) {
      sql += ' AND r.CategoriaID = ?';
      params.push(Number(categoriaId));
    }

    if (mese) {
      sql += ' AND DATE_FORMAT(r.DataInserimento, ?) = ?';
      params.push('%Y-%m', mese as string);
    }

    if (user.Ruolo === 'responsabile_amministrativo' && dipendenteId) {
      sql += ' AND r.DipendenteID = ?';
      params.push(Number(dipendenteId));
    }

    sql += ' ORDER BY r.DataInserimento DESC';

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const sql = `
      SELECT r.*, c.Descrizione as CategoriaDescrizione,
             u.Nome as DipendenteNome, u.Cognome as DipendenteCognome,
             rv.Nome as ValutatoreNome, rv.Cognome as ValutatoreCognome
      FROM richiestarimborso r
      JOIN categoriaspesa c ON r.CategoriaID = c.CategoriaID
      JOIN utenti u ON r.DipendenteID = u.UtenteID
      LEFT JOIN utenti rv ON r.ResponsabileValutazioneID = rv.UtenteID
      WHERE r.RichiestaID = ?
    `;
    const [rows] = await pool.execute(sql, [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (user.Ruolo === 'dipendente' && request.DipendenteID !== user.UtenteID) {
      res.status(403).json({ error: 'Non hai accesso a questa richiesta' });
      return;
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/', authenticate, requireRole('dipendente'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { DataSpesa, CategoriaID, Importo, Descrizione, RiferimentoGiustificativo } = req.body;

    if (!DataSpesa) {
      res.status(400).json({ error: 'La data della spesa è obbligatoria' });
      return;
    }

    if (!Importo || Number(Importo) <= 0) {
      res.status(400).json({ error: "L'importo deve essere maggiore di zero" });
      return;
    }

    if (!CategoriaID) {
      res.status(400).json({ error: 'La categoria è obbligatoria' });
      return;
    }

    if (!Descrizione || Descrizione.trim() === '') {
      res.status(400).json({ error: 'La descrizione è obbligatoria' });
      return;
    }

    if (RiferimentoGiustificativo && RiferimentoGiustificativo.trim() === '') {
      res.status(400).json({ error: 'Il riferimento al giustificativo non può essere vuoto' });
      return;
    }

    const [catRows] = await pool.execute('SELECT * FROM categoriaspesa WHERE CategoriaID = ?', [CategoriaID]);
    if (!Array.isArray(catRows) || catRows.length === 0) {
      res.status(400).json({ error: 'Categoria non esistente' });
      return;
    }

    const [result] = await pool.execute(
      `INSERT INTO richiestarimborso (DataSpesa, CategoriaID, Importo, Descrizione, RiferimentoGiustificativo, Stato, DipendenteID)
       VALUES (?, ?, ?, ?, ?, 'In attesa', ?)`,
      [DataSpesa, CategoriaID, Importo, Descrizione, RiferimentoGiustificativo || null, req.user!.UtenteID]
    );

    res.status(201).json({ id: (result as any).insertId, message: 'Richiesta creata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.put('/:id', authenticate, requireRole('dipendente'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { DataSpesa, CategoriaID, Importo, Descrizione, RiferimentoGiustificativo } = req.body;

    const [rows] = await pool.execute('SELECT * FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (request.DipendenteID !== req.user!.UtenteID) {
      res.status(403).json({ error: 'Non puoi modificare una richiesta di altro dipendente' });
      return;
    }

    if (request.Stato !== 'In attesa') {
      res.status(400).json({ error: 'Puoi modificare solo richieste in stato In attesa' });
      return;
    }

    if (DataSpesa !== undefined && !DataSpesa) {
      res.status(400).json({ error: 'La data della spesa non può essere vuota' });
      return;
    }

    if (Importo !== undefined && (Number(Importo) <= 0)) {
      res.status(400).json({ error: "L'importo deve essere maggiore di zero" });
      return;
    }

    if (CategoriaID) {
      const [catRows] = await pool.execute('SELECT * FROM categoriaspesa WHERE CategoriaID = ?', [CategoriaID]);
      if (!Array.isArray(catRows) || catRows.length === 0) {
        res.status(400).json({ error: 'Categoria non esistente' });
        return;
      }
    }

    if (Descrizione !== undefined && Descrizione.trim() === '') {
      res.status(400).json({ error: 'La descrizione non può essere vuota' });
      return;
    }

    if (RiferimentoGiustificativo !== undefined && RiferimentoGiustificativo.trim() === '') {
      res.status(400).json({ error: 'Il riferimento al giustificativo non può essere vuoto' });
      return;
    }

    await pool.execute(
      `UPDATE richiestarimborso SET DataSpesa = ?, CategoriaID = ?, Importo = ?, Descrizione = ?, RiferimentoGiustificativo = ?
       WHERE RichiestaID = ?`,
      [
        DataSpesa || request.DataSpesa,
        CategoriaID || request.CategoriaID,
        Importo !== undefined ? Importo : request.Importo,
        Descrizione || request.Descrizione,
        RiferimentoGiustificativo !== undefined ? RiferimentoGiustificativo : request.RiferimentoGiustificativo,
        id
      ]
    );

    res.json({ message: 'Richiesta aggiornata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.delete('/:id', authenticate, requireRole('dipendente'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (request.DipendenteID !== req.user!.UtenteID) {
      res.status(403).json({ error: 'Non puoi eliminare una richiesta di altro dipendente' });
      return;
    }

    if (request.Stato !== 'In attesa') {
      res.status(400).json({ error: 'Puoi eliminare solo richieste in stato In attesa' });
      return;
    }

    await pool.execute('DELETE FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    res.json({ message: 'Richiesta eliminata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.put('/:id/approva', authenticate, requireRole('responsabile_amministrativo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (request.Stato !== 'In attesa') {
      res.status(400).json({ error: 'Solo le richieste in attesa possono essere approvate' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await pool.execute(
      `UPDATE richiestarimborso SET Stato = 'Approvata', DataValutazione = ?, ResponsabileValutazioneID = ? WHERE RichiestaID = ?`,
      [today, req.user!.UtenteID, id]
    );

    res.json({ message: 'Richiesta approvata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.put('/:id/rifiuta', authenticate, requireRole('responsabile_amministrativo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { Motivazione } = req.body;

    const [rows] = await pool.execute('SELECT * FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (request.Stato !== 'In attesa') {
      res.status(400).json({ error: 'Solo le richieste in attesa possono essere rifiutate' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await pool.execute(
      `UPDATE richiestarimborso SET Stato = 'Rifiutata', DataValutazione = ?, ResponsabileValutazioneID = ?, MotivazioneRifiuto = ? WHERE RichiestaID = ?`,
      [today, req.user!.UtenteID, Motivazione || null, id]
    );

    res.json({ message: 'Richiesta rifiutata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.put('/:id/liquida', authenticate, requireRole('responsabile_amministrativo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM richiestarimborso WHERE RichiestaID = ?', [id]);
    const items = rows as any[];

    if (items.length === 0) {
      res.status(404).json({ error: 'Richiesta non trovata' });
      return;
    }

    const request = items[0];

    if (request.Stato !== 'Approvata') {
      res.status(400).json({ error: 'Solo le richieste approvate possono essere liquidate' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await pool.execute(
      `UPDATE richiestarimborso SET Stato = 'Liquidata', DataLiquidazione = ? WHERE RichiestaID = ?`,
      [today, id]
    );

    res.json({ message: 'Richiesta liquidata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router;
