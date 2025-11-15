import padroesService from '../services/padroesService.js';
import userService from '../services/userService.js';
import express from 'express';

const router = express.Router();

// LISTAR TODOS OS PADRÕES
router.get('/', async (req, res) => {
  try {
    const padroes = await padroesService.listPadroes();

    if (!padroes || padroes.length < 1) {
      return res.status(204).end();
    }

    return res.status(200).json(padroes);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao buscar padrões' });
  }
});

// BUSCAR PADRÃO POR ID
router.get('/id/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const padrao = await padroesService.buscarPadraoPorId(id);

    if (!padrao) {
      return res.status(404).json({ erro: 'Padrão não encontrado.' });
    }

    return res.status(200).json(padrao);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// BUSCAR PADRÃO POR EMAIL
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const padrao = await padroesService.buscarPadraoPorEmail(email);

    if (!padrao || padrao.length < 1) {
      return res.status(404).json({ erro: 'Padrão não encontrado.' });
    }

    return res.status(200).json({ message: padrao });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// BUSCAR USUÁRIO POR EMAIL (USER SERVICE)
router.get('/user/:Email', async (req, res) => {
  try {
    const { Email } = req.params;
    const users = await userService.listUserByType(Email);

    if (!users || users.length < 1) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json({ message: users });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// CRIAR PADRÕES
router.post('/', async (req, res) => {
  try {
    const dados = req.body;

    await padroesService.createPadroes(
      dados.adicionarUsuario,
      dados.adicionarProduto,
      dados.relatorios,
      dados.reporEstoque,
      dados.gerenciarPermissoes,
      dados.adicionarPromocao,
      dados.cadastrarEmpresa,
      dados.prestesAVencer,
      dados.iniciarExpediente,
      dados.adicionarCliente
    );

    return res.status(201).json({ message: 'Padrões cadastrados com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao cadastrar padrões' });
  }
});

// ATUALIZAR PADRÃO
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const resultado = await padroesService.atualizarPadrao(id, req.body);

    if (!resultado || resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Padrão não encontrado.' });
    }

    return res.status(200).json({ mensagem: 'Atualizado com sucesso.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao atualizar padrão' });
  }
});

// DELETAR PADRÃO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await padroesService.deleteUser(id);

    return res.status(200).json({ message: 'Padrão excluído com sucesso' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro ao excluir padrão' });
  }
});

export default router;
