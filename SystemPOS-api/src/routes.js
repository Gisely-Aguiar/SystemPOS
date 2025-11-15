import express from "express";
import userController from "./controllers/userController.js";
import empresaController from "./controllers/empresaController.js";
import donoController from "./controllers/donoController.js";
import produtoController from "./controllers/produtoController.js";
import padroesController from "./controllers/padroesController.js";
import tokenController from "./controllers/tokenController.js";
import { enviarToken, verificarToken} from './controllers/tokenController.js';
// import loginController from './controllers/loginController.js';

import RelatorioController from './controllers/relatorioController.js';
import { listarHistorico, registrarVendaController, getDetalhesVendaController  } from "./controllers/vendaController.js";

import clienteController from "./controllers/clienteController.js";

// CORREÇÃO: Importe corretamente as funções do pagamentoController
import { criarPagamentoPix, verificarStatusPagamento } from "./controllers/pagamentoController.js"; 

import mpWebhook from "./controllers/webhookController.js";


const routes = express();

routes.use("/user",  userController);
routes.use("/empresa",  empresaController);
routes.use("/dono", donoController);
routes.use("/produto", produtoController);
routes.use("/padroes", padroesController);
routes.use('/token-senha', tokenController);
routes.use("/clientes", clienteController);
routes.post('/enviar-token', enviarToken);
routes.post('/verificar-token', verificarToken);

routes.post("/pix", criarPagamentoPix);
// routes.use('/login', loginController);

routes.get('/relatorio', RelatorioController.gerarRelatorio);
routes.get('/relatorio/pdf', RelatorioController.exportarPDF);

routes.get('/historico-vendas/:empresaId', listarHistorico);

// CORREÇÃO: Remova esta linha pois não temos um controller completo para /pagamento
// routes.use("/pagamento", pagamentoController);

routes.post("/pagamento/webhook", mpWebhook);

routes.post('/venda/registrar', registrarVendaController);

routes.get('/pix/status/:payment_id', verificarStatusPagamento);

routes.get('/detalhes-venda/:vendaId/:empresaId', getDetalhesVendaController);

export default routes;