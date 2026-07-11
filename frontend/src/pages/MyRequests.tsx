import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

interface Richiesta {
  RichiestaID: number;
  DataSpesa: string;
  CategoriaDescrizione: string;
  Importo: number;
  Descrizione: string;
  Stato: string;
  DataValutazione: string | null;
  DataLiquidazione: string | null;
  MotivazioneRifiuto: string | null;
}

interface Categoria {
  CategoriaID: number;
  Descrizione: string;
}

const MyRequests = () => {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [filtroStato, setFiltroStato] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMese, setFiltroMese] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState<number | null>(null);

  const mostraMessaggio = (tipo: 'success' | 'error' | 'warning', msg: string) => {
    if (tipo === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 2000); }
    else if (tipo === 'error') { setError(msg); setTimeout(() => setError(''), 2000); }
    else { setWarning(msg); setTimeout(() => setWarning(''), 2000); }
  };

  const caricaRichieste = async () => {
    try {
      const params: any = {};
      if (filtroStato) params.stato = filtroStato;
      if (filtroCategoria) params.categoriaId = filtroCategoria;
      if (filtroMese) params.mese = filtroMese;
      const res = await api.get('/rimborsi', { params });
      setRichieste(res.data);
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore nel caricamento');
    }
  };

  const caricaCategorie = async () => {
    try {
      const res = await api.get('/categorie-spesa');
      setCategorie(res.data);
    } catch { }
  };

  useEffect(() => {
    caricaCategorie();
    caricaRichieste();
  }, []);

  const eliminaRichiesta = async (id: number) => {
    if (!window.confirm('Eliminare questa richiesta?')) return;
    setEliminando(id);
    try {
      await api.delete(`/rimborsi/${id}`);
      mostraMessaggio('success', 'Richiesta eliminata con successo');
      caricaRichieste();
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore durante eliminazione');
    } finally {
      setEliminando(null);
    }
  };

  const badgeClasse = (stato: string) => {
    switch (stato) {
      case 'In attesa': return 'badge badge-warning';
      case 'Approvata': return 'badge badge-success';
      case 'Rifiutata': return 'badge badge-error';
      case 'Liquidata': return 'badge badge-info';
      default: return 'badge';
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Le mie richieste di rimborso</h1>

      {(error || success || warning) && (
        <div className="toast-container">
          {error && <div className="toast toast-error">{error}</div>}
          {warning && <div className="toast toast-warning">{warning}</div>}
          {success && <div className="toast toast-success">{success}</div>}
        </div>
      )}

      <div className="filtri-section">
        <div className="filtri-form">
          <div className="form-group">
            <label>Stato</label>
            <select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)}>
              <option value="">Tutti</option>
              <option value="In attesa">In attesa</option>
              <option value="Approvata">Approvata</option>
              <option value="Rifiutata">Rifiutata</option>
              <option value="Liquidata">Liquidata</option>
            </select>
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
            <label>Mese (YYYY-MM)</label>
            <input type="text" value={filtroMese} onChange={(e) => setFiltroMese(e.target.value)} placeholder="2026-05" />
          </div>
          <div className="filtri-actions">
            <button className="btn btn-primary" onClick={caricaRichieste}>Filtra</button>
          </div>
        </div>
      </div>

      <div className="actions-bar">
        <Link to="/mie-richieste/nuova" className="btn btn-primary">Nuova richiesta</Link>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Data spesa</th>
              <th>Categoria</th>
              <th>Importo</th>
              <th>Descrizione</th>
              <th>Stato</th>
              <th>Data valutazione</th>
              <th>Data liquidazione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {richieste.length === 0 ? (
              <tr><td colSpan={8} className="text-center">Nessuna richiesta trovata</td></tr>
            ) : richieste.map((r) => (
              <tr key={r.RichiestaID}>
                <td>{formatDate(r.DataSpesa)}</td>
                <td>{r.CategoriaDescrizione}</td>
                <td>&euro; {Number(r.Importo).toFixed(2)}</td>
                <td>{r.Descrizione}</td>
                <td><span className={badgeClasse(r.Stato)}>{r.Stato}</span></td>
                <td>{formatDate(r.DataValutazione)}</td>
                <td>{formatDate(r.DataLiquidazione)}</td>
                <td className="actions-cell">
                  <Link to={`/mie-richieste/${r.RichiestaID}`} className="btn btn-sm btn-secondary">Dettaglio</Link>
                  {r.Stato === 'In attesa' && (
                    <>
                      <Link to={`/mie-richieste/${r.RichiestaID}/modifica`} className="btn btn-sm btn-primary">Modifica</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => eliminaRichiesta(r.RichiestaID)} disabled={eliminando === r.RichiestaID}>
                        {eliminando === r.RichiestaID ? '...' : 'Elimina'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRequests;
