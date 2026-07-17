import { Link } from 'react-router-dom';

export function Vitrine() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Vitrine de Vendas 🛒</h1>
      <p>Esta é uma Rota Pública. Qualquer pessoa acessa.</p>
      <Link to="/login">
        <button style={{ marginTop: '1rem' }}>Ir para o Login do Diário</button>
      </Link>
    </div>
  );
}