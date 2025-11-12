import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db;

export const initDb = async () => {
  try {
    console.log('Carregando o módulo SQLite WASM...');
    const sqlite3 = await sqlite3InitModule({
      print: console.log,
      printErr: console.error,
    });
    console.log('Módulo SQLite carregado. Abrindo o banco de dados...');
    
    // Tenta abrir via OPFS
    db = new sqlite3.oo1.OpfsDb('/receitas-na-mao.db', 'c');
    console.log('Banco de dados aberto com sucesso (OPFS):', db.filename);

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS receitas (
        id TEXT PRIMARY KEY NOT NULL,
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

// **** FUNÇÃO ATUALIZADA (Agora retorna Promise) ****
/**
 * (READ) Busca todas as receitas salvas no banco de dados.
 */
export const getReceitasSalvas = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("Banco de dados não inicializado.");
      return reject(new Error("Banco de dados não inicializado."));
    }
    try {
      const selectSql = "SELECT * FROM receitas";
      const receitas = db.exec(selectSql, { rowMode: 'object' });
      console.log("Receitas lidas do banco:", receitas);
      resolve(receitas); // Resolve a promessa com os dados
    } catch (err) {
      console.error("Erro ao ler receitas:", err.message);
      reject(err);
    }
  });
};

// **** FUNÇÃO ATUALIZADA (Agora retorna Promise) ****
/**
 * (DELETE) Deleta uma receita do banco de dados pelo ID.
 */
export const deletarReceita = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("Banco de dados não inicializado.");
      return reject(new Error("Banco de dados não inicializado."));
    }
    try {
      const deleteSql = "DELETE FROM receitas WHERE id = ?";
      db.exec(deleteSql, { bind: [id] });
      console.log(`Receita com ID "${id}" deletada com sucesso!`);
      resolve(true); // Resolve a promessa com sucesso
    } catch (err) {
      console.error("Erro ao deletar receita:", err.message);
      reject(err);
    }
  });
};

// **** FUNÇÃO ATUALIZADA (Agora retorna Promise) ****
/**
 * (READ) Busca UMA receita salva pelo ID.
 */
export const getReceitaPorId = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("Banco de dados não inicializado.");
      return reject(new Error("Banco de dados não inicializado."));
    }
    try {
      const selectSql = "SELECT * FROM receitas WHERE id = ?";
      const receita = db.selectObject(selectSql, [id]);
      console.log(`Receita com ID "${id}" lida do banco:`, receita);
      resolve(receita); // Resolve com a receita (ou undefined)
    } catch (err) {
      console.error("Erro ao ler receita por ID:", err.message);
      reject(err);
    }
  });
};

// **** FUNÇÃO ATUALIZADA (Agora retorna Promise) ****
/**
 * (UPDATE) Atualiza uma receita no banco de dados.
 */
export const updateReceita = (id, nome, instrucoes) => {
   return new Promise((resolve, reject) => {
    if (!db) {
      console.error("Banco de dados não inicializado.");
      return reject(new Error("Banco de dados não inicializado."));
    }
    try {
      const updateSql = "UPDATE receitas SET nome = ?, instrucoes = ? WHERE id = ?";
      db.exec(updateSql, {
        bind: [nome, instrucoes, id]
      });
      console.log(`Receita com ID "${id}" atualizada com sucesso!`);
      resolve(true); // Resolve com sucesso
    } catch (err) {
      console.error("Erro ao atualizar receita:", err.message);
      reject(err);
    }
  });
};