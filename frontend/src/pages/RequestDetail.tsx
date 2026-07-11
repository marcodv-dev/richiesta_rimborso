import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/formatters';

interface Richiesta {
  RichiestaID: number;
  DataInserimento: string;
  DataSpesa: string;
  CategoriaID: number;
  CategoriaDescrizione: string;
  Importo: number;
  Descrizione: string;
  RiferimentoGiustificativo: string | null;
  Stato: string;
  DipendenteID: number;
  DipendenteNome: string;
  DipendenteCognome: string;
  DataValutazione: string | null;
  ResponsabileValutazioneID: number | null;
  ValutatoreNome: string | null;
  ValutatoreCognome: string | null;
  MotivazioneRifiuto: string | null;
  DataLiquidazione: string | null;
}

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [richiesta, setRichiesta] = useState<Richiesta | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [caricamento, setCaricamento] = useState(true);

  const mostraMessaggio = (tipo: 'success' | 'error', msg: string) => {
    if (tipo === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 2000); }
    else { setError(msg); setTimeout(() => setError(''), 2000); }
  };

  useEffect(() => {
    const carica = async () => {
      try {
        const res = await api.get(`/rimborsi/${id}`);
        setRichiesta(res.data);
      } catch (err: any) {
        mostraMessaggio('error', err.response?.data?.error || 'Errore');
      } finally {
        setCaricamento(false);
      }
    };
    carica();
  }, [id]);

  const badgeClasse = (stato: string) => {
    switch (stato) {
      case 'In attesa': return 'badge badge-warning';
      case 'Approvata': return 'badge badge-success';
      case 'Rifiutata': return 'badge badge-error';
      case 'Liquidata': return 'badge badge-info';
      default: return 'badge';
    }
  };

  if (caricamento) return <div className="dashboard-container"><p>Caricamento...</p></div>;
  if (!richiesta) return <div className="dashboard-container"><p className="text-center">Richiesta non trovata</p></div>;

  const isMia = user?.Ruolo === 'dipendente' && richiesta.DipendenteID === user?.UtenteID;
  const isAdmin = user?.Ruolo === 'responsabile_amministrativo';

  return (
    <div className="dashboard-container">
      {(error || success) && (
        <div className="toast-container">
          {error && <div className="toast toast-error">{error}</div>}
          {success && <div className="toast toast-success">{success}</div>}
        </div>
      )}

      <h1>Dettaglio richiesta #{richiesta.RichiestaID}</h1>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Stato</label>
          <div><span className={badgeClasse(richiesta.Stato)} style={{ fontSize: '0.9rem', padding: '0.3rem 1rem' }}>{richiesta.Stato}</span></div>
        </div>
        <div className="form-group">
          <label>Data inserimento</label>
          <p>{formatDateTime(richiesta.DataInserimento)}</p>
        </div>
        <div className="form-group">
          <label>Data spesa</label>
          <p>{formatDate(richiesta.DataSpesa)}</p>
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <p>{richiesta.CategoriaDescrizione}</p>
        </div>
        <div className="form-group">
          <label>Importo</label>
          <p>&euro; {Number(richiesta.Importo).toFixed(2)}</p>
        </div>
        <div className="form-group">
          <label>Descrizione</label>
          <p>{richiesta.Descrizione}</p>
        </div>
        {richiesta.RiferimentoGiustificativo && (
          <div className="form-group">
            <label>Riferimento giustificativo</label>
            <p>{richiesta.RiferimentoGiustificativo}</p>
          </div>
        )}
        <div className="form-group">
          <label>Dipendente</label>
          <p>{richiesta.DipendenteNome} {richiesta.DipendenteCognome}</p>
        </div>
        {richiesta.DataValutazione && (
          <div className="form-group">
            <label>Data valutazione</label>
            <p>{formatDate(richiesta.DataValutazione)} {richiesta.ValutatoreNome ? `- ${richiesta.ValutatoreNome} ${richiesta.ValutatoreCognome}` : ''}</p>
          </div>
        )}
        {richiesta.MotivazioneRifiuto && (
          <div className="form-group">
            <label>Motivazione rifiuto</label>
            <p>{richiesta.MotivazioneRifiuto}</p>
          </div>
        )}
        {richiesta.DataLiquidazione && (
          <div className="form-group">
            <label>Data liquidazione</label>
            <p>{formatDate(richiesta.DataLiquidazione)}</p>
          </div>
        )}
      </div>

      <div className="actions-bar" style={{ marginTop: '2rem' }}>
        {isMia && richiesta.Stato === 'In attesa' && (
          <>
            <Link to={`/mie-richieste/${richiesta.RichiestaID}/modifica`} className="btn btn-primary">Modifica</Link>
            <button className="btn btn-danger" onClick={async () => {
              if (!window.confirm('Eliminare?')) return;
              try { await api.delete(`/rimborsi/${richiesta.RichiestaID}`); mostraMessaggio('success', 'Eliminata'); setTimeout(() => navigate('/mie-richieste'), 1500); }
              catch (err: any) { mostraMessaggio('error', err.response?.data?.error || 'Errore'); }
            }}>Elimina</button>
          </>
        )}
        {isAdmin && richiesta.Stato === 'In attesa' && (
          <>
            <button className="btn btn-primary" onClick={async () => {
              try { await api.put(`/rimborsi/${richiesta.RichiestaID}/approva`); mostraMessaggio('success', 'Approvata'); setTimeout(() => navigate('/admin/richieste'), 1500); }
              catch (err: any) { mostraMessaggio('error', err.response?.data?.error || 'Errore'); }
            }}>Approva</button>
            <button className="btn btn-danger" onClick={async () => {
              const motivazione = window.prompt('Motivazione rifiuto (opzionale):');
              try { await api.put(`/rimborsi/${richiesta.RichiestaID}/rifiuta`, { Motivazione: motivazione || '' }); mostraMessaggio('success', 'Rifiutata'); setTimeout(() => navigate('/admin/richieste'), 1500); }
              catch (err: any) { mostraMessaggio('error', err.response?.data?.error || 'Errore'); }
            }}>Rifiuta</button>
          </>
        )}
        {isAdmin && richiesta.Stato === 'Approvata' && (
          <button className="btn btn-info" onClick={async () => {
            try { await api.put(`/rimborsi/${richiesta.RichiestaID}/liquida`); mostraMessaggio('success', 'Liquidata'); setTimeout(() => navigate('/admin/richieste'), 1500); }
            catch (err: any) { mostraMessaggio('error', err.response?.data?.error || 'Errore'); }
          }}>Liquida</button>
        )}
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>Indietro</button>
      </div>
    </div>
  );
};

export default RequestDetail;
