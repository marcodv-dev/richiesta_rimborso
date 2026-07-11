import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1>Benvenuto, {user?.Nome} {user?.Cognome}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        {user?.Ruolo === 'dipendente'
          ? 'Gestisci le tue richieste di rimborso spese.'
          : 'Gestisci le richieste di rimborso spese dei dipendenti.'}
      </p>

      {user?.Ruolo === 'dipendente' && (
        <div className="actions-bar">
          <a href="/mie-richieste" className="btn btn-primary">Le mie richieste</a>
          <a href="/mie-richieste/nuova" className="btn btn-secondary">Nuova richiesta</a>
        </div>
      )}

      {user?.Ruolo === 'responsabile_amministrativo' && (
        <div className="actions-bar">
          <a href="/admin/richieste" className="btn btn-primary">Tutte le richieste</a>
          <a href="/admin/statistiche" className="btn btn-secondary">Statistiche</a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
