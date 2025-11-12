import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    // 1. Usamos a tag <header> como container principal
    <header className="main-header"> 
      {/* 2. Nossa <nav> agora fica dentro do header */}
      <nav className="header-nav">
        <Link to="/" className="header-logo">Receitas na Mão</Link>
        <div className="header-links">
          <Link to="/busca" className="header-link">Buscar Receitas</Link>
          <Link to="/meu-livro" className="header-link">Meu Livro</Link>
          
          {/* **** LINHA FALTANTE ADICIONADA AQUI **** */}
          <Link to="/planejador" className="header-link">Planejador</Link> 
          
        </div>
      </nav>
    </header>
  );
};

export default Header;