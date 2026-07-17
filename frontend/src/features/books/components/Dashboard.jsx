import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { getDiaryStats, getMyBooks } from '../api/diary';
import { AddBookForm } from './AddBookForm';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { logout } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const [isAdding, setIsAdding] = useState(false); 

  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, booksData] = await Promise.all([
        getDiaryStats(),
        getMyBooks()
      ]);
      setStats(statsData);
      setBooks(booksData);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleBookAdded = () => {
    setIsAdding(false); 
    fetchDashboardData(); 
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando seu diário...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Meu Diário de Leituras 📖</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Botão para mostrar o formulário */}
          <button onClick={() => setIsAdding(!isAdding)} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isAdding ? 'Fechar Formulário' : '+ Adicionar Livro'}
          </button>
          <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Sair</button>
        </div>
      </header>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>{error}</div>}

      {/* Renderiza o formulário condicionalmente */}
      {isAdding && (
        <AddBookForm 
          onBookAdded={handleBookAdded} 
          onCancel={() => setIsAdding(false)} 
        />
      )}
      {/* SEÇÃO 1: Estatísticas */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', textTransform: 'uppercase' }}>Livros Lidos</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.total_books_read}</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', textTransform: 'uppercase' }}>Média de Notas</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', fontWeight: 'bold' }}>{stats.media_books_rating.toFixed(1)} / 5</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem', textTransform: 'uppercase' }}>Autor Favorito</h3>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.favorite_author || 'N/A'}
            </p>
          </div>
        </section>
      )}

      {/* SEÇÃO 2: Lista de Livros */}
      <section>
        <h2>Minha Biblioteca</h2>
        <hr style={{ margin: '1rem 0 2rem' }} />
        
        {books.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Você ainda não adicionou nenhum livro ao seu diário.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {books.map((book) => (
                <Link 
                  key={book.id} 
                  to={`/dashboard/book/${book.id}`} 
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', background: '#fff', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >

                  {/* ÁREA DA CAPA AJUSTADA PARA O ASPECT RATIO 2:3 */}
                  {book.cover_url ? (
                    <img 
                      src={book.cover_url} 
                      alt={`Capa do livro ${book.name}`} 
                      style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f3f4f6' }} 
                    />
                  ) : (
                    <div style={{ width: '100%', aspectRatio: '2/3', background: '#f3f4f6', borderRadius: '4px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 'bold' }}>
                      Sem Capa
                    </div>
                  )}

                  {/* DADOS DO LIVRO */}
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{book.name}</h3>
                  {book.author && <p style={{ margin: '0 0 0.5rem', color: '#4b5563' }}>✍️ {book.author}</p>}
                  {book.rating && <p style={{ margin: '0 0 0.5rem' }}>⭐ {book.rating} / 5</p>}
                  {book.finished_in && (
                    <p style={{ margin: 'auto 0 0', fontSize: '0.85rem', color: '#9ca3af', paddingTop: '1rem' }}>
                      Finalizado em: {new Date(book.finished_in).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}