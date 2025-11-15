// src/services/relatorioService.js
import db from '../repository/mysql.js';
import { jsPDF } from 'jspdf';

// Função para formatar a categoria dependendo do período
function formatarCategoria(data, periodo) {
  const d = new Date(data);
  
  if (periodo === 'Semana') {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[d.getDay()];
  }
  if (periodo === 'Mês') {
    return d.getDate().toString().padStart(2, '0');
  }
  if (periodo === 'Ano') {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[d.getMonth()];
  }

  // Hoje - mostra horas
  return `${String(d.getHours()).padStart(2, '0')}:00`;
}

class RelatorioService {
  static async gerarDados(tipo, periodo, empresaId) {
    const conn = await db.connectDB();
    let query = '';
    let dias = 1;

    switch (periodo) {
      case 'Hoje': dias = 1; break;
      case 'Semana': dias = 7; break;
      case 'Mês': dias = 30; break;
      case 'Ano': dias = 365; break;
    }

    switch (tipo) {
      case 'Vendas':
        query = `
          SELECT DATE(data_venda) as dia, SUM(valor_total) as total
          FROM venda
          WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY dia
          ORDER BY dia;
        `;
        break;

      case 'FormasPagamento':
        query = `
          SELECT forma_pagamento, COUNT(*) as quantidade, SUM(valor_total) as valor_total
          FROM venda
          WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY forma_pagamento;
        `;
        break;

      case 'StatusVendas':
        query = `
          SELECT status, COUNT(*) as quantidade, SUM(valor_total) as valor_total
          FROM venda
          WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY status;
        `;
        break;

      case 'EvolucaoVendas':
        query = `
          SELECT DATE(data_venda) as dia, SUM(valor_total) as total, COUNT(*) as quantidade
          FROM venda
          WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY dia
          ORDER BY dia;
        `;
        break;

      case 'Ganhos':
        query = `
          SELECT DATE(data_venda) as dia, SUM(valor_total) as total_ganhos
          FROM venda
          WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY dia
          ORDER BY dia;
        `;
        break;

      case 'Gastos':
        query = `
          SELECT DATE(data_gasto) as dia, SUM(valor) as total_gasto
          FROM gastos
          WHERE empresa_id = ? AND data_gasto >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY dia
          ORDER BY dia;
        `;
        break;

      case 'Estoque':
        query = `
          SELECT c.nome AS produto, c.quantidade, c.preco
          FROM cadastro_produto c
          WHERE c.empresa_id = ? AND c.ativo = true
          ORDER BY c.quantidade DESC
          LIMIT 15;
        `;
        break;

      case 'Clientes':
        query = `
          SELECT DATE(data_cadastro) as dia, COUNT(*) as total_clientes
          FROM cliente
          WHERE empresa_id = ? AND data_cadastro >= DATE_SUB(NOW(), INTERVAL ? DAY)
          GROUP BY dia
          ORDER BY dia;
        `;
        break;

      case 'Geral':
        // Query para dados do resumo
        query = `
          SELECT 
            (SELECT COUNT(*) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_vendas,
            (SELECT SUM(valor_total) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_ganhos,
            (SELECT COUNT(*) FROM cliente WHERE empresa_id = ? AND data_cadastro >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_clientes,
            (SELECT COUNT(*) FROM cadastro_produto WHERE empresa_id = ? AND ativo = true) as total_produtos,
            (SELECT COUNT(*) FROM venda WHERE empresa_id = ? AND status = 'pendente' AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as vendas_pendentes,
            (SELECT AVG(valor_total) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as ticket_medio
        `;
        break;

      case 'ResumoDashboard':
        // Query específica para o resumo do dashboard
        query = `
          SELECT 
            (SELECT COUNT(*) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as total_vendas,
            (SELECT SUM(valor_total) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as valor_total,
            (SELECT COUNT(*) FROM venda WHERE empresa_id = ? AND status = 'pendente' AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as vendas_pendentes,
            (SELECT AVG(valor_total) FROM venda WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)) as ticket_medio
        `;
        break;

      case 'VendasPorCategoria':
  query = `
    SELECT 
      cp.categoria,
      COUNT(DISTINCT v.id) as quantidade_vendas,
      SUM(iv.quantidade * iv.preco_unitario) as valor_total
    FROM venda v
    JOIN item_venda iv ON v.id = iv.venda_id
    JOIN lote_produto lp ON iv.lote_id = lp.id
    JOIN cadastro_produto cp ON lp.produto_id = cp.id
    WHERE v.empresa_id = ? 
      AND v.data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
      AND v.status != 'cancelado'
    GROUP BY cp.categoria
    ORDER BY valor_total DESC;
  `;
  break;
    }

    let rows;
    
    if (tipo === 'Geral') {
      const [geralRows] = await conn.execute(query, [
        empresaId, dias,
        empresaId, dias,
        empresaId, dias,
        empresaId,
        empresaId, dias,
        empresaId, dias
      ]);

      const resumo = geralRows[0] || {};
      await conn.end();

      return {
        categorias: ['Vendas', 'Ganhos', 'Clientes', 'Produtos', 'Pendentes', 'Ticket Médio'],
        valores: [
          resumo.total_vendas || 0,
          resumo.total_ganhos || 0,
          resumo.total_clientes || 0,
          resumo.total_produtos || 0,
          resumo.vendas_pendentes || 0,
          resumo.ticket_medio || 0
        ]
      };
    }  else if (tipo === 'VendasPorCategoria') {
  [rows] = await conn.execute(query, [empresaId, dias]);
  
  const categorias = rows.map(r => r.categoria);
  const valores = rows.map(r => Number(r.valor_total));
  const quantidades = rows.map(r => Number(r.total_itens));
  
  await conn.end();
  return { 
    categorias, 
    valores, 
    dadosExtras: { 
      quantidades,
      totalVendas: rows.reduce((sum, row) => sum + Number(row.quantidade_vendas), 0)
    } 
  };
}else if (tipo === 'ResumoDashboard') {
      const [resumoRows] = await conn.execute(query, [
        empresaId, dias,
        empresaId, dias,
        empresaId, dias,
        empresaId, dias
      ]);

      const resumo = resumoRows[0] || {};
      await conn.end();

      return {
        totalVendas: resumo.total_vendas || 0,
        valorTotal: resumo.valor_total || 0,
        vendasPendentes: resumo.vendas_pendentes || 0,
        ticketMedio: resumo.ticket_medio || 0
      };
    } else if (tipo === 'FormasPagamento' || tipo === 'StatusVendas') {
      [rows] = await conn.execute(query, [empresaId, dias]);
      
      const categorias = rows.map(r => {
        if (tipo === 'FormasPagamento') {
          const formas = {
            'cartao_credito': 'Cartão Crédito',
            'cartao_debito': 'Cartão Débito',
            'pix': 'PIX',
            'dinheiro': 'Dinheiro',
            'outro': 'Outro'
          };
          return formas[r.forma_pagamento] || r.forma_pagamento;
        } else {
          return r.status.charAt(0).toUpperCase() + r.status.slice(1);
        }
      });
      
      const valores = tipo === 'FormasPagamento' 
        ? rows.map(r => Number(r.quantidade))
        : rows.map(r => Number(r.quantidade));
      
      await conn.end();
      return { categorias, valores, dadosExtras: rows };
    } else if (tipo === 'Estoque') {
      [rows] = await conn.execute(query, [empresaId]);
      
      const categorias = rows.map(r => r.produto);
      const valores = rows.map(r => Number(r.quantidade));
      
      await conn.end();
      return { categorias, valores, dadosExtras: rows };
    } else if (tipo === 'EvolucaoVendas') {
        [rows] = await conn.execute(query, [empresaId, dias]);
        
        const categorias = rows.map(r => formatarCategoria(r.dia, periodo));
        const valores = rows.map(r => Number(r.total));
        const quantidades = rows.map(r => Number(r.quantidade));
        
        await conn.end();
        return { 
          categorias, 
          valores, 
          dadosExtras: { 
            quantidades 
          } 
        };
      } else {
      [rows] = await conn.execute(query, [empresaId, dias]);
    }

    await conn.end();

    // Formata categorias e valores para gráficos temporais
    const categorias = rows.length > 0 ? rows.map(r => formatarCategoria(r.dia, periodo)) : [];
    const valores = rows.length > 0 ? rows.map(r => Number(r.total || r.total_ganhos || r.total_gasto || r.total_clientes)) : [];

    return { categorias, valores };
  }

  static async gerarPDF(tipo, periodo, empresaId, usuarioId) {
    const dados = await this.gerarDados(tipo, periodo, empresaId);
    const doc = new jsPDF();
    
    // Configurações iniciais
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    // CORES
    const corPrimaria = [255, 127, 38]; // Laranja
    const corSecundaria = [8, 14, 53];   // Azul escuro
    const corTexto = [51, 51, 51];       // Cinza escuro
    const corSucesso = [76, 175, 80];    // Verde
    const corAlerta = [255, 152, 0];     // Laranja claro
    const corErro = [244, 67, 54];       // Vermelho

    // ========== CABEÇALHO ==========
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Logo/Texto do sistema
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SYSTEM POS', margin, 30);
    
    // Tipo de relatório
    doc.setFontSize(16);
    doc.text(`Relatório de ${this.formatarTitulo(tipo)}`, margin, 45);
    
    // Período e data
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${periodo}`, pageWidth - margin, 25, { align: 'right' });
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, 32, { align: 'right' });
    doc.text(`Empresa ID: ${empresaId}`, pageWidth - margin, 39, { align: 'right' });

    let yPos = 80;

    // ========== RESUMO EXECUTIVO ==========
    if (dados.valores && dados.valores.length > 0) {
      doc.setFillColor(...corSecundaria);
      doc.rect(margin, yPos, contentWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMO EXECUTIVO', margin + 5, yPos + 10);
      
      yPos += 25;

      // Estatísticas principais
      const total = dados.valores.reduce((a, b) => a + (Number(b) || 0), 0);
      const media = total / (dados.valores.length || 1);
      const max = Math.max(...dados.valores.map(v => Number(v) || 0), 0);
      const min = Math.min(...dados.valores.map(v => Number(v) || 0), 0);

      doc.setTextColor(...corTexto);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const stats = [
        { label: 'Total', value: formatValor(tipo, total), color: corSucesso },
        { label: 'Média', value: formatValor(tipo, media), color: corPrimaria },
        { label: 'Máximo', value: formatValor(tipo, max), color: corAlerta },
        { label: 'Mínimo', value: formatValor(tipo, min), color: corErro },
        { label: 'Registros', value: dados.valores.length.toString(), color: corSecundaria }
      ];

      const statWidth = contentWidth / stats.length;
      
      stats.forEach((stat, index) => {
        const x = margin + (index * statWidth);
        
        // Background do card
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(x, yPos, statWidth - 5, 30, 3, 3, 'F');
        
        // Borda colorida
        doc.setDrawColor(...stat.color);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, yPos, statWidth - 5, 30, 3, 3, 'S');
        
        // Texto
        doc.setTextColor(...corTexto);
        doc.setFontSize(8);
        doc.text(stat.label, x + 5, yPos + 8);
        
        doc.setTextColor(...stat.color);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.value, x + 5, yPos + 20);
      });

      yPos += 45;
    }

    // ========== DADOS DETALHADOS ==========
    if (dados.categorias && dados.categorias.length > 0) {
      doc.setFillColor(...corSecundaria);
      doc.rect(margin, yPos, contentWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DADOS DETALHADOS', margin + 5, yPos + 10);
      
      yPos += 25;

      // Cabeçalho da tabela
      doc.setFillColor(...corPrimaria);
      doc.rect(margin, yPos, contentWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      const colWidths = [contentWidth * 0.5, contentWidth * 0.25, contentWidth * 0.25];
      doc.text(this.getHeaderTipo(tipo), margin + 5, yPos + 8);
      doc.text('Valor', margin + colWidths[0] + 5, yPos + 8);
      doc.text('Percentual', margin + colWidths[0] + colWidths[1] + 5, yPos + 8);

      yPos += 12;

      // Linhas da tabela
      const total = dados.valores.reduce((a, b) => a + (Number(b) || 0), 0);
      
      dados.categorias.forEach((categoria, index) => {
        const valor = dados.valores[index] || 0;
        const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) + '%' : '0%';
        
        // Fundo zebrado
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(margin, yPos, contentWidth, 10, 'F');
        
        // Texto
        doc.setTextColor(...corTexto);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        doc.text(categoria.substring(0, 25), margin + 5, yPos + 7);
        doc.text(formatValor(tipo, valor), margin + colWidths[0] + 5, yPos + 7);
        doc.text(percentual, margin + colWidths[0] + colWidths[1] + 5, yPos + 7);
        
        yPos += 10;
      });

      // Linha de total
      doc.setFillColor(230, 230, 230);
      doc.rect(margin, yPos, contentWidth, 12, 'F');
      doc.setTextColor(...corTexto);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.text('TOTAL', margin + 5, yPos + 8);
      doc.text(formatValor(tipo, total), margin + colWidths[0] + 5, yPos + 8);
      doc.text('100%', margin + colWidths[0] + colWidths[1] + 5, yPos + 8);

      yPos += 20;
    } else {
      // Mensagem quando não há dados
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(12);
      doc.text('Nenhum dado disponível para o período selecionado.', margin, yPos);
      yPos += 20;
    }

    // ========== ANÁLISES ADICIONAIS ==========
    if (dados.dadosExtras && Object.keys(dados.dadosExtras).length > 0) {
      doc.setFillColor(...corSecundaria);
      doc.rect(margin, yPos, contentWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('ANÁLISES ADICIONAIS', margin + 5, yPos + 10);
      
      yPos += 25;

      doc.setTextColor(...corTexto);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Análise específica por tipo
      switch (tipo) {
        case 'FormasPagamento':
          doc.text('• A forma de pagamento predominante representa a maior parte das transações.', margin, yPos);
          yPos += 8;
          doc.text('• Diversificar opções de pagamento pode aumentar as conversões.', margin, yPos);
          yPos += 8;
          break;
          
        case 'StatusVendas':
          const pendentes = dados.valores[dados.categorias?.findIndex(c => c.includes('Pendente'))] || 0;
          if (pendentes > 0) {
            doc.text(`• ${pendentes} vendas pendentes necessitam de acompanhamento.`, margin, yPos);
            yPos += 8;
          }
          doc.text('• Taxa de conversão pode ser melhorada com follow-up eficiente.', margin, yPos);
          yPos += 8;
          break;
          
        case 'Vendas':
        case 'EvolucaoVendas':
          query = `
            SELECT DATE(data_venda) as dia, SUM(valor_total) as total, COUNT(*) as quantidade
            FROM venda
            WHERE empresa_id = ? AND data_venda >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY dia
            ORDER BY dia;
          `;
          break;
          
        case 'Estoque':
          const baixoEstoque = dados.valores.filter(v => v < 10).length;
          if (baixoEstoque > 0) {
            doc.text(`• ${baixoEstoque} produtos com estoque baixo (menos de 10 unidades)`, margin, yPos);
            yPos += 8;
          }
          break;
      }

      yPos += 10;
    }

    // ========== RODAPÉ ==========
    const dataGeracao = new Date().toLocaleString('pt-BR');
    
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Relatório gerado em: ${dataGeracao}`, margin, yPos);
    doc.text(`Sistema POS - Relatório ${this.formatarTitulo(tipo)}`, pageWidth - margin, yPos, { align: 'right' });
    
    yPos += 5;
    doc.text(`Usuário ID: ${usuarioId} | Página 1/1`, margin, yPos);

    // Registrar exportação
    const conn = await db.connectDB();
    const tipoBancoMap = {
      'Vendas': 'venda', 'Ganhos': 'ganhos', 'Gastos': 'gastos',
      'Estoque': 'estoque', 'Clientes': 'clientes', 'Geral': 'geral',
      'FormasPagamento': 'pagamento', 'StatusVendas': 'status', 'EvolucaoVendas': 'evolucao',
      'ResumoDashboard': 'resumo'
    };
    
    await conn.query(
      `INSERT INTO relatorio_exportado (tipo_relatorio, usuario_id, empresa_id) VALUES (?, ?, ?)`,
      [tipoBancoMap[tipo] || tipo, usuarioId, empresaId]
    );
    await conn.end();

    return Buffer.from(doc.output('arraybuffer'));
  }

  // Funções auxiliares
  static formatarTitulo(tipo) {
    const titulos = {
      'Vendas': 'Vendas',
      'FormasPagamento': 'Formas de Pagamento',
      'StatusVendas': 'Status das Vendas',
      'EvolucaoVendas': 'Evolução de Vendas',
      'Ganhos': 'Ganhos',
      'Gastos': 'Gastos',
      'Estoque': 'Estoque',
      'Clientes': 'Clientes',
      'Geral': 'Geral',
      'ResumoDashboard': 'Resumo do Dashboard'
    };
    return titulos[tipo] || tipo;
  }

  static getHeaderTipo(tipo) {
    const headers = {
      'Vendas': 'Data',
      'FormasPagamento': 'Forma de Pagamento',
      'StatusVendas': 'Status',
      'EvolucaoVendas': 'Período',
      'Ganhos': 'Data',
      'Gastos': 'Data',
      'Estoque': 'Produto',
      'Clientes': 'Data',
      'Geral': 'Métrica',
      'ResumoDashboard': 'Item'
    };
    return headers[tipo] || 'Item';
  }
}

function formatValor(tipo, valor) {
  if (tipo === 'Ganhos' || tipo === 'Vendas' || tipo === 'EvolucaoVendas' || tipo === 'Gastos') {
    return `R$ ${parseFloat(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (tipo === 'Estoque') {
    return `${parseInt(valor || 0).toLocaleString('pt-BR')} un`;
  }
  return String(valor || 0).toLocaleString('pt-BR');
}

export default RelatorioService;