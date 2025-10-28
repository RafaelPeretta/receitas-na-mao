import React, { useEffect } from 'react';
// 1. Importações do React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { initDb } from './database/db'; 

// 2. Importações das nossas páginas e componentes
import Home from './pages/Home';
import Busca from './pages/Busca';
import MeuLivro from './pages/MeuLivro';
import Header from './components/Header'; // <-- Importa o Header

function App() {

  useEffect(() => {
    console.log("App carregado. Inicializando o banco de dados...");
    initDb();
  }, []);

  // 3. Configuração do Router
  return (
    <BrowserRouter> {/* O 'BrowserRouter' envolve toda a aplicação */}
      <div className="App">
        <Header /> {/* O Header agora aparece em todas as páginas */}
        
        <main>
          {/* 'Routes' define a área onde as páginas vão trocar */}
          <Routes> 
            {/* 'Route' define cada página individual */}
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