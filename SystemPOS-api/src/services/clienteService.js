import db from "../repository/mysql.js";

//
// ✅ Funções auxiliares
//

async function getConnection() {
  const conn = await db.connectDB();
  await conn.beginTransaction();
  return conn;
}

//
// ✅ CRUD BÁSICO
//

async function criarCliente(dados) {
  const { empresa_id, nome, cpf, telefone, email, endereco } = dados;

  if (!empresa_id || !nome) {
    throw new Error("Campos obrigatórios não enviados.");
  }

  const conn = await getConnection();

  try {
    const [result] = await conn.execute(
      `INSERT INTO cliente (empresa_id, nome_completo, cpf, telefone, email, endereco)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [empresa_id, nome, cpf, telefone, email, endereco]
    );

    await conn.commit();
    return { id: result.insertId, ...dados, saldo: 0 };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

async function listarClientes(empresaId) {
  const conn = await db.connectDB();
  const [rows] = await conn.execute(
    "SELECT * FROM cliente WHERE empresa_id = ?",
    [empresaId]
  );
  await conn.end();
  return rows;
}

async function buscarClientePorId(id) {
  const conn = await db.connectDB();
  const [rows] = await conn.execute("SELECT * FROM cliente WHERE id = ?", [id]);
  await conn.end();
  return rows[0] || null;
}

async function atualizarCliente(id, dados) {
  const { nome, cpf, telefone, email, endereco } = dados;

  const conn = await getConnection();

  try {
    await conn.execute(
      `UPDATE cliente 
       SET nome_completo=?, cpf=?, telefone=?, email=?, endereco=? 
       WHERE id=?`,
      [nome, cpf, telefone, email, endereco, id]
    );

    await conn.commit();
    return buscarClientePorId(id);

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

async function deletarCliente(id) {
  const conn = await getConnection();
  try {
    await conn.execute("DELETE FROM cliente WHERE id = ?", [id]);
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

//
// ✅ CONTA DO CLIENTE – SALDO
//

async function buscarSaldo(id) {
  const cliente = await buscarClientePorId(id);
  if (!cliente) throw new Error("Cliente não encontrado");
  return cliente.saldo;
}

async function buscarExtrato(id) {
  const conn = await db.connectDB();
  const [rows] = await conn.execute(
    `SELECT * FROM cliente_movimentacao 
     WHERE cliente_id = ?
     ORDER BY data_movimentacao DESC`,
    [id]
  );
  await conn.end();
  return rows;
}

//
// ✅ Crédito
//

async function adicionarCredito(cliente_id, valor) {
  if (!valor || valor <= 0) throw new Error("Valor inválido");

  const conn = await getConnection();

  try {
    // Atualiza saldo
    await conn.execute(
      `UPDATE cliente SET saldo = saldo + ? WHERE id = ?`,
      [valor, cliente_id]
    );

    // Registra extrato
    const [move] = await conn.execute(
      `INSERT INTO cliente_movimentacao 
       (cliente_id, empresa_id, tipo, valor)
       SELECT id, empresa_id, 'credito', ?
       FROM cliente WHERE id = ?`,
      [valor, cliente_id]
    );

    await conn.commit();
    return move;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

//
// ✅ Débito
//

async function adicionarDebito(cliente_id, valor) {
  if (!valor || valor <= 0) throw new Error("Valor inválido");

  const conn = await getConnection();

  try {
    await conn.execute(
      `UPDATE cliente SET saldo = saldo - ? WHERE id = ?`,
      [valor, cliente_id]
    );

    await conn.execute(
      `INSERT INTO cliente_movimentacao 
       (cliente_id, empresa_id, tipo, valor)
       SELECT id, empresa_id, 'debito', ?
       FROM cliente WHERE id = ?`,
      [valor, cliente_id]
    );

    await conn.commit();
    return true;

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

//
// ✅ Pagamento via conta do cliente (integração com PDV)
//

async function pagarComConta(cliente_id, valor, venda_id) {
  if (!valor || valor <= 0) throw new Error("Valor inválido");

  const conn = await getConnection();

  try {
    // Debita
    await conn.execute(
      `UPDATE cliente SET saldo = saldo - ? WHERE id = ?`,
      [valor, cliente_id]
    );

    // Registra extrato
    await conn.execute(
      `INSERT INTO cliente_movimentacao 
      (cliente_id, empresa_id, tipo, valor)
      SELECT id, empresa_id, 'debito', ?)
      FROM cliente WHERE id = ?`,
      [valor, venda_id, cliente_id]
    );

    await conn.commit();

    return { message: "Pagamento realizado pelo saldo da conta" };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

export default {
  criarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente,
  buscarSaldo,
  buscarExtrato,
  adicionarCredito,
  adicionarDebito,
  pagarComConta
};
