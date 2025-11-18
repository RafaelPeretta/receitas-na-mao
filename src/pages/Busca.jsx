import React, { useState } from 'react';
import { buscarReceitasPorDescricao } from '../services/api'; 
import { salvarReceita } from '../database/db'; 
import toast from 'react-hot-toast'; 
import './Busca.css'; 
import LoadingSpinner from '../components/LoadingSpinner';

const Busca = () => {
  const [termo, setTermo] = useState('');
  const [receitas, setReceitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleBuscar = async () => {
    if (termo.trim() === '') return;
    
    setIsLoading(true);
    setReceitas([]);
    setMensagem('');
    
    try {
      const resultados = await buscarReceitasPorDescricao(termo);
      if (resultados.length > 0) {
        setReceitas(resultados);
      } else {
        setMensagem('Nenhuma receita encontrada para este termo.');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalvarReceita = (receita) => {
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
          placeholder="Digite o nome do prato (ex: Bolo, Frango)"
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

      {isLoading && <LoadingSpinner message="Buscando receitas..." />}

      {!isLoading && mensagem && (
        <div className="estado-vazio-container">
          <p className="busca-mensagem">{mensagem}</p>
        </div>
      )}

      {!isLoading && !mensagem && (
        <div className="resultados-container">
          {receitas.map((receita) => (
            <div key={receita.idMeal} className="receita-card">
              <img 
                src={receita.strMealThumb} 
                alt={receita.strMeal} 
                className="receita-imagem"
                // crossOrigin removido para evitar erros com imagens externas
              />
              <h3 className="receita-titulo">{receita.strMeal}</h3>
              <p className="receita-ingredientes">
                <strong>Ingredientes:</strong> 
                {receita.strIngredient1}, {receita.strIngredient2}, {receita.strIngredient3}...
              </p>
              
              {/* Lógica Condicional para o Link */}
              {receita.strSource && receita.strSource.trim() !== "" ? (
                <a href={receita.strSource} target="_blank" rel="noopener noreferrer">
                  Ver receita original
                </a>
              ) : (
                <span style={{ color: '#999', fontSize: '14px' }}>Fonte indisponível</span>
              )}

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