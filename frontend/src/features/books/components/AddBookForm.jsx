import { useState } from 'react';
import { createDiaryEntry, uploadDiaryCover } from '../api/diary';

export function AddBookForm({ onBookAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    genre: '',
    rating: 5,
    review: '',
    finished_in: new Date().toISOString().split('T')[0], // Pega a data de hoje no formato YYYY-MM-DD
  });
  const [coverFile, setCoverFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    // Captura o arquivo físico selecionado no input
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Formata a data para o Pydantic (adicionando tempo zerado)
      const payload = {
        ...formData,
        rating: Number(formData.rating),
        finished_in: `${formData.finished_in}T00:00:00Z` 
      };

      // PASSO 1: Salva o livro
      const newBook = await createDiaryEntry(payload);

      // PASSO 2: Se tem imagem, faz o upload para o S3 usando o ID retornado
      if (coverFile) {
        await uploadDiaryCover(newBook.id, coverFile);
      }

      // Avisa o componente pai (Dashboard) que o processo terminou para ele atualizar a lista
      onBookAdded();
      
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar o livro ou a imagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
      <h2 style={{ marginTop: 0 }}>Adicionar Nova Leitura</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <label>Título do Livro *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label>Autor</label>
          <input type="text" name="author" value={formData.author} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label>Gênero</label>
          <input type="text" name="genre" value={formData.genre} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label>Nota (1 a 5)</label>
          <input type="number" name="rating" min="1" max="5" value={formData.rating} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div>
          <label>Data de Término *</label>
          <input type="date" name="finished_in" value={formData.finished_in} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Capa do Livro (Opcional, Max 2MB)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label>Sua Resenha</label>
          <textarea name="review" rows="4" value={formData.review} onChange={handleChange} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="button" onClick={onCancel} disabled={loading} style={{ padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Salvando...' : 'Salvar no Diário'}
          </button>
        </div>
      </form>
    </div>
  );
}