import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Categoria {
  CategoriaID: number;
  Descrizione: string;
}

const EditRequest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [dataSpesa, setDataSpesa] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [importo, setImporto] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [riferimento, setRiferimento] = useState('');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviando, setInviando] = useState(false);
  const [caricamento, setCaricamento] = useState(true);

  const mostraMessaggio = (tipo: 'success' | 'error' | 'warning', msg: string) => {
    if (tipo === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 2000); }
    else if (tipo === 'error') { setError(msg); setTimeout(() => setError(''), 2000); }
    else { setWarning(msg); setTimeout(() => setWarning(''), 2000); }
  };

  useEffect(() => {
    const carica = async () => {
      try {
        const [catRes, richRes] = await Promise.all([
          api.get('/categorie-spesa'),
          api.get(`/rimborsi/${id}`),
        ]);
        setCategorie(catRes.data);
        const r = richRes.data;
        setDataSpesa(r.DataSpesa);
        setCategoriaId(String(r.CategoriaID));
        setImporto(String(r.Importo));
        setDescrizione(r.Descrizione);
        setRiferimento(r.RiferimentoGiustificativo || '');
      } catch (err: any) {
        mostraMessaggio('error', err.response?.data?.error || 'Errore nel caricamento');
      } finally {
        setCaricamento(false);
      }
    };
    carica();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setWarning('');

    if (!dataSpesa) {
      mostraMessaggio('error', 'La data della spesa è obbligatoria');
      return;
    }

    if (!categoriaId) {
      mostraMessaggio('error', 'La categoria è obbligatoria');
      return;
    }

    if (!importo || Number(importo) <= 0) {
      mostraMessaggio('error', "L'importo deve essere maggiore di zero");
      return;
    }

    if (!descrizione.trim()) {
      mostraMessaggio('error', 'La descrizione è obbligatoria');
      return;
    }

    setInviando(true);
    try {
      await api.put(`/rimborsi/${id}`, {
        DataSpesa: dataSpesa,
        CategoriaID: Number(categoriaId),
        Importo: Number(importo),
        Descrizione: descrizione.trim(),
        RiferimentoGiustificativo: riferimento.trim() || null,
      });
      mostraMessaggio('success', 'Richiesta aggiornata con successo!');
      setTimeout(() => navigate('/mie-richieste'), 1500);
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore durante la modifica');
    } finally {
      setInviando(false);
    }
  };

  if (caricamento) return <div className="dashboard-container"><p>Caricamento...</p></div>;

  return (
    <div className="dashboard-container">
      <h1>Modifica richiesta #{id}</h1>

      {(error || success || warning) && (
        <div className="toast-container">
          {error && <div className="toast toast-error">{error}</div>}
          {warning && <div className="toast toast-warning">{warning}</div>}
          {success && <div className="toast toast-success">{success}</div>}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Data della spesa *</label>
          <input type="date" value={dataSpesa} onChange={(e) => setDataSpesa(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Categoria *</label>
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
            <option value="">Seleziona categoria</option>
            {categorie.map((c) => (
              <option key={c.CategoriaID} value={c.CategoriaID}>{c.Descrizione}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Importo (&euro;) *</label>
          <input type="number" step="0.01" min="0.01" value={importo} onChange={(e) => setImporto(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Descrizione *</label>
          <textarea value={descrizione} onChange={(e) => setDescrizione(e.target.value)} rows={3} required />
        </div>
        <div className="form-group">
          <label>Riferimento giustificativo</label>
          <input type="text" value={riferimento} onChange={(e) => setRiferimento(e.target.value)} placeholder="es. scontrino_001.pdf" />
        </div>
        <div className="actions-bar">
          <button type="submit" className="btn btn-primary" disabled={inviando}>
            {inviando ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/mie-richieste')}>Annulla</button>
        </div>
      </form>
    </div>
  );
};

export default EditRequest;
