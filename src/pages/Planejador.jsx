import React, { useState, useEffect } from 'react';
import './Planejador.css';
import { getReceitasSalvas } from '../database/db';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast'; 

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const criarSlotsVazios = () => {
  const slots = {};
  DIAS_SEMANA.forEach(dia => {
    slots[`${dia}-almoco`] = null; 
    slots[`${dia}-jantar`] = null;
  });
  return slots;
};

// Componente helper para os slots (Almoço/Jantar)
function SlotRefeicao({ dia, tipo, receita }) { 
  const slotId = `${dia}-${tipo}`;
  
  return (
    <div className="refeicao-slot">
      <span className="refeicao-label">{tipo === 'almoco' ? 'Almoço' : 'Jantar'}</span>
      
      <Droppable 
        droppableId={slotId} 
        isDropDisabled={false} 
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      > 
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`drop-zone ${snapshot.isDraggingOver ? 'is-over' : ''}`}
          >
            {receita ? (
              <Draggable draggableId={`${receita.id}-${slotId}`} index={0}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`receita-drag-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                  >
                    <img src={receita.imagemUrl} alt={receita.nome} className="receita-drag-imagem" crossOrigin="anonymous" />
                    <span className="receita-drag-nome">{receita.nome}</span>
                  </div>
                )}
              </Draggable>
            ) : (
              // Se vazio, mostra o placeholder
              !snapshot.isDraggingOver && <span className="drop-zone-vazio">+</span>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

const Planejador = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState(criarSlotsVazios());
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [showListaCompras, setShowListaCompras] = useState(false);
  const [listaIngredientes, setListaIngredientes] = useState([]);

  useEffect(() => {
    const carregarReceitas = async () => {
      setIsDbLoading(true);
      try {
        const receitas = await getReceitasSalvas();
        setReceitasSalvas(receitas);
      } catch (error) {
        console.error("Erro ao buscar receitas salvas:", error);
      } finally {
        setIsDbLoading(false);
      }
    };
    carregarReceitas();
  }, []);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    if (sourceId === 'receitas-list' && (destId.includes('-almoco') || destId.includes('-jantar'))) {
      const receitaCopiada = receitasSalvas.find(r => r.id === draggableId);
      setPlannedMeals(prev => ({ ...prev, [destId]: { ...receitaCopiada } }));
      return;
    }

    if (sourceId.includes('-') && destId.includes('-')) {
      setPlannedMeals(prev => {
        const novosSlots = { ...prev };
        const receitaMovida = novosSlots[sourceId];
        novosSlots[sourceId] = null;
        novosSlots[destId] = receitaMovida;
        return novosSlots;
      });
      return;
    }

    if (sourceId.includes('-') && destId === 'lixeira') {
      setPlannedMeals(prev => ({ ...prev, [sourceId]: null }));
      return;
    }
  };

  // **** FUNÇÃO CORRIGIDA ****
  const gerarListaCompras = () => {
    const receitasNoPlano = Object.values(plannedMeals).filter(r => r !== null);
    
    if (receitasNoPlano.length === 0) {
      toast.error("Adicione receitas ao calendário primeiro!");
      return;
    }

    const listaFinal = [];

    receitasNoPlano.forEach(receita => {
      const ingredientesDaReceita = [];
      // Loop para ler as 20 colunas possíveis
      for (let i = 1; i <= 20; i++) {
        // Lógica Híbrida: Tenta ler do formato do Banco (ingr1) OU do formato da API (strIngredient1)
        // Isso garante que funcione para receitas antigas e novas
        const ingrediente = receita[`ingr${i}`] || receita[`strIngredient${i}`];
        const medida = receita[`meas${i}`] || receita[`strMeasure${i}`];
        
        if (ingrediente && ingrediente.trim() !== "") {
          ingredientesDaReceita.push(`${medida ? medida : ''} ${ingrediente}`);
        }
      }
      
      if (ingredientesDaReceita.length > 0) {
        listaFinal.push({
          nomeReceita: receita.nome || receita.strMeal,
          ingredientes: ingredientesDaReceita
        });
      }
    });

    setListaIngredientes(listaFinal);
    setShowListaCompras(true);
  };

  return (
    <div className="page-container">
      {/* --- BOTÃO DE COMPRAS E TÍTULO --- */}
      <div className="planejador-header">
        <h1>Planejador Semanal (Meal Planner)</h1>
        <button className="btn-gerar-lista" onClick={gerarListaCompras}>
          🛒 Gerar Lista de Compras
        </button>
      </div>
      
      <p>Arraste suas receitas salvas da lista ao lado para o calendário.</p>

      {isDbLoading && <LoadingSpinner message="Carregando receitas..." />}

      <DragDropContext onDragEnd={onDragEnd}>
        {/* 1. LAYOUT PRINCIPAL */}
        <div className="planner-layout">
          
          {/* Coluna 1: O Calendário Semanal */}
          <div className="calendario-semanal">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="dia-card">
                <h3 className="dia-titulo">{dia}</h3>
                
                {/* Slots */}
                <SlotRefeicao dia={dia} tipo="almoco" receita={plannedMeals[`${dia}-almoco`]} />
                <SlotRefeicao dia={dia} tipo="jantar" receita={plannedMeals[`${dia}-jantar`]} />
              </div>
            ))}
          </div>

          {/* Coluna 2: A Lista de Receitas Salvas (Fonte) */}
          <div className="lista-receitas-salvas">
            <h3 className="lista-titulo">Seu Livro de Receitas</h3>
            
            <Droppable 
              droppableId="receitas-list" 
              isDropDisabled={true} 
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="receitas-scroll-container"
                >
                  {isDbLoading ? <div style={{height: 100}} /> :
                    receitasSalvas.length === 0 ? (
                      <p className="no-recipes-msg">Nenhuma receita salva para arrastar.</p>
                    ) : (
                      receitasSalvas.map((receita, index) => (
                        <Draggable key={receita.id} draggableId={receita.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`receita-drag-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            >
                              <img 
                                src={receita.imagemUrl} 
                                alt={receita.nome} 
                                className="receita-drag-imagem" 
                                crossOrigin="anonymous" 
                              />
                              <span className="receita-drag-nome">{receita.nome}</span>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )
                  }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            {/* LIXEIRA */}
            <Droppable 
              droppableId="lixeira" 
              isDropDisabled={false} 
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`lixeira-drop-zone ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                >
                  🗑️ Arraste aqui para remover
                </div>
              )}
            </Droppable>

          </div>
        </div>
      </DragDropContext>

      {/* **** MODAL DA LISTA DE COMPRAS **** */}
      {showListaCompras && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sua Lista de Compras</h2>
              <button className="btn-close" onClick={() => setShowListaCompras(false)}>×</button>
            </div>
            <div className="modal-body">
              {listaIngredientes.map((item, index) => (
                <div key={index} className="lista-grupo">
                  <h4 className="lista-grupo-titulo">{item.nomeReceita}</h4>
                  <ul className="lista-itens">
                    {item.ingredientes.map((ing, i) => (
                      <li key={i}>
                        <label>
                          <input type="checkbox" /> {ing}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => window.print()}>Imprimir Lista</button>
              <button className="btn-primary" onClick={() => setShowListaCompras(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Planejador;