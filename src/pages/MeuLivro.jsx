import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getReceitasSalvas, deletarReceita } from '../database/db';
import toast from 'react-hot-toast'; 
import './Busca.css'; 
import LoadingSpinner from '../components/LoadingSpinner';

const MeuLivro = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarReceitas = async () => {
    setIsLoading(true);
    try {
      const receitas = await getReceitasSalvas(); 
      setReceitasSalvas(receitas);
    } catch (error) {
      console.error("Erro ao carregar receitas salvas:", error);
      toast.error("Não foi possível carregar seu livro de receitas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarReceitas();
  }, []); 

  const handleDeletar = async (id, nome) => {
    if (window.confirm(`Tem certeza que quer deletar a receita "${nome}"?`)) {
      
      setReceitasSalvas(receitasAtuais => 
        receitasAtuais.filter(receita => receita.id !== id)
      );

      try {
        await deletarReceita(id); 
        toast.success(`Receita "${nome}" deletada!`);
      } catch (error) {
        toast.error("Erro ao deletar a receita.");
        carregarReceitas(); 
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner message="Carregando seu livro de receitas..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Meu Livro de Receitas</h1>
      
      {receitasSalvas.length === 0 ? (
        <div className="estado-vazio-container">
          <p className="busca-mensagem">Você ainda não salvou nenhuma receita.</p>
          <p>Vá até a aba "Buscar Receitas" para adicionar algumas!</p>
        </div>
      ) : (
        <div className="resultados-container">
          {receitasSalvas.map((receita) => (
            <div key={receita.id} className="receita-card">
              <img 
                src={receita.imagemUrl} 
                alt={receita.nome} 
                className="receita-imagem" 
              />
              <h3 className="receita-titulo">{receita.nome}</h3>
              
              {/* Lógica Condicional para o Link (usando urlOriginal do banco) */}
              {receita.urlOriginal && receita.urlOriginal.trim() !== "" ? (
                <a href={receita.urlOriginal} target="_blank" rel="noopener noreferrer">
                  Ver receita original
                </a>
              ) : (
                <span style={{ color: '#999', fontSize: '14px' }}>Fonte indisponível</span>
              )}
              
              <div className="card-actions">
                <Link to={`/editar/${receita.id}`} className="editar-button">
                  Editar
                </Link>
                <button
                  onClick={() => handleDeletar(receita.id, receita.nome)}
                  className="deletar-button-card"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeuLivro;