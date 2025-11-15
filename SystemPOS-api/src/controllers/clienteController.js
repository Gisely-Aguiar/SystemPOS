import express from "express";
import clienteService from "../services/clienteService.js";

const router = express.Router();

//
// ✅ CRUD BÁSICO
//

// Criar cliente
router.post("/", async (req, res) => {
  try {
    const novoCliente = await clienteService.criarCliente(req.body);
    return res.status(201).json(novoCliente);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});

// Buscar cliente por ID
router.get("/detalhe/:id", async (req, res) => {
  try {
    const cliente = await clienteService.buscarClientePorId(req.params.id);
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Listar clientes por empresa
router.get("/empresa/:empresaId", async (req, res) => {
  try {
    const clientes = await clienteService.listarClientes(req.params.empresaId);
    if (!clientes.length) return res.status(204).end();

    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Atualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const atualizado = await clienteService.atualizarCliente(req.params.id, req.body);
    return res.json(atualizado);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Deletar cliente
router.delete("/:id", async (req, res) => {
  try {
    await clienteService.deletarCliente(req.params.id);
    return res.json({ message: "Cliente deletado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


//
// ✅ ROTAS DE SALDO / CONTA DO CLIENTE
//

// Consultar saldo
router.get("/saldo/:id", async (req, res) => {
  try {
    const saldo = await clienteService.buscarSaldo(req.params.id);
    return res.json({ cliente_id: req.params.id, saldo });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Extrato (movimentações)
router.get("/extrato/:id", async (req, res) => {
  try {
    const extrato = await clienteService.buscarExtrato(req.params.id);
    return res.json(extrato);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Adicionar crédito (pagou adiantado)
router.post("/credito/:id", async (req, res) => {
  try {
    const { valor } = req.body;
    const mov = await clienteService.adicionarCredito(req.params.id, valor);
    return res.json(mov);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Registrar débito (compra fiado)
router.post("/debito/:id", async (req, res) => {
  try {
    const { valor } = req.body;
    const mov = await clienteService.adicionarDebito(req.params.id, valor);
    return res.json(mov);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Pagamento via conta do cliente
router.post("/pagar/:id", async (req, res) => {
  try {
    const { valor, venda_id } = req.body;
    const resultado = await clienteService.pagarComConta(req.params.id, valor, venda_id);
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
