import React, { useState, useEffect } from 'react';
// Importa a nova função 'deletarReceita'
import { getReceitasSalvas, deletarReceita } from '../database/db';
import './Busca.css'; // Continua usando os estilos daqui

const MeuLivro = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função separada para carregar receitas, para que possamos chamá-la novamente
  const carregarReceitas = () => {
    setIsLoading(true);
    console.log("Carregando receitas salvas do banco de dados...");
    const receitas = getReceitasSalvas();
    setReceitasSalvas(receitas);
    setIsLoading(false);
    console.log("Receitas carregadas:", receitas);
  };

  // useEffect agora só chama a função de carregar
  useEffect(() => {
    carregarReceitas();
  }, []); // O array '[]' garante que rode só na montagem

  // Nova função para lidar com a exclusão
  const handleDeletar = (id, nome) => {
    // Pede confirmação antes de deletar
    if (window.confirm(`Tem certeza que quer deletar a receita "${nome}"?`)) {
      console.log("Deletando receita:", id);
      const sucesso = deletarReceita(id);

      if (sucesso) {
        alert(`Receita "${nome}" deletada!`);
        // Atualiza a lista de receitas na tela
        carregarReceitas(); 
      } else {
        alert("Erro ao deletar a receita. Verifique o console.");
      }
    }
  };

  if (isLoading) {
    return <div className="page-container">Carregando seu livro de receitas...</div>;
  }

  return (
    <div className="page-container">
      <h1>Meu Livro de Receitas</h1>
      
      {receitasSalvas.length === 0 ? (
        <p className="busca-mensagem">Você ainda não salvou nenhuma receita.</p>
      ) : (
        <div className="resultados-container">
          {receitasSalvas.map((receita) => (
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
              
              {/* NOVO BOTÃO DE DELETAR */}
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