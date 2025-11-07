import React, { useState, useEffect } from 'react';
import { getReceitasSalvas, deletarReceita } from '../database/db';
import toast from 'react-hot-toast'; 
import './Busca.css'; 

// 1. IMPORTAR O NOVO COMPONENTE
import LoadingSpinner from '../components/LoadingSpinner';

const MeuLivro = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarReceitas = () => {
    setIsLoading(true);
    const receitas = getReceitasSalvas();
    setReceitasSalvas(receitas);
    setIsLoading(false);
  };

  useEffect(() => {
    carregarReceitas();
  }, []); 

  const handleDeletar = (id, nome) => {
    // ... (função deletar continua a mesma) ...
    if (window.confirm(`Tem certeza que quer deletar a receita "${nome}"?`)) {
      setReceitasSalvas(receitasAtuais => 
        receitasAtuais.filter(receita => receita.id !== id)
      );
      const sucesso = deletarReceita(id);
      if (sucesso) {
        toast.success(`Receita "${nome}" deletada!`);
      } else {
        toast.error("Erro ao deletar a receita.");
        carregarReceitas(); 
      }
    }
  };

  // 2. SUBSTITUIR o texto de 'Carregando' pelo Spinner
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
        // 3. MELHORAR o estado vazio
        <div className="estado-vazio-container">
          <p className="busca-mensagem">Você ainda não salvou nenhuma receita.</p>
          <p>Vá até a aba "Buscar Receitas" para adicionar algumas!</p>
        </div>
      ) : (
        <div className="resultados-container">
          {receitasSalvas.map((receita) => (
             // ... (o card da receita continua o mesmo) ...
            <div key={receita.id} className="receita-card">
              <img 
                src={receita.imagemUrl} 
                alt={receita.nome} 
                className="receita-imagem" 
                crossOrigin="anonymous" 
              />
              <h3 className="receita-titulo">{receita.nome}</h3>
              <a href={receita.urlOriginal} target="_blank" rel="noopener noreferrer">
                Ver receita original
              </a>
              
              <button
                onClick={() => handleDeletar(receita.id, receita.nome)}
                className="deletar-button"
              >
                Remover Receita
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeuLivro;