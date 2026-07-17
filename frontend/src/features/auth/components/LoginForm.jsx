import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../api/login';
import { useAuth } from '../context/AuthContext.jsx';


export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await loginUser(username, password);
      login(data.access_token); 
      
     
      navigate('/dashboard', { replace: true }); 
      
    } catch (err) {
      console.error(err);
      setError('Falha ao autenticar. Verifique suas credenciais.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
      <h3>Entrar no Diário</h3>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input 
        type="text" 
        placeholder="Usuário" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        required 
      />
      
      <input 
        type="password" 
        placeholder="Senha" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      
      <button type="submit">Entrar</button>
    </form>
  );
}