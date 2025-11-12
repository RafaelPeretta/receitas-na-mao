import React, { useState, useEffect } from 'react';
import './Planejador.css';
import { getReceitasSalvas } from '../database/db';
// 1. IMPORTAR O DND (Drag-and-Drop)
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LoadingSpinner from '../components/LoadingSpinner';

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Função helper para criar o estado inicial do planejador (14 slots vazios)
const criarSlotsVazios = () => {
  const slots = {};
  DIAS_SEMANA.forEach(dia => {
    slots[`${dia}-almoco`] = null; // Um slot para Almoço
    slots[`${dia}-jantar`] = null; // Um slot para Jantar
  });
  return slots;
};

const Planejador = () => {
  const [receitasSalvas, setReceitasSalvas] = useState([]); // A lista da direita
  const [plannedMeals, setPlannedMeals] = useState(criarSlotsVazios()); // O calendário da esquerda
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Carregar as receitas salvas do banco
  useEffect(() => {
    const carregarReceitas = async () => {
      setIsDbLoading(true);
      try {
        const receitas = await getReceitasSalvas();
        setReceitasSalvas(receitas);
      } catch (error) {
        console.error("Erro ao carregar receitas salvas:", error);
      } finally {
        setIsDbLoading(false);
      }
    };
    carregarReceitas();
  }, []);

  // 2. FUNÇÃO PRINCIPAL DO DRAG-AND-DROP
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Se o usuário soltou fora de uma área válida (destination é null)
    if (!destination) {
      return;
    }

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // 1. ARRASTAR DA LISTA DE RECEITAS (Sidebar) -> PARA O CALENDÁRIO
    if (sourceId === 'receitas-list' && (destId.includes('-almoco') || destId.includes('-jantar'))) {
      // Encontra a receita que foi arrastada
      const receitaCopiada = receitasSalvas.find(r => r.id === draggableId);
      
      // Atualiza o estado do calendário
      setPlannedMeals(prev => ({
        ...prev,
        [destId]: { ...receitaCopiada } // Copia a receita para o slot
      }));
      return; // Termina a função
    }

    // 2. MOVER DE UM SLOT DO CALENDÁRIO -> PARA OUTRO SLOT
    if (sourceId.includes('-') && destId.includes('-')) {
      setPlannedMeals(prev => {
        const novosSlots = { ...prev };
        // Pega a receita do slot de origem
        const receitaMovida = novosSlots[sourceId];
        // Limpa o slot de origem
        novosSlots[sourceId] = null;
        // Coloca no slot de destino
        novosSlots[destId] = receitaMovida;
        return novosSlots;
      });
      return; // Termina a função
    }

    // 3. REMOVER (Arrastar do Calendário -> Lixeira)
    if (sourceId.includes('-') && destId === 'lixeira') {
      setPlannedMeals(prev => ({
        ...prev,
        [sourceId]: null // Limpa o slot de origem
      }));
      return; // Termina a função
    }
  };

  return (
    <div className="page-container">
      <h1>Planejador Semanal (Meal Planner)</h1>
      <p>Arraste suas receitas salvas da lista ao lado para o calendário.</p>

      {/* 3. ENVOLVER TUDO NO CONTEXTO DO DND */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="planner-layout">
          
          {/* Coluna 1: O Calendário Semanal */}
          <div className="calendario-semanal">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="dia-card">
                <h3 className="dia-titulo">{dia}</h3>
                
                {/* Slot Almoço */}
                <SlotRefeicao dia={dia} tipo="almoco" receita={plannedMeals[`${dia}-almoco`]} />
                
                {/* Slot Jantar */}
                <SlotRefeicao dia={dia} tipo="jantar" receita={plannedMeals[`${dia}-jantar`]} />
              </div>
            ))}
          </div>

          {/* Coluna 2: A Lista de Receitas Salvas (Fonte) */}
          <div className="lista-receitas-salvas">
            <h3 className="lista-titulo">Seu Livro de Receitas</h3>
            
            {/* 4. DEFINIR A ÁREA "DROPPABLE" DA LISTA */}
            <Droppable droppableId="receitas-list" isDropDisabled={true}>
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="receitas-scroll-container"
                >
                  {isDbLoading ? <LoadingSpinner message="Carregando..." size="30px" /> :
                    receitasSalvas.map((receita, index) => (
                      // 5. DEFINIR CADA RECEITA COMO "DRAGGABLE"
                      <Draggable key={receita.id} draggableId={receita.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps} // O "puxador"
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
                  }
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            
            {/* 6. A LIXEIRA (Área de Drop para deletar) */}
            <Droppable droppableId="lixeira">
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  className={`lixeira-drop-zone ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                >
                  Arraste uma receita aqui para remover do plano
                </div>
              )}
            </Droppable>

          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

// Componente helper para os slots (Almoço/Jantar)
const SlotRefeicao = ({ dia, tipo, receita }) => {
  const slotId = `${dia}-${tipo}`;
  
  return (
    <div className="refeicao-slot">
      <span className="refeicao-label">{tipo === 'almoco' ? 'Almoço' : 'Jantar'}</span>
      
      {/* 7. DEFINIR CADA SLOT COMO "DROPPABLE" */}
      <Droppable droppableId={slotId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`drop-zone ${snapshot.isDraggingOver ? 'is-over' : ''}`}
          >
            {receita ? (
              // 8. SE TIVER RECEITA, ELA É "DRAGGABLE"
              // Usamos o ID da receita + slotId para um ID único de draggable
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
              !snapshot.isDraggingOver && <span className="drop-zone-vazio">(Vazio)</span>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Planejador;