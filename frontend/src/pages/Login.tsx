import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const mostraMessaggio = (tipo: 'success' | 'error', msg: string) => {
    if (tipo === 'success') setSuccess(msg);
    else setError(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.Ruolo === 'responsabile_amministrativo') {
        navigate('/admin/richieste');
      } else {
        navigate('/mie-richieste');
      }
    } catch (err: any) {
      mostraMessaggio('error', err.response?.data?.error || 'Errore durante il login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Accedi</h1>
        {(error || success) && (
          <div className="toast-container">
            {error && <div className="toast toast-error">{error}</div>}
            {success && <div className="toast toast-success">{success}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Accedi</button>
        </form>
        <div className="temporaneo">
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEmail('mario.rossi@azienda.com'); setPassword('password123'); }}>Dipendente</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEmail('laura.bianchi@azienda.com'); setPassword('password123'); }}>Admin</button>
        </div>
        <p className="auth-link">
          Non hai un account? <Link to="/register">Registrati</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
