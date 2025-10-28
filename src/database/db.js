import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

// Esta variável 'db' vai guardar nossa conexão com o banco
let db;

/**
 * Inicializa o banco de dados SQLite no navegador.
 * Cria a tabela 'receitas' se ela não existir.
 */
export const initDb = async () => {
  try {
    console.log('Carregando o módulo SQLite WASM...');
    
    // Chama a função de inicialização para carregar o módulo
    const sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });
    
    console.log('Módulo SQLite carregado. Abrindo o banco de dados...');

    // Tenta abrir o banco de dados usando o 'opfs' (Origin Private File System)
    db = new sqlite3.oo1.OpfsDb('/receitas-na-mao.db', 'c');
    
    console.log('Banco de dados aberto com sucesso (OPFS):', db.filename);

    // CRIAÇÃO DA TABELA
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS receitas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        imagemUrl TEXT,
        categoria TEXT,
        instrucoes TEXT,
        urlOriginal TEXT
      );
    `;
    
    db.exec(createTableSql);
    
    console.log('Tabela "receitas" verificada/criada com sucesso (OPFS).');

  } catch (err) {
    console.error('Erro ao inicializar o banco de dados (OPFS):', err.message);
    
    // Fallback para 'localStorage' se o OPFS falhar
    if (!db) {
      try {
        console.warn('OPFS falhou. Tentando fallback para localStorage...');
        const sqlite3 = await sqlite3InitModule(); 
        db = new sqlite3.oo1.JsStorageDb('local', 'c');
        console.log('Banco de dados aberto com sucesso via localStorage.');
        
        const createTableSql = `
          CREATE TABLE IF NOT EXISTS receitas (
            id TEXT PRIMARY KEY, nome TEXT NOT NULL, imagemUrl TEXT, 
            categoria TEXT, instrucoes TEXT, urlOriginal TEXT
          );
        `;
        db.exec(createTableSql);
        console.log('Tabela "receitas" verificada/criada com sucesso (localStorage).');
      } catch (fallbackErr) {
        console.error('Falha total ao inicializar o banco de dados:', fallbackErr.message);
      }
    }
  }
};

/**
 * (CREATE) Adiciona uma nova receita ao banco de dados.
 */
export const salvarReceita = (receita) => {
  if (!db) {
    console.error("Banco de dados não inicializado. Não é possível salvar.");
    return false;
  }

  try {
    const insertSql = `
      INSERT INTO receitas (id, nome, imagemUrl, categoria, instrucoes, urlOriginal)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nome=excluded.nome,
        imagemUrl=excluded.imagemUrl,
        categoria=excluded.categoria,
        instrucoes=excluded.instrucoes,
        urlOriginal=excluded.urlOriginal;
    `;
    
    db.exec(insertSql, {
      bind: [
        receita.idMeal,
        receita.strMeal,
        receita.strMealThumb,
        receita.strCategory,
        receita.strInstructions,
        receita.strSource
      ]
    });

    console.log(`Receita "${receita.strMeal}" salva com sucesso!`);
    return true;
    
  } catch (err) {
    console.error("Erro ao salvar receita:", err.message);
    return false;
  }
};

/**
 * (READ) Busca todas as receitas salvas no banco de dados.
 */
export const getReceitasSalvas = () => {
  if (!db) {
    console.error("Banco de dados não inicializado. Não é possível ler.");
    return [];
  }

  try {
    const selectSql = "SELECT * FROM receitas";
    const receitas = db.exec(selectSql, { rowMode: 'object' });
    
    console.log("Receitas lidas do banco:", receitas);
    return receitas;

  } catch (err) {
    console.error("Erro ao ler receitas:", err.message);
    return [];
  }
};

/**
 * (DELETE) Deleta uma receita do banco de dados pelo ID.
 */
export const deletarReceita = (id) => {
  if (!db) {
    console.error("Banco de dados não inicializado. Não é possível deletar.");
    return false;
  }

  try {
    const deleteSql = "DELETE FROM receitas WHERE id = ?";
    
    db.exec(deleteSql, {
      bind: [id]
    });

    console.log(`Receita com ID "${id}" deletada com sucesso!`);
    return true; // Retorna sucesso

  } catch (err) {
    console.error("Erro ao deletar receita:", err.message);
    return false; // Retorna falha
  }
};