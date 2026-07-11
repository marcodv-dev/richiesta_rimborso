import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [ruolo, setRuolo] = useState('dipendente');
  const [warning, setWarning] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const mostraMessaggio = (tipo: 'success' | 'error' | 'warning', msg: string) => {
    if (tipo === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 2000); }
    else if (tipo === 'error') { setError(msg); setTimeout(() => setError(''), 2000); }
    else { setWarning(msg); setTimeout(() => setWarning(''), 2000); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWarning('');

    if (!nome.trim() || !cognome.trim()) {
      mostraMessaggio('error', 'Nome e cognome sono obbligatori');
      return;
    }

    if (password !== confermaPassword) {
      mostraMessaggio('error', 'Le password non coincidono');
      return;
    }

    try {
      await register(nome.trim(), cognome.trim(), email, password, confermaPassword, ruolo);
      mostraMessaggio('success', 'Registrazione completata! Reindirizzamento al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore durante la registrazione');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Registrati</h1>
        {(error || success || warning) && (
          <div className="toast-container">
            {error && <div className="toast toast-error">{error}</div>}
            {warning && <div className="toast toast-warning">{warning}</div>}
            {success && <div className="toast toast-success">{success}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Cognome</label>
            <input type="text" value={cognome} onChange={(e) => setCognome(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Conferma Password</label>
            <input type="password" value={confermaPassword} onChange={(e) => setConfermaPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Ruolo</label>
            <select value={ruolo} onChange={(e) => setRuolo(e.target.value)}>
              <option value="dipendente">Dipendente</option>
              <option value="responsabile_amministrativo">Responsabile amministrativo</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Registrati</button>
        </form>
        <p className="auth-link">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
