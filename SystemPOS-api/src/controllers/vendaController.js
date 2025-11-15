import { getHistoricoVendas, registrarVenda, getDetalhesVenda } from "../services/vendaService.js";

export const listarHistorico = async (req, res) => {
  try {
    const { empresaId } = req.params;

    // ✅ Validação obrigatória
    if (!empresaId) {
      return res.status(400).json({ error: "empresaId é obrigatório." });
    }

    // ✅ Garante que é número
    if (isNaN(Number(empresaId))) {
      return res.status(400).json({ error: "empresaId inválido. Deve ser numérico." });
    }

    const historico = await getHistoricoVendas(empresaId);

    // ✅ Caso não exista histórico
    if (!historico || historico.length === 0) {
      return res.status(204).end(); // No content
    }

    return res.status(200).json(historico);

  } catch (err) {
    console.error("Erro em listarHistorico:", err);
    return res.status(500).json({ error: "Erro ao buscar histórico de vendas" });
  }
};
// NO BACKEND - vendaController.js (atualização)
export const registrarVendaController = async (req, res) => {
  try {
    const { 
      empresa_id, 
      valor_total, 
      forma_pagamento, 
      itens,
      cliente_id     
    } = req.body;


    console.log('📦 Dados recebidos no backend:', {
      empresa_id,
      valor_total, 
      forma_pagamento,
      itens,
      cliente_id
    });

    // Validações obrigatórias
    if (!empresa_id || !valor_total || !forma_pagamento || !itens) {
      return res.status(400).json({ 
        error: "Todos os campos são obrigatórios" 
      });
    }

    const resultado = await registrarVenda({
      empresa_id,
      valor_total,
      forma_pagamento,
      itens,
      cliente_id
    });

    console.log('✅ Venda registrada com sucesso:', resultado);

    res.status(201).json({
      success: true,
      message: "Venda registrada com sucesso",
      venda_id: resultado.venda_id
    });

  } catch (err) {
    console.error("🔴 ERRO DETALHADO em registrarVenda:");
    console.error("Mensagem:", err.message);
    console.error("Código:", err.code);
    
    // Mensagens de erro mais específicas
    if (err.message.includes('ID do produto inválido')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('Produto com ID') && err.message.includes('não encontrado')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('Estoque insuficiente')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        error: "Produto não encontrado no estoque. Verifique os IDs dos produtos."
      });
    }
    
    return res.status(500).json({ 
      error: `Erro ao registrar venda: ${err.message}`
    });
  }
};

// CONTROLLER PARA DETALHES DA VENDA
export const getDetalhesVendaController = async (req, res) => {
  try {
    const { vendaId, empresaId } = req.params;

    console.log('📦 Buscando detalhes:', { vendaId, empresaId });

    // Validações
    if (!vendaId || !empresaId) {
      return res.status(400).json({ 
        error: "vendaId e empresaId são obrigatórios" 
      });
    }

    if (isNaN(Number(vendaId)) || isNaN(Number(empresaId))) {
      return res.status(400).json({ 
        error: "IDs devem ser numéricos" 
      });
    }

    const detalhes = await getDetalhesVenda(vendaId, empresaId);

    res.status(200).json(detalhes);

  } catch (err) {
    console.error("🔴 ERRO em getDetalhesVenda:", err.message);
    
    if (err.message === 'Venda não encontrada') {
      return res.status(404).json({ error: err.message });
    }
    
    return res.status(500).json({ 
      error: "Erro ao buscar detalhes da venda" 
    });
  }
};