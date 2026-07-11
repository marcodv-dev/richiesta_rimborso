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
  DipendenteNome: string;
  DipendenteCognome: string;
  DataValutazione: string | null;
  DataLiquidazione: string | null;
  MotivazioneRifiuto: string | null;
}

interface Categoria {
  CategoriaID: number;
  Descrizione: string;
}

interface Utente {
  UtenteID: number;
  Nome: string;
  Cognome: string;
}

const AllRequests = () => {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [dipendenti, setDipendenti] = useState<Utente[]>([]);
  const [filtroStato, setFiltroStato] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroMese, setFiltroMese] = useState('');
  const [filtroDipendente, setFiltroDipendente] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [rifiutaId, setRifiutaId] = useState<number | null>(null);
  const [motivazioneRifiuto, setMotivazioneRifiuto] = useState('');

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
      if (filtroDipendente) params.dipendenteId = filtroDipendente;
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

  const caricaDipendenti = async () => {
    try {
      const res = await api.get('/rimborsi');
      const utenti = res.data.map((r: any) => ({
        UtenteID: r.DipendenteID,
        Nome: r.DipendenteNome,
        Cognome: r.DipendenteCognome,
      }));
      const unici = utenti.filter((u: Utente, i: number, self: Utente[]) =>
        i === self.findIndex((t) => t.UtenteID === u.UtenteID)
      );
      setDipendenti(unici);
    } catch { }
  };

  useEffect(() => {
    caricaCategorie();
    caricaRichieste();
    caricaDipendenti();
  }, []);

  const approva = async (id: number) => {
    try {
      await api.put(`/rimborsi/${id}/approva`);
      mostraMessaggio('success', 'Richiesta approvata con successo');
      caricaRichieste();
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore');
    }
  };

  const apriRifiuta = (id: number) => {
    setRifiutaId(id);
    setMotivazioneRifiuto('');
  };

  const confermaRifiuta = async () => {
    if (!rifiutaId) return;
    try {
      await api.put(`/rimborsi/${rifiutaId}/rifiuta`, { Motivazione: motivazioneRifiuto });
      mostraMessaggio('success', 'Richiesta rifiutata con successo');
      setRifiutaId(null);
      caricaRichieste();
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore');
    }
  };

  const liquida = async (id: number) => {
    try {
      await api.put(`/rimborsi/${id}/liquida`);
      mostraMessaggio('success', 'Richiesta liquidata con successo');
      caricaRichieste();
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore');
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
      <h1>Tutte le richieste di rimborso</h1>

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
            <button className="btn btn-primary" onClick={caricaRichieste}>Filtra</button>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Dipendente</th>
              <th>Data spesa</th>
              <th>Categoria</th>
              <th>Importo</th>
              <th>Descrizione</th>
              <th>Stato</th>
              <th>Valutazione</th>
              <th>Liquidazione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {richieste.length === 0 ? (
              <tr><td colSpan={9} className="text-center">Nessuna richiesta trovata</td></tr>
            ) : richieste.map((r) => (
              <tr key={r.RichiestaID}>
                <td>{r.DipendenteNome} {r.DipendenteCognome}</td>
                <td>{formatDate(r.DataSpesa)}</td>
                <td>{r.CategoriaDescrizione}</td>
                <td>&euro; {Number(r.Importo).toFixed(2)}</td>
                <td>{r.Descrizione}</td>
                <td><span className={badgeClasse(r.Stato)}>{r.Stato}</span></td>
                <td>{formatDate(r.DataValutazione)}</td>
                <td>{formatDate(r.DataLiquidazione)}</td>
                <td className="actions-cell">
                  <Link to={`/admin/richieste/${r.RichiestaID}`} className="btn btn-sm btn-secondary">Dettaglio</Link>
                  {r.Stato === 'In attesa' && (
                    <>
                      <button className="btn btn-sm btn-primary" onClick={() => approva(r.RichiestaID)}>Approva</button>
                      <button className="btn btn-sm btn-danger" onClick={() => apriRifiuta(r.RichiestaID)}>Rifiuta</button>
                    </>
                  )}
                  {r.Stato === 'Approvata' && (
                    <button className="btn btn-sm btn-info" onClick={() => liquida(r.RichiestaID)}>Liquida</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rifiutaId && (
        <div className="modal-overlay" onClick={() => setRifiutaId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Rifiuta richiesta</h2>
            <div className="form-group">
              <label>Motivazione (opzionale)</label>
              <textarea value={motivazioneRifiuto} onChange={(e) => setMotivazioneRifiuto(e.target.value)} rows={3} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={confermaRifiuta}>Conferma rifiuto</button>
              <button className="btn btn-secondary" onClick={() => setRifiutaId(null)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRequests;
