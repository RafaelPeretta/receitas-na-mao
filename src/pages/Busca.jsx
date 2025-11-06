import React, { useState } from 'react';
import { buscarReceitasPorDescricao } from '../services/api'; 
import { salvarReceita } from '../database/db'; 
import toast from 'react-hot-toast'; // 1. IMPORTAR O 'toast'
import './Busca.css'; 

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
    console.log("Salvando receita:", receita.strMeal);
    const sucesso = salvarReceita(receita); 

    // 2. SUBSTITUIR O 'alert()'
    if (sucesso) {
      // toast.success para notificação verde
      toast.success(`Receita "${receita.strMeal}" salva!`);
    } else {
      // toast.error para notificação vermelha
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
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {mensagem && <p className="busca-mensagem">{mensagem}</p>}

      <div className="resultados-container">
        {receitas.map((receita) => (
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
    </div>
  );
};

export default Busca;