import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { initDb } from './database/db'; 

// 1. IMPORTAR O TOASTER
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Busca from './pages/Busca';
import MeuLivro from './pages/MeuLivro';
import Header from './components/Header';

function App() {

  useEffect(() => {
    console.log("App carregado. Inicializando o banco de dados...");
    initDb();
  }, []);

  return (
    <BrowserRouter> 
      {/* 2. ADICIONAR O COMPONENTE TOASTER AQUI */}
      {/* Ele vai gerenciar todas as notificações */}
      <Toaster 
        position="top-right" // Posição das notificações
        toastOptions={{
          // Estilos para sucesso
          success: {
            style: {
              background: '#99CC33', // Nosso verde limão
              color: '#333',
            },
          },
          // Estilos para erro
          error: {
            style: {
              background: '#ff4d4d', // Nosso vermelho
              color: 'white',
            },
          },
        }} 
      />
      
      <div className="App">
        <Header />
        <main>
          <Routes> 
            <Route path="/" element={<Home />} />
            <Route path="/busca" element={<Busca />} />
            <Route path="/meu-livro" element={<MeuLivro />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;