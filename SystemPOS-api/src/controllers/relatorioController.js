// controllers/relatorioController.js
import RelatorioService from '../services/relatorioService.js';

class RelatorioController {

  static async gerarRelatorio(req, res) {
    try {
      const { tipo, periodo, empresaId } = req.query;

      // validações
      const tiposValidos = [
        'Vendas', 'VendasPorCategoria', 'Ganhos', 'Gastos', 'Estoque', 'Clientes', 'Geral',
        'FormasPagamento', 'StatusVendas', 'EvolucaoVendas', 'ResumoDashboard'
      ];
      const periodosValidos = ['Hoje', 'Semana', 'Mês', 'Mes', 'Ano'];

      if (!tipo || !tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de relatório inválido.' });
      }

      if (!periodo || !periodosValidos.includes(periodo)) {
        return res.status(400).json({ error: 'Período inválido.' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório.' });
      }

      const dados = await RelatorioService.gerarDados(tipo, periodo, empresaId);

      if (!dados) {
        return res.status(200).json({ 
          categorias: [], 
          valores: [],
          totalVendas: 0,
          valorTotal: 0,
          vendasPendentes: 0,
          ticketMedio: 0
        });
      }

      return res.status(200).json(dados);

    } catch (err) {
      console.error('Erro no controller:', err);
      return res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  static async exportarPDF(req, res) {
    try {
      const { tipo, periodo, empresaId, usuarioId } = req.query;

      const tiposValidos = [
        'Vendas', 'Ganhos', 'Gastos', 'Estoque', 'Clientes', 'Geral',
        'FormasPagamento', 'StatusVendas', 'EvolucaoVendas', 'ResumoDashboard'
      ];
      const periodosValidos = ['Hoje', 'Semana', 'Mês', 'Mes', 'Ano'];

      if (!tipo || !tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de relatório inválido.' });
      }

      if (!periodo || !periodosValidos.includes(periodo)) {
        return res.status(400).json({ error: 'Período inválido.' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório.' });
      }

      if (!usuarioId) {
        return res.status(400).json({ error: 'usuarioId é obrigatório.' });
      }

      const pdfBuffer = await RelatorioService.gerarPDF(tipo, periodo, empresaId, usuarioId);

      if (!pdfBuffer) {
        return res.status(500).json({ error: 'Erro ao gerar PDF' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio-${tipo}-${periodo}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);

    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      return res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
  }

}

export default RelatorioController;