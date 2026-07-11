import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/rimborsi', authenticate, requireRole('responsabile_amministrativo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mese, categoriaId, dipendenteId } = req.query;

    let sql = `
      SELECT
        DATE_FORMAT(r.DataInserimento, '%Y-%m') as mese,
        c.Descrizione as categoria,
        COUNT(*) as numeroRichieste,
        SUM(r.Importo) as totaleRichiesto,
        SUM(CASE WHEN r.Stato IN ('Approvata', 'Liquidata') THEN r.Importo ELSE 0 END) as totaleApprovato,
        SUM(CASE WHEN r.Stato = 'Liquidata' THEN r.Importo ELSE 0 END) as totaleLiquidato
      FROM richiestarimborso r
      JOIN categoriaspesa c ON r.CategoriaID = c.CategoriaID
      WHERE 1=1
    `;
    const params: any[] = [];

    if (mese) {
      sql += ' AND DATE_FORMAT(r.DataInserimento, ?) = ?';
      params.push('%Y-%m', mese as string);
    }

    if (categoriaId) {
      sql += ' AND r.CategoriaID = ?';
      params.push(Number(categoriaId));
    }

    if (dipendenteId) {
      sql += ' AND r.DipendenteID = ?';
      params.push(Number(dipendenteId));
    }

    sql += ' GROUP BY mese, c.Descrizione ORDER BY mese DESC, c.Descrizione';

    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

export default router;
