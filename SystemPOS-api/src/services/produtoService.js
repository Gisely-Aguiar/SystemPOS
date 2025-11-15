import database from '../repository/mysql.js';

// ----------------------------------------------------------------------
// CREATE PRODUTO
// ----------------------------------------------------------------------
async function createProd(
  nome, marca, codBarras, codEmpresa, codProduto,
  tipo, modelo, categoria, preco, estMin, estMax, urlUpload
) {
  const sql = `
    INSERT INTO cadastro_produto (
      nome, marca, codigo_barras, empresa_id, codigo_produto,
      tipo_produto, modelo, categoria, preco, estoque_min,
      estoque_max, imagem
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    nome, marca, codBarras, codEmpresa, codProduto,
    tipo, modelo, categoria, preco, estMin, estMax, urlUpload
  ];

  const conn = await database.connectDB();
  const [result] = await conn.query(sql, params);
  conn.end();

  return { id_produto: result.insertId };
}

// ----------------------------------------------------------------------
// CREATE LOTE
// ----------------------------------------------------------------------
async function createLote(produtoId, numeroLote, dataValidade, quantidade) {
  const sql = `
    INSERT INTO lote_produto (produto_id, numero_lote, data_validade, quantidade, ativo)
    VALUES (?, ?, ?, ?, 1)
  `;

  const conn = await database.connectDB();
  await conn.query(sql, [produtoId, numeroLote, dataValidade, quantidade]);
  conn.end();
}

// ----------------------------------------------------------------------
// UPDATE PRODUTO COMPLETO
// ----------------------------------------------------------------------
async function updateProd(nome, marca, codBarras, tipo, modelo, categoria, preco, estMin, estMax, urlUpload, dataExclusao, ativo, id) {
  const sql = `
    UPDATE cadastro_produto
        SET nome = ?, marca = ?, codigo_barras = ?, tipo_produto = ?, modelo = ?,
        categoria = ?, preco = ?, estoque_min = ?, estoque_max = ?, imagem = ?,
        data_exclusao = ?, ativo = ?
    WHERE codigo_produto = ?
  `;

  const params = [
    nome, marca, codBarras, tipo, modelo,
    categoria, preco, estMin, estMax, urlUpload,
    dataExclusao, ativo, id
  ];

  const conn = await database.connectDB();
  await conn.query(sql, params);
  conn.end();
}

// ----------------------------------------------------------------------
// UPDATE PREÇO
// ----------------------------------------------------------------------
async function updateProdAP(preco, id) {
  const conn = await database.connectDB();
  await conn.query("UPDATE cadastro_produto SET preco = ? WHERE id = ? AND ativo = 1", [preco, id]);
  conn.end();
}

// ----------------------------------------------------------------------
// UPDATE ESTOQUE LOTE (VENDA)
// ----------------------------------------------------------------------
async function updateProdVE(quantidade, loteId) {
  const sql = `
    UPDATE lote_produto
        SET quantidade = quantidade - ?
    WHERE id = ? AND quantidade >= ? AND ativo = 1
  `;

  const conn = await database.connectDB();
  await conn.query(sql, [quantidade, loteId, quantidade]);
  conn.end();
}

// ----------------------------------------------------------------------
// LISTAGENS
// ----------------------------------------------------------------------

async function listProd(codEmpresa) {
  const sql = `
    SELECT 
      p.*,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total,
      MIN(IF(l.ativo = 1, l.data_validade, NULL)) AS validade_proxima
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
    ORDER BY p.nome ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa]);
  conn.end();
  return rows;
}

async function listProdVali(codEmpresa) {
  const sql = `
    SELECT 
      p.id,
      p.nome,
      p.codigo_barras,
      MIN(l.data_validade) AS validade_proxima,
      COALESCE(SUM(l.quantidade), 0) AS estoque_total,
      p.preco,
      p.imagem
    FROM cadastro_produto p
    JOIN lote_produto l ON l.produto_id = p.id AND l.ativo = 1 AND l.quantidade > 0
    WHERE p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
    ORDER BY validade_proxima ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa]);
  conn.end();
  return rows;
}

async function listProdRE(codEmpresa) {
  const sql = `
    SELECT 
      p.*,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
    ORDER BY estoque_total ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa]);
  conn.end();
  return rows;
}

async function listProdAP(codEmpresa) {
  const sql = `
    SELECT 
      p.*,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total,
      MIN(IF(l.ativo = 1, l.data_validade, NULL)) AS validade_proxima
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
    ORDER BY p.nome ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa]);
  conn.end();
  return rows;
}

async function listProdPrestesVencer(codEmpresa, dias) {
  const sql = `
    SELECT 
      p.id AS id_produto,
      p.nome,
      p.marca,
      p.codigo_barras,
      p.preco,
      p.imagem,
      p.codigo_produto,
      MIN(l.data_validade) AS validade_proxima,
      COALESCE(SUM(l.quantidade), 0) AS estoque_total
    FROM lote_produto l
    JOIN cadastro_produto p ON p.id = l.produto_id
    WHERE p.empresa_id = ?
      AND l.data_validade <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND l.data_validade >= CURDATE()
      AND p.ativo = 1
      AND l.ativo = 1
    GROUP BY p.id
    ORDER BY validade_proxima ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa, dias]);
  conn.end();
  return rows;
}

async function listProdCP(codEmpresa) {
  const sql = `
    SELECT 
      p.id,
      p.nome,
      p.marca,
      p.codigo_barras AS codBarras,
      p.empresa_id,
      p.codigo_produto AS codProduto,
      p.tipo_produto,
      p.modelo,
      p.categoria,
      p.preco,
      p.estoque_min,
      p.estoque_max,
      p.imagem,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
    ORDER BY p.nome ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codEmpresa]);
  conn.end();
  return rows;
}

async function listLotesByProduto(idProduto) {
  const sql = `
    SELECT 
      id AS id_lote,
      numero_lote,
      data_validade,
      quantidade
    FROM lote_produto
    WHERE produto_id = ? AND ativo = 1
    ORDER BY data_validade ASC
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [idProduto]);
  conn.end();
  return rows;
}

async function listProdByType(codBarras, codEmpresa) {
  const sql = `
    SELECT 
      p.*,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total,
      MIN(IF(l.ativo = 1, l.data_validade, NULL)) AS validade_proxima
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.codigo_barras = ? AND p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codBarras, codEmpresa]);
  conn.end();
  return rows;
}

async function listProdByTypeCOD(codProduto, codEmpresa) {
  const sql = `
    SELECT 
      p.*,
      COALESCE(SUM(IF(l.ativo = 1, l.quantidade, 0)), 0) AS estoque_total,
      MIN(IF(l.ativo = 1, l.data_validade, NULL)) AS validade_proxima
    FROM cadastro_produto p
    LEFT JOIN lote_produto l ON l.produto_id = p.id
    WHERE p.codigo_produto = ? AND p.empresa_id = ? AND p.ativo = 1
    GROUP BY p.id
  `;

  const conn = await database.connectDB();
  const [rows] = await conn.query(sql, [codProduto, codEmpresa]);
  conn.end();
  return rows;
}

// ----------------------------------------------------------------------
// EXCLUIR PRODUTO (SOFT DELETE + LOTES)
// ----------------------------------------------------------------------
async function excluirProduto(codigoProd, codEmpresa) {
  const conn = await database.connectDB();

  try {
    // Verificar existência
    const [produtoExiste] = await conn.query(
      `
      SELECT id 
      FROM cadastro_produto 
      WHERE codigo_produto = ? AND empresa_id = ? AND ativo = 1
      `,
      [codigoProd, codEmpresa]
    );

    if (produtoExiste.length === 0) {
      conn.end();
      throw new Error("Produto não encontrado");
    }

    const idProduto = produtoExiste[0].id;

    // Soft delete dos lotes
    await conn.query(
      `
      UPDATE lote_produto
      SET ativo = 0
      WHERE produto_id = ?
      `,
      [idProduto]
    );

    // Soft delete do produto
    await conn.query(
      `
      UPDATE cadastro_produto
      SET ativo = 0, data_exclusao = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [idProduto]
    );

    conn.end();
  } catch (err) {
    conn.end();
    throw err;
  }
}

// ----------------------------------------------------------------------
// EXCLUIR LOTE (SOFT DELETE)
// ----------------------------------------------------------------------
async function excluirLote(idLote) {
  const conn = await database.connectDB();

  try {
    await conn.query(
      `UPDATE lote_produto SET ativo = 0 WHERE id = ?`,
      [idLote]
    );

    conn.end();
  } catch (err) {
    conn.end();
    throw err;
  }
}

// ----------------------------------------------------------------------
export default {
  createProd,
  createLote,
  listProdRE,
  listLotesByProduto,
  updateProdVE,
  updateProdAP,
  listProdPrestesVencer,
  listProdAP,
  listProdCP,
  updateProd,
  listProd,
  listProdByType,
  excluirLote,
  excluirProduto,
  listProdVali,
  listProdByTypeCOD
};
