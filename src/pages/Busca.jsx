import React, { useState } from 'react';
import { buscarReceitasPorDescricao } from '../services/api'; 
import { salvarReceita } from '../database/db'; 
import toast from 'react-hot-toast'; 
import './Busca.css'; 

// 1. IMPORTAR O NOVO COMPONENTE
import LoadingSpinner from '../components/LoadingSpinner';

const Busca = () => {
  const [termo, setTermo] = useState('');
  const [receitas, setReceitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleBuscar = async () => {
    setIsLoading(true);
    setReceitas([]);
    setMensagem('');
    const resultados = await buscarReceitasPorDescricao(termo);
    if (resultados.length > 0) {
      setReceitas(resultados);
    } else {
      setMensagem('Nenhuma receita encontrada para este termo.');
    }
    setIsLoading(false);
  };

  const handleSalvarReceita = (receita) => {
    // ... (função salvar continua a mesma) ...
    console.log("Salvando receita:", receita.strMeal);
    const sucesso = salvarReceita(receita); 
    if (sucesso) {
      toast.success(`Receita "${receita.strMeal}" salva!`);
    } else {
      toast.error("Erro ao salvar a receita.");
    }
  };

  return (
    <div className="page-container"> 
      <h1>Busque sua Receita</h1>
      <p>Encontre receitas deliciosas do mundo todo.</p>
      
      <div className="busca-input-container">
        <input 
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)} 
          placeholder="Digite o nome do prato (ex: Feijoada, Chicken)"
          className="busca-input"
        />
        <button 
          onClick={handleBuscar} 
          disabled={isLoading}
          className="busca-button"
        >
          {/* 2. MUDANÇA: Mostra 'Buscando...' no botão, mas o spinner aparecerá abaixo */}
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* 3. SUBSTITUIR o texto de 'Carregando' pelo Spinner */}
      {isLoading && <LoadingSpinner message="Buscando receitas..." />}

      {/* 4. SUBSTITUIR o texto de 'Mensagem' por um componente mais visual (Estado Vazio) */}
      {!isLoading && mensagem && (
        <div className="estado-vazio-container">
          {/* (Poderíamos adicionar um ícone de "não encontrado" aqui) */}
          <p className="busca-mensagem">{mensagem}</p>
        </div>
      )}

      {/* O container de resultados não é mostrado se estiver carregando ou tiver mensagem */}
      {!isLoading && !mensagem && (
        <div className="resultados-container">
          {receitas.map((receita) => (
            // ... (o card da receita continua o mesmo) ...
            <div key={receita.idMeal} className="receita-card">
              <img 
                src={receita.strMealThumb} 
                alt={receita.strMeal} 
                className="receita-imagem" 
                crossOrigin="anonymous"
              />
              <h3 className="receita-titulo">{receita.strMeal}</h3>
              <p className="receita-ingredientes">
                <strong>Ingredientes:</strong> 
                {receita.strIngredient1}, {receita.strIngredient2}, {receita.strIngredient3} ...
              </p>
              <a href={receita.strSource} target="_blank" rel="noopener noreferrer">
                Ver receita original
              </a>
              <button
                onClick={() => handleSalvarReceita(receita)}
                className="salvar-button"
              >
                Salvar no meu Livro
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Busca;