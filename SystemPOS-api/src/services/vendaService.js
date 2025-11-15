import db from '../repository/mysql.js';

/* ============================================================
   ✅ HISTÓRICO DE VENDAS
============================================================ */
export const getHistoricoVendas = async (empresaId) => {
  const connection = await db.connectDB();
  
  try {
    const [vendas] = await connection.query(`
      SELECT 
        v.id AS venda_id, 
        v.data_venda, 
        v.valor_total,
        v.forma_pagamento,
        'Cliente não identificado' AS nomeCliente,
        'N/A' AS cpf,
        COUNT(iv.id) AS totalItens
      FROM venda v
      JOIN item_venda iv ON iv.venda_id = v.id
      WHERE v.empresa_id = ?
      GROUP BY v.id
      ORDER BY v.data_venda DESC
      LIMIT 50
    `, [empresaId]);

    const historico = {};

    vendas.forEach(v => {
      const data = v.data_venda.toISOString().split("T")[0];
      if (!historico[data]) historico[data] = [];
      
      historico[data].push({
        vendaId: v.venda_id,
        nomeCliente: v.nomeCliente,
        cpf: v.cpf,
        totalItens: v.totalItens,
        valorTotal: formatCurrency(v.valor_total),
        formaPagamento: v.forma_pagamento,
        dataHora: formatarDataHoraBrasil(v.data_venda)
      });
    });

    return historico;

  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    throw error;
  } finally {
    connection.end();
  }
};



/* ============================================================
   ✅ REGISTRAR VENDA COM FIFO
============================================================ */
export const registrarVenda = async (dadosVenda) => {
  const connection = await db.connectDB();

  try {
    console.log('🎯 ========== INICIANDO REGISTRO DE VENDA ==========');
    await connection.beginTransaction();

    // 1. Criar venda
    const dataVenda = new Date();

    const [vendaResult] = await connection.query(`
      INSERT INTO venda 
        (empresa_id, cliente_id, valor_total, forma_pagamento, status, data_venda)
      VALUES (?, ?, ?, ?, ?, ?)

    `, [
      dadosVenda.empresa_id,
      dadosVenda.cliente_id ?? null,
      dadosVenda.valor_total,
      dadosVenda.forma_pagamento,
      "pago",
      dataVenda
    ]);

    const vendaId = vendaResult.insertId;
    console.log(`✅ Venda criada. ID: ${vendaId}`);

    // 2. Processar os itens = FIFO REAL
    for (const item of dadosVenda.itens) {

      const codigoProduto = item.codigo_produto;
      if (!codigoProduto) {
        throw new Error("Código do produto é obrigatório");
      }

      console.log(`🔍 Buscando produto código_produto=${codigoProduto}`);

      // ✅ Buscar produto pelo campo correto
      const [prodRows] = await connection.query(`
        SELECT id, nome, preco
        FROM cadastro_produto
        WHERE codigo_produto = ? AND empresa_id = ?
      `, [codigoProduto, dadosVenda.empresa_id]);

      if (prodRows.length === 0) {
        throw new Error(`Produto ${codigoProduto} não encontrado`);
      }

      const produto = prodRows[0];
      const produtoId = produto.id;
      const precoUnit = produto.preco;

      // ✅ Buscar lotes em ordem FIFO (validade crescente)
      const [lotes] = await connection.query(`
        SELECT id, quantidade, data_validade
        FROM lote_produto
        WHERE produto_id = ?
          AND quantidade > 0
        ORDER BY data_validade ASC
      `, [produtoId]);

      if (lotes.length === 0) {
        throw new Error(`Produto ${produto.nome} não possui lotes com estoque.`);
      }

      console.log(`📦 Aplicando FIFO para: ${produto.nome}`);

      let qtdNecessaria = item.quantidade;

      // ✅ Processar FIFO lote a lote
      for (const lote of lotes) {

        if (qtdNecessaria <= 0) break;

        const retirar = Math.min(qtdNecessaria, lote.quantidade);

        console.log(`➡️ Lote ${lote.id}: retirando ${retirar}`);

        // Atualiza estoque do lote
        await connection.query(`
          UPDATE lote_produto
          SET quantidade = quantidade - ?
          WHERE id = ?
        `, [retirar, lote.id]);

        // ✅ Registrar item_venda COM LOTE_ID (modelo correto do seu banco)
        await connection.query(`
          INSERT INTO item_venda 
            (venda_id, lote_id, quantidade, preco_unitario)
          VALUES (?, ?, ?, ?)
        `, [
          vendaId,
          lote.id,       // <-- lote_id correto
          retirar,
          precoUnit
        ]);

        qtdNecessaria -= retirar;
      }

      if (qtdNecessaria > 0) {
        throw new Error(
          `Estoque insuficiente do produto ${produto.nome}. Faltando ${qtdNecessaria}`
        );
      }
    }

    // ✅ Pagamento via conta do cliente (saldo)
    if (dadosVenda.forma_pagamento === "conta_cliente") {

      if (!dadosVenda.cliente_id) {
        throw new Error("cliente_id é obrigatório para pagamento via conta do cliente");
      }

      // Debitar saldo
      await connection.query(`
        UPDATE cliente 
        SET saldo = saldo - ? 
        WHERE id = ?
      `, [dadosVenda.valor_total, dadosVenda.cliente_id]);

      // Registrar extrato
      await connection.query(`
        INSERT INTO cliente_movimentacao (cliente_id, empresa_id, tipo, valor, descricao)
        VALUES (?, ?, 'debito', ?, ?)
      `, [
        dadosVenda.cliente_id,
        dadosVenda.empresa_id,
        dadosVenda.valor_total,
        `Pagamento da venda ${vendaId}`
      ]);
    }
    await connection.commit();

    console.log("✅ Venda registrada com sucesso! FIFO aplicado corretamente.");
    return {
      success: true,
      venda_id: vendaId,
      data_venda: dataVenda,
      message: "Venda registrada com sucesso (FIFO aplicado)"
    };

  } catch (error) {
    await connection.rollback();
    console.error("❌ ERRO na venda:", error);
    throw error;

  } finally {
    connection.end();
  }
};


/* ============================================================
   ✅ DETALHAR VENDA — VERSÃO REFEITA / COMPLETA
============================================================ */
export const getDetalhesVenda = async (vendaId, empresaId) => {
  const connection = await db.connectDB();

  try {
    // ✅ Buscar informações da venda + cliente
    const [vendaInfo] = await connection.query(`
      SELECT 
        v.id,
        v.data_venda,
        v.valor_total,
        v.forma_pagamento,
        v.status,
        c.nome_completo AS nome_cliente,
        c.cpf AS cpf_cliente
      FROM venda v
      LEFT JOIN cliente c ON c.id = v.cliente_id
      WHERE v.id = ? AND v.empresa_id = ?
    `, [vendaId, empresaId]);

    if (vendaInfo.length === 0) {
      throw new Error("Venda não encontrada");
    }

    const venda = vendaInfo[0];

    // ✅ Buscar itens da venda com JOIN correto (FIFO finalizado)
    const [itensVenda] = await connection.query(`
      SELECT 
        iv.quantidade,
        iv.preco_unitario,
        cp.nome AS nome_produto,
        cp.codigo_produto,
        lp.numero_lote,
        lp.data_validade
      FROM item_venda iv
      JOIN lote_produto lp ON lp.id = iv.lote_id
      JOIN cadastro_produto cp ON cp.id = lp.produto_id
      WHERE iv.venda_id = ?
    `, [vendaId]);

    // ✅ Retorno final padronizado
    return {
      venda: {
        id: venda.id,
        data_venda: venda.data_venda,
        valor_total: venda.valor_total,
        forma_pagamento: venda.forma_pagamento,
        status: venda.status,

        // ✅ Se não tiver cliente (ex: venda à vista)
        nome_cliente: venda.nome_cliente ?? "Cliente não identificado",
        cpf_cliente: venda.cpf_cliente ?? "N/A",

        data_brasil: formatarDataBrasil(venda.data_venda),
        hora_brasil: formatarHoraBrasil(venda.data_venda),
        data_hora_brasil: formatarDataHoraBrasil(venda.data_venda)
      },

      itens: itensVenda.map(i => ({
        nome_produto: i.nome_produto,
        codigo_produto: i.codigo_produto,
        lote: i.numero_lote,
        validade: formatarDataBrasil(i.data_validade),
        quantidade: i.quantidade,
        preco_unitario: i.preco_unitario,
        subtotal: i.quantidade * i.preco_unitario
      }))
    };

  } catch (error) {
    console.error("❌ Erro ao buscar detalhes:", error);
    throw error;

  } finally {
    connection.end();
  }
};


/* ============================================================
   ✅ FUNÇÕES AUXILIARES
============================================================ */
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatarDataBrasil(data) {
  if (!data) return "N/A";
  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });
}

function formatarHoraBrasil(data) {
  if (!data) return "N/A";
  return new Date(data).toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });
}

function formatarDataHoraBrasil(data) {
  if (!data) return "N/A";
  return new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  });
}
