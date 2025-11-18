// src/services/api.js

// URL DA API BRASILEIRA COM PROXY
const API_URL = 'https://corsproxy.io/?https://api-receitas-pi.vercel.app';

// IMAGEM PADRÃO (Caso a receita não tenha foto)
const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/600px-No_image_available.svg.png";

// DADOS DE BACKUP (Para emergência extrema)
const DADOS_MOCK = [
  {
    idMeal: "101",
    strMeal: "Feijoada Completa (OFFLINE)",
    strCategory: "Brasileira",
    strMealThumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Feijoada_completa.jpg/800px-Feijoada_completa.jpg",
    strSource: "",
    strIngredient1: "Feijão Preto",
    strIngredient2: "Carne Seca"
  },
  {
    idMeal: "102",
    strMeal: "Bolo de Cenoura (OFFLINE)",
    strCategory: "Sobremesa",
    strMealThumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Bolo_de_cenoura.jpg/640px-Bolo_de_cenoura.jpg",
    strSource: "",
    strIngredient1: "Cenoura",
    strIngredient2: "Chocolate"
  }
];

const adaptarReceitaBrasileira = (item) => {
  // Verifica se existe link de imagem e se ele não é vazio
  let imagem = item.link_imagem || item.imagem;
  if (!imagem || imagem.trim() === "") {
    imagem = DEFAULT_IMAGE;
  }

  const receitaAdaptada = {
    idMeal: item._id || item.id || Math.random().toString(),
    strMeal: item.receita || item.nome || "Sem Nome",
    strMealThumb: imagem,
    strCategory: item.categoria || "Diversos",
    strInstructions: item.modo_preparo || "Modo de preparo não disponível.",
    // Se não tiver link original, deixamos vazio para tratar no front
    strSource: item.link_original || "", 
  };

  if (item.ingredientes) {
    const separador = item.ingredientes.includes(';') ? ';' : (item.ingredientes.includes('\n') ? '\n' : ',');
    const listaIngredientes = item.ingredientes.split(separador).map(i => i.trim());
    
    listaIngredientes.forEach((ing, index) => {
      if (index < 20) {
        receitaAdaptada[`strIngredient${index + 1}`] = ing;
        receitaAdaptada[`strMeasure${index + 1}`] = ""; 
      }
    });
  }
  return receitaAdaptada;
};

export const buscarReceitasPorDescricao = async (termo) => {
  if (!termo || termo.trim() === '') return [];

  try {
    const response = await fetch(`${API_URL}/receitas/descricao?descricao=${encodeURIComponent(termo)}`);
    
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const data = await response.json();
    // Aceita formato de array direto ou objeto { items: [...] } ou { receitas: [...] }
    const listaOriginal = Array.isArray(data) ? data : (data.items || data.receitas || []);

    if (listaOriginal.length === 0) return [];

    return listaOriginal.map(adaptarReceitaBrasileira);

  } catch (error) {
    console.error("Erro na API:", error);
    // Se der erro de rede, usa o mock
    const termoLower = termo.toLowerCase();
    const backup = DADOS_MOCK.filter(r => r.strMeal.toLowerCase().includes(termoLower));
    return backup.length > 0 ? backup : DADOS_MOCK;
  }
};

export const buscarReceitaAleatoria = async () => {
  try {
    const response = await fetch(`${API_URL}/receitas/todas`);
    if (!response.ok) throw new Error("Erro HTTP");
    
    const data = await response.json();
    const lista = Array.isArray(data) ? data : (data.items || data.receitas || []);
    
    if (lista.length === 0) throw new Error("Lista vazia");

    const itemAleatorio = lista[Math.floor(Math.random() * lista.length)];
    return adaptarReceitaBrasileira(itemAleatorio);

  } catch (error) {
    console.error("Erro na aleatória:", error);
    return DADOS_MOCK[0];
  }
};