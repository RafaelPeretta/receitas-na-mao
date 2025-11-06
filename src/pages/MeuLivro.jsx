import React, { useState, useEffect } from 'react';
import { getReceitasSalvas, deletarReceita } from '../database/db';
import toast from 'react-hot-toast'; 
import './Busca.css'; 

const MeuLivro = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // A função de carregar continua a mesma
  const carregarReceitas = () => {
    setIsLoading(true);
    const receitas = getReceitasSalvas();
    setReceitasSalvas(receitas);
    setIsLoading(false);
  };

  useEffect(() => {
    carregarReceitas();
  }, []); 

  // **** FUNÇÃO handleDeletar ATUALIZADA ****
  const handleDeletar = (id, nome) => {
    if (window.confirm(`Tem certeza que quer deletar a receita "${nome}"?`)) {
      
      // 1. ATUALIZAÇÃO OTIMISTA: Remove a receita do estado IMEDIATAMENTE.
      // O 'filter' cria um novo array com todas as receitas, exceto a que tem o ID que queremos deletar.
      setReceitasSalvas(receitasAtuais => 
        receitasAtuais.filter(receita => receita.id !== id)
      );

      // 2. TAREFA EM SEGUNDO PLANO: Agora, deletamos do banco.
      // Não precisamos mais verificar o 'sucesso' para atualizar a UI.
      const sucesso = deletarReceita(id);

      // 3. Damos o feedback
      if (sucesso) {
        toast.success(`Receita "${nome}" deletada!`);
        // Não precisamos mais chamar carregarReceitas() aqui
      } else {
        toast.error("Erro ao deletar a receita.");
        // Se deu erro, recarregamos do banco para "desfazer" a exclusão otimista.
        carregarReceitas(); 
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
              
              <button
                // O onClick continua o mesmo
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