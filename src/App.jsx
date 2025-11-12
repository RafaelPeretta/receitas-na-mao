import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { initDb } from './database/db'; 
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Busca from './pages/Busca';
import MeuLivro from './pages/MeuLivro';
// import EditarReceita from './pages/EditarReceita'; // 1. DESATIVADO TEMPORARIAMENTE
import Header from './components/Header';
import Planejador from './pages/Planejador';

function App() {

  useEffect(() => {
    initDb();
  }, []);

  return (
    <BrowserRouter> 
      <Toaster 
        position="top-right" 
        toastOptions={{
          success: { style: { background: '#99CC33', color: '#333' } },
          error: { style: { background: '#ff4d4d', color: 'white' } },
        }} 
      />
      
      <div className="App">
        <Header />
        <main>
          <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/busca" element={<Busca />} />
            <Route path="/meu-livro" element={<MeuLivro />} />
            
            {/* 2. ROTA DESATIVADA TEMPORARIAMENTE */}
            {/* <Route path="/editar/:receitaId" element={<EditarReceita />} /> */}
            
            <Route path="/planejador" element={<Planejador />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;