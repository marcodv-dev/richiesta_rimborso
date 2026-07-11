import { useState, useEffect } from 'react';
import api from '../services/api';

interface Stat {
  mese: string;
  categoria: string;
  numeroRichieste: number;
  totaleRichiesto: number;
  totaleApprovato: number;
  totaleLiquidato: number;
}

interface Categoria {
  CategoriaID: number;
  Descrizione: string;
}

interface Dipendente {
  UtenteID: number;
  Nome: string;
  Cognome: string;
}

const Statistics = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [filtroMese, setFiltroMese] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroDipendente, setFiltroDipendente] = useState('');
  const [error, setError] = useState('');

  const caricaStats = async () => {
    try {
      const params: any = {};
      if (filtroMese) params.mese = filtroMese;
      if (filtroCategoria) params.categoriaId = filtroCategoria;
      if (filtroDipendente) params.dipendenteId = filtroDipendente;
      const res = await api.get('/statistiche/rimborsi', { params });
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Errore nel caricamento');
      setTimeout(() => setError(''), 2000);
    }
  };

  useEffect(() => {
    api.get('/categorie-spesa').then((res) => setCategorie(res.data)).catch(() => {});
    api.get('/rimborsi').then((res) => {
      const utenti = res.data.map((r: any) => ({
        UtenteID: r.DipendenteID,
        Nome: r.DipendenteNome,
        Cognome: r.DipendenteCognome,
      }));
      const unici = utenti.filter((u: Dipendente, i: number, self: Dipendente[]) =>
        i === self.findIndex((t) => t.UtenteID === u.UtenteID)
      );
      setDipendenti(unici);
    }).catch(() => {});
    caricaStats();
  }, []);

  const maxRichiesto = Math.max(...stats.map((s) => s.totaleRichiesto), 1);

  return (
    <div className="dashboard-container">
      <h1>Statistiche rimborsi</h1>

      {error && (
        <div className="toast-container">
          <div className="toast toast-error">{error}</div>
        </div>
      )}

      <div className="filtri-section">
        <div className="filtri-form">
          <div className="form-group">
            <label>Mese (YYYY-MM)</label>
            <input type="text" value={filtroMese} onChange={(e) => setFiltroMese(e.target.value)} placeholder="2026-05" />
          </div>
          <div className="form-group">
            <label>Categoria</label>
            <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="">Tutte</option>
              {categorie.map((c) => (
                <option key={c.CategoriaID} value={c.CategoriaID}>{c.Descrizione}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Dipendente</label>
            <select value={filtroDipendente} onChange={(e) => setFiltroDipendente(e.target.value)}>
              <option value="">Tutti</option>
              {dipendenti.map((d) => (
                <option key={d.UtenteID} value={d.UtenteID}>{d.Nome} {d.Cognome}</option>
              ))}
            </select>
          </div>
          <div className="filtri-actions">
            <button className="btn btn-primary" onClick={caricaStats}>Filtra</button>
          </div>
        </div>
      </div>

      {stats.length === 0 ? (
        <p className="text-center">Nessun dato statistico disponibile</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Mese</th>
                <th>Categoria</th>
                <th>N. richieste</th>
                <th>Totale richiesto</th>
                <th>Totale approvato</th>
                <th>Totale liquidato</th>
                <th>Andamento</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, i) => (
                <tr key={i}>
                  <td>{s.mese}</td>
                  <td>{s.categoria}</td>
                  <td>{s.numeroRichieste}</td>
                  <td>&euro; {Number(s.totaleRichiesto).toFixed(2)}</td>
                  <td>&euro; {Number(s.totaleApprovato).toFixed(2)}</td>
                  <td>&euro; {Number(s.totaleLiquidato).toFixed(2)}</td>
                  <td>
                    <div className="bar-chart" title={`${((s.totaleRichiesto / maxRichiesto) * 100).toFixed(0)}%`}>
                      <div className="bar-fill" style={{ width: `${(s.totaleRichiesto / maxRichiesto) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Statistics;
