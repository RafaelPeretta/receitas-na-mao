import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db;

// Função helper para gerar os nomes das colunas de Ingredientes/Medidas
const getIngredientColumns = () => {
    let cols = '';
    for (let i = 1; i <= 20; i++) {
        cols += `ingr${i} TEXT, meas${i} TEXT, `;
    }
    return cols; 
};

export const initDb = async () => {
  try {
    console.log('Módulo SQLite carregado. Abrindo o banco de dados...');
    const sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });
    
    db = new sqlite3.oo1.OpfsDb('/receitas-na-mao.db', 'c');
    console.log('Banco de dados aberto com sucesso (OPFS):', db.filename);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS receitas (
        id TEXT PRIMARY KEY NOT NULL,
        nome TEXT NOT NULL,
        imagemUrl TEXT,
        categoria TEXT,
        instrucoes TEXT,
        urlOriginal TEXT,
        ${getIngredientColumns()} 
        UNIQUE(id)
      );
    `;
    db.exec(createTableSql);
    console.log('Tabela "receitas" verificada/criada com sucesso (OPFS).');

  } catch (err) {
    console.error('Erro ao inicializar o banco de dados (OPFS):', err.message);
    if (!db) {
      try {
        console.warn('OPFS falhou. Tentando fallback para localStorage...');
        const sqlite3 = await sqlite3InitModule(); 
        db = new sqlite3.oo1.JsStorageDb('local', 'c');
        
        const createTableSql = `
          CREATE TABLE IF NOT EXISTS receitas (
            id TEXT PRIMARY KEY, nome TEXT NOT NULL, imagemUrl TEXT, 
            categoria TEXT, instrucoes TEXT, urlOriginal TEXT,
            ${getIngredientColumns()} 
            UNIQUE(id)
          );
        `;
        db.exec(createTableSql);
        console.log('Banco de dados aberto com sucesso via localStorage.');
      } catch (fallbackErr) {
        console.error('Falha total ao inicializar o banco de dados:', fallbackErr.message);
      }
    }
  }
};

export const salvarReceita = (receita) => {
  if (!db) {
    console.error("Banco de dados não inicializado. Não é possível salvar.");
    return false;
  }
  try {
    // Constrói as colunas e os parâmetros dinamicamente
    let colNames = ['id', 'nome', 'imagemUrl', 'categoria', 'instrucoes', 'urlOriginal'];
    let values = [
        receita.idMeal, receita.strMeal, receita.strMealThumb,
        receita.strCategory, receita.strInstructions, receita.strSource
    ];
    let placeholders = ['?', '?', '?', '?', '?', '?'];
    let updateSet = [
        'nome=excluded.nome', 'imagemUrl=excluded.imagemUrl', 
        'categoria=excluded.categoria', 'instrucoes=excluded.instrucoes', 
        'urlOriginal=excluded.urlOriginal'
    ];

    for (let i = 1; i <= 20; i++) {
        const ingrKey = `strIngredient${i}`;
        const measKey = `strMeasure${i}`;
        const colIngr = `ingr${i}`;
        const colMeas = `meas${i}`;

        colNames.push(colIngr, colMeas);
        placeholders.push('?', '?');
        updateSet.push(`${colIngr}=excluded.${colIngr}`, `${colMeas}=excluded.${colMeas}`);
        
        values.push(receita[ingrKey] || '', receita[measKey] || '');
    }

    const insertSql = `
      INSERT INTO receitas (${colNames.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT(id) DO UPDATE SET
        ${updateSet.join(', ')}
      ;
    `;
    
    db.exec(insertSql, { bind: values });
    console.log(`Receita "${receita.strMeal}" salva com sucesso!`);
    return true;
  } catch (err) {
    console.error("Erro ao salvar receita:", err.message);
    return false;
  }
};

// AS FUNÇÕES ABAIXO ESTAVAM FALTANDO NA ÚLTIMA VERSÃO

export const getReceitasSalvas = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("Banco de dados não inicializado.");
      // Retorna array vazio em vez de rejeitar para não crashar a UI
      return resolve([]); 
    }
    try {
      const selectSql = "SELECT * FROM receitas";
      const receitas = db.exec(selectSql, { rowMode: 'object' });
      console.log("Receitas lidas do banco:", receitas);
      resolve(receitas); 
    } catch (err) {
      console.error("Erro ao ler receitas:", err.message);
      reject(err);
    }
  });
};

export const deletarReceita = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Banco de dados não inicializado."));
    try {
      const deleteSql = "DELETE FROM receitas WHERE id = ?";
      db.exec(deleteSql, { bind: [id] });
      console.log(`Receita com ID "${id}" deletada com sucesso!`);
      resolve(true);
    } catch (err) {
      console.error("Erro ao deletar receita:", err.message);
      reject(err);
    }
  });
};

export const getReceitaPorId = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Banco de dados não inicializado."));
    try {
      const selectSql = "SELECT * FROM receitas WHERE id = ?";
      const receita = db.selectObject(selectSql, [id]);
      resolve(receita);
    } catch (err) {
      console.error("Erro ao ler receita por ID:", err.message);
      reject(err);
    }
  });
};

export const updateReceita = (id, nome, instrucoes) => {
   return new Promise((resolve, reject) => {
    if (!db) return reject(new Error("Banco de dados não inicializado."));
    try {
      const updateSql = "UPDATE receitas SET nome = ?, instrucoes = ? WHERE id = ?";
      db.exec(updateSql, { bind: [nome, instrucoes, id] });
      console.log(`Receita com ID "${id}" atualizada com sucesso!`);
      resolve(true);
    } catch (err) {
      console.error("Erro ao atualizar receita:", err.message);
      reject(err);
    }
  });
};