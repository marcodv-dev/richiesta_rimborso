import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <div className="nav-container">
        <Link to="/" className="nav-logo">Rimborsi Spese</Link>
        <div className="nav-links">
          {user?.Ruolo === 'dipendente' && (
            <>
              <Link to="/mie-richieste">Le mie richieste</Link>
              <Link to="/mie-richieste/nuova">Nuova richiesta</Link>
            </>
          )}
          {user?.Ruolo === 'responsabile_amministrativo' && (
            <>
              <Link to="/admin/richieste">Tutte le richieste</Link>
              <Link to="/admin/statistiche">Statistiche</Link>
            </>
          )}
          <span className="nav-user">{user?.Nome} {user?.Cognome} ({user?.Ruolo === 'dipendente' ? 'Dipendente' : 'Admin'})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
