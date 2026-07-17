import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute } from './routes/PrivateRoute';
import { GuestRoute } from './routes/GuestRoute';
import { Vitrine } from './features/books/components/Vitrine';
import { LoginForm } from './features/auth/components/LoginForm';
import { BookDetails } from './features/books/components/BookDetails';
import { Dashboard } from './features/books/components/Dashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA PÚBLICA */}
        <Route path="/" element={<Vitrine />} />

        {/* ROTAS PARA CONVIDADOS (Apenas não logados) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginForm />} />
          {/* Futuramente você adiciona a rota de /register aqui */}
        </Route>

        {/* ROTAS PRIVADAS (Apenas logados) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
  
          
          <Route path="/dashboard/book/:id" element={<BookDetails/>} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;