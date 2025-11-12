import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReceitaPorId, updateReceita } from '../database/db';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import './EditarReceita.css'; // Vamos criar este CSS

const EditarReceita = () => {
  const { receitaId } = useParams(); // Pega o ':receitaId' da URL
  const navigate = useNavigate(); // Para navegar de volta
  
  const [receita, setReceita] = useState(null);
  const [nome, setNome] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carrega os dados da receita (agora com async/await)
  useEffect(() => {
    const carregarDados = async () => {
      if (receitaId) {
        try {
          const dadosReceita = await getReceitaPorId(receitaId);
          if (dadosReceita) {
            setReceita(dadosReceita);
            setNome(dadosReceita.nome);
            setInstrucoes(dadosReceita.instrucoes || ''); // Usa string vazia se for null
          } else {
            toast.error("Receita não encontrada.");
            navigate('/meu-livro');
          }
        } catch (error) {
          toast.error("Erro ao carregar a receita.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    carregarDados();
  }, [receitaId, navigate]);

  // 2. Função para salvar as mudanças (agora com async/await)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    try {
      await updateReceita(receitaId, nome, instrucoes);
      toast.success('Receita atualizada com sucesso!');
      navigate('/meu-livro'); // Navega de volta para o Livro de Receitas
    } catch (error) {
      toast.error('Erro ao atualizar a receita.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSpinner message="Carregando receita para edição..." />
      </div>
    );
  }

  if (!receita) {
    return (
      <div className="page-container">
        <p>Receita não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Editar Receita: {receita.nome}</h1>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Receita</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="instrucoes">Instruções</label>
          <textarea
            id="instrucoes"
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            className="form-textarea"
            rows={15}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="form-button-salvar">
            Salvar Alterações
          </button>
          <button 
            type="button" 
            className="form-button-cancelar"
            onClick={() => navigate('/meu-livro')} // Volta sem salvar
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarReceita;