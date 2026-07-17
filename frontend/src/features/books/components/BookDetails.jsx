import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDiaryBook, deleteDiaryEntry } from '../api/diary';


export function BookDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const data = await getDiaryBook(id);
        setBook(data);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar os detalhes deste livro.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);


 const handleDelete = async () => {
    // Interceptação Nativa do Navegador
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir "${book.name}" do seu diário? Esta ação não pode ser desfeita.`);
    
    if (!confirmDelete) return; // Se o usuário cancelar, a função morre aqui

    setIsDeleting(true);
    try {
      await deleteDiaryEntry(id);
      alert('Livro removido com sucesso!');
      // Redireciona para o Dashboard destruindo o histórico desta página
      navigate('/dashboard', { replace: true }); 
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao tentar excluir o livro. Tente novamente.');
      setIsDeleting(false); // Só reativamos o botão se der erro
    }
  };




  
  const startEditing = () => {
    setEditData({
      name: book.name || '',
      author: book.author || '',
      genre: book.genre || '',
      rating: book.rating || 5,
      review: book.review || '',
      // Converte a data ISO (2026-06-25T00:00:00Z) para o formato do input HTML (2026-06-25)
      finished_in: book.finished_in ? book.finished_in.split('T')[0] : ''
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 👈 Dispara o PUT para o back-end
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload = {
        ...editData,
        rating: Number(editData.rating),
        finished_in: `${editData.finished_in}T00:00:00Z` // Formato exigido pelo Pydantic
      };

      await updateDiaryEntry(id, payload);
      
      // Atualização Otimista: injeta os novos dados direto no state visual
      setBook(prev => ({ ...prev, ...payload }));
      setIsEditing(false); // Sai do modo de edição
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) return <div style={{ padding: '2rem' }}>Carregando livro...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!book) return <div style={{ padding: '2rem' }}>Livro não encontrado.</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
{/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>
          &larr; Voltar para o Dashboard
        </Link>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Botão de Editar (some quando já estamos editando) */}
          {!isEditing && (
            <button onClick={startEditing} style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              ✏️ Editar
            </button>
          )}

          <button 
            onClick={handleDelete}
            disabled={isDeleting || isEditing}
            style={{ padding: '0.5rem 1rem', background: isDeleting ? '#fca5a5' : '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: (isDeleting || isEditing) ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isEditing ? 0.5 : 1 }}
          >
            {isDeleting ? 'Excluindo...' : '🗑️ Excluir'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        
        {/* Coluna da Capa (Fixa, não muda no modo edição) */}
        <div style={{ flex: '1 1 250px', maxWidth: '300px' }}>
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.name} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '2/3', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem Capa</div>
          )}
        </div>

        {/* Coluna de Dados: Renderiza Texto (Leitura) OU Formulário (Edição) */}
        <div style={{ flex: '2 1 300px' }}>
          
          {isEditing ? (
            // ================== MODO DE EDIÇÃO ==================
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Título</label>
                <input type="text" name="name" value={editData.name} onChange={handleEditChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Autor</label>
                <input type="text" name="author" value={editData.author} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Gênero</label>
                  <input type="text" name="genre" value={editData.genre} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Nota</label>
                  <input type="number" name="rating" min="1" max="5" value={editData.rating} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Finalizado em</label>
                <input type="date" name="finished_in" value={editData.finished_in} onChange={handleEditChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Sua Resenha</label>
                <textarea name="review" rows="5" value={editData.review} onChange={handleEditChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} disabled={isSaving} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSaving} style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          ) : (
            // ================== MODO DE VISUALIZAÇÃO (Código anterior) ==================
            <>
              <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{book.name}</h1>
              {book.author && <h3 style={{ color: '#4b5563', marginTop: 0 }}>{book.author}</h3>}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {book.genre && <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>{book.genre}</span>}
                {book.rating && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>⭐ {book.rating} / 5</span>}
              </div>

              <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb' }} />

              <h4 style={{ marginBottom: '0.5rem', color: '#111827' }}>Minha Resenha:</h4>
              {book.review ? (
                <p style={{ lineHeight: '1.6', color: '#4b5563', whiteSpace: 'pre-wrap' }}>{book.review}</p>
              ) : (
                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Nenhuma resenha escrita para este livro.</p>
              )}

              <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Leitura finalizada em: {new Date(book.finished_in).toLocaleDateString('pt-BR')}
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}