import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { buscarReceitaAleatoria } from '../services/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css'; 

const Home = () => {
  const [receitaDestaque, setReceitaDestaque] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- FUNÇÃO DE TESTE MANUAL (Para debug) ---
  const testarApiAgora = async () => {
    alert("Iniciando teste...");
    try {
      const dados = await buscarReceitaAleatoria();
      console.log("DADOS RECEBIDOS:", dados); 
      
      if (dados) {
        alert(`SUCESSO! Receita encontrada:\nNome: ${dados.strMeal}\nCategoria: ${dados.strCategory}`);
        setReceitaDestaque(dados); // Força a atualização da tela com o dado do teste
      } else {
        alert("ERRO: A função retornou null/vazio.");
      }
    } catch (error) {
      alert(`ERRO CRÍTICO: ${error.message}`);
    }
  };
  // -------------------------------------------

  useEffect(() => {
    const carregarDestaque = async () => {
      try {
        const receita = await buscarReceitaAleatoria();
        setReceitaDestaque(receita);
      } catch (error) {
        console.error("Erro ao buscar destaque", error);
      } finally {
        setIsLoading(false);
      }
    };
    carregarDestaque();
  }, []);

  return (
    <div className="page-container home-wrapper">
      
      {/* --- BOTÃO DE TESTE TEMPORÁRIO --- */}
      <div style={{ position: 'fixed', top: 80, left: 10, zIndex: 9999 }}>
        <button 
          onClick={testarApiAgora}
          style={{ padding: '15px', fontSize: '16px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          TESTAR API AGORA
        </button>
      </div>
      {/* --------------------------------- */}
      
      {/* LADO ESQUERDO: Texto e Ação */}
      <div className="home-hero">
        <h1 className="hero-title">Cozinhar nunca foi <br/><span className="highlight">tão simples.</span></h1>
        <p className="hero-subtitle">
          Organize sua semana, descubra novos sabores e crie seu próprio livro de receitas digital. Tudo em um só lugar.
        </p>
        
        <div className="hero-buttons">
          <Link to="/busca" className="btn-primary">
            Descobrir Receitas
          </Link>
          <Link to="/planejador" className="btn-secondary">
            Planejar Semana
          </Link>
        </div>
      </div>

      {/* LADO DIREITO: Receita em Destaque */}
      <div className="home-featured">
        <h2 className="featured-label">✨ Sugestão do Chef</h2>
        
        {isLoading ? (
          <div className="featured-loading">
            <LoadingSpinner size="30px" message="" />
          </div>
        ) : receitaDestaque ? (
          <div className="featured-card">
            <div className="featured-image-container">
              <img 
                src={receitaDestaque.strMealThumb} 
                alt={receitaDestaque.strMeal} 
                className="featured-image"
                // crossOrigin="anonymous" removido para evitar problemas com imagens externas
              />
              <span className="featured-category">{receitaDestaque.strCategory}</span>
            </div>
            <div className="featured-content">
              <h3>{receitaDestaque.strMeal}</h3>
              <p>Uma ótima opção para hoje!</p>
              <Link to="/busca" className="btn-text">Ver detalhes &rarr;</Link>
            </div>
          </div>
        ) : (
          <p>Carregando inspiração...</p>
        )}
      </div>

    </div>
  );
};

export default Home;