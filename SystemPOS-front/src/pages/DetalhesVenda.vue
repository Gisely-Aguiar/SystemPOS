<template>
  <div class="detalhes-venda-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="voltar" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">DETALHES DA VENDA</h1>

    <div class="content-wrapper">
      <div class="detalhes-card">
        <div v-if="carregando" class="carregando">
          <q-icon name="refresh" class="carregando-icon" />
          <p>Carregando detalhes da venda...</p>
        </div>

        <div v-else-if="erro" class="erro">
          <q-icon name="error" class="erro-icon" />
          <p>{{ erro }}</p>
          <button class="btn-tentar-novamente" @click="buscarDetalhes">Tentar Novamente</button>
        </div>

        <div v-else class="detalhes-content">
          <!-- Cabeçalho da venda -->
          <div class="venda-header">
            <div class="venda-info">
              <h2 class="venda-id">Venda #{{ detalhes.venda.id.toString().padStart(3, '0') }}</h2>
              <div class="venda-data">{{ detalhes.venda.data_hora_brasil }}</div>
            </div>
            <div class="venda-status" :class="detalhes.venda.status">
              {{ formatarStatus(detalhes.venda.status) }}
            </div>
          </div>

          <!-- Informações principais -->
          <div class="info-section">
            <h3 class="section-title">Informações da Venda</h3>
            <div class="info-grid">
              <div class="info-item">
                <q-icon name="payments" class="info-icon" />
                <div class="info-content">
                  <span class="info-label">Valor Total</span>
                  <span class="info-value valor-total">{{
                    formatarMoeda(detalhes.venda.valor_total)
                  }}</span>
                </div>
              </div>
              <div class="info-item">
                <q-icon name="credit_card" class="info-icon" />
                <div class="info-content">
                  <span class="info-label">Forma de Pagamento</span>
                  <span class="info-value">{{
                    formatarFormaPagamento(detalhes.venda.forma_pagamento)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Cliente -->
          <div class="info-section">
            <h3 class="section-title">Dados do Cliente</h3>
            <div class="info-grid">
              <div class="info-item">
                <q-icon name="person" class="info-icon" />
                <div class="info-content">
                  <span class="info-label">Nome</span>
                  <span class="info-value">{{ detalhes.venda.nome_cliente }}</span>
                </div>
              </div>
              <div class="info-item">
                <q-icon name="badge" class="info-icon" />
                <div class="info-content">
                  <span class="info-label">CPF</span>
                  <span class="info-value">{{ detalhes.venda.cpf_cliente }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Itens da venda -->
          <div class="itens-section">
            <div class="section-header">
              <h3 class="section-title">Itens da Venda</h3>
              <span class="itens-count">{{ detalhes.itens.length }} itens</span>
            </div>

            <div class="itens-list">
              <div class="itens-header">
                <span class="header-produto">Produto</span>
                <span class="header-quantidade">Qtd</span>
                <span class="header-preco">Preço Unit.</span>
                <span class="header-subtotal">Subtotal</span>
              </div>

              <div v-for="(item, index) in detalhes.itens" :key="index" class="item-row">
                <div class="item-info">
                  <div class="item-nome">{{ item.nome_produto }}</div>
                  <div class="item-codigo">Cód: {{ item.codigo_produto }}</div>
                </div>
                <div class="item-quantidade">{{ item.quantidade }}x</div>
                <div class="item-preco">{{ formatarMoeda(item.preco_unitario) }}</div>
                <div class="item-subtotal">{{ formatarMoeda(item.subtotal) }}</div>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <div class="total-content">
                <q-icon name="receipt" class="total-icon" />
                <div class="total-text">
                  <span class="total-label">VALOR TOTAL</span>
                  <span class="total-value">{{ formatarMoeda(detalhes.venda.valor_total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="acoes-section">
            <button class="btn-imprimir" @click="imprimirVenda">
              <q-icon name="print" class="btn-icon" />
              Imprimir Venda
            </button>
            <button class="btn-voltar" @click="voltar">
              <q-icon name="arrow_back" class="btn-icon" />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'DetalhesVenda',
  data() {
    return {
      carregando: true,
      erro: null,
      detalhes: null,
    }
  },

  mounted() {
    this.buscarDetalhes()
  },

  methods: {
    async buscarDetalhes() {
      try {
        this.carregando = true

        const { vendaId, empresaId } = this.$route.params

        const resp = await axios.get(`http://localhost:3333/detalhes-venda/${vendaId}/${empresaId}`)

        this.detalhes = resp.data

        console.log('📋 Dados recebidos da API:', this.detalhes)

        // VERIFICAÇÃO E CORREÇÃO DOS DADOS DO CLIENTE
        if (this.detalhes.venda) {
          // Se os dados do cliente vierem em um objeto separado
          if (this.detalhes.cliente) {
            this.detalhes.venda.nome_cliente =
              this.detalhes.cliente.nome_completo || 'Cliente não identificado'
            this.detalhes.venda.cpf_cliente = this.detalhes.cliente.cpf || 'N/A'
          }
          // Se os dados do cliente vierem diretamente na venda
          else if (this.detalhes.venda.cliente_id) {
            // Buscar dados do cliente separadamente
            await this.buscarDadosCliente(this.detalhes.venda.cliente_id)
          }
          // Se não houver dados do cliente, usar fallbacks
          else {
            this.detalhes.venda.nome_cliente =
              this.detalhes.venda.nome_cliente || 'Cliente não identificado'
            this.detalhes.venda.cpf_cliente = this.detalhes.venda.cpf_cliente || 'N/A'
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar detalhes:', error)
        this.erro = error.response?.data?.error || 'Erro ao carregar detalhes da venda.'
      } finally {
        this.carregando = false
      }
    },

    async buscarDadosCliente(clienteId) {
      try {
        console.log('🔍 Buscando dados do cliente ID:', clienteId)

        const response = await axios.get(`http://localhost:3333/clientes/${clienteId}`)
        const cliente = response.data

        console.log('👤 Dados do cliente encontrados:', cliente)

        // Atualizar os dados na venda
        this.detalhes.venda.nome_cliente =
          cliente.nome_completo || cliente.nome || 'Cliente não identificado'
        this.detalhes.venda.cpf_cliente = cliente.cpf || 'N/A'
      } catch (error) {
        console.error('❌ Erro ao buscar dados do cliente:', error)
        // Fallback caso não consiga buscar os dados do cliente
        this.detalhes.venda.nome_cliente = 'Cliente não identificado'
        this.detalhes.venda.cpf_cliente = 'N/A'
      }
    },

    formatarMoeda(v) {
      if (!v && v !== 0) return 'R$ 0,00'
      const num = typeof v === 'string' ? parseFloat(v) : v
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num || 0)
    },

    formatarStatus(status) {
      const map = { pago: 'Pago', pendente: 'Pendente', cancelado: 'Cancelado' }
      return map[status] || status
    },

    formatarFormaPagamento(forma) {
      const formas = {
        pix: 'PIX',
        dinheiro: 'Dinheiro',
        cartao_credito: 'Cartão Crédito',
        cartao_debito: 'Cartão Débito',
        vale_alimentacao: 'Vale Alimentação',
        vale_refeicao: 'Vale Refeição',
        conta_cliente: 'Conta do Cliente',
        debitar_cliente: 'Débito em Conta',
      }
      return formas[forma] || forma
    },

    imprimirVenda() {
      window.print()
    },

    voltar() {
      this.$router.back()
    },
  },
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.detalhes-venda-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
}

/* ===== BOTÃO VOLTAR ===== */
.botao-voltar {
  width: 70px;
  height: 70px;
  background-color: #333;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.botao-voltar:hover {
  background-color: #444;
  transform: scale(1.05);
}

.botao-voltar svg {
  width: 30px;
  height: 30px;
  stroke: white;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

/* ===== TÍTULO DA PÁGINA ===== */
.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 20px 0 40px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* ===== LAYOUT DO CONTEÚDO ===== */
.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* ===== CARD PRINCIPAL ===== */
.detalhes-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ===== CARREGANDO ===== */
.carregando {
  text-align: center;
  color: #ccc;
  padding: 60px 20px;
}

.carregando-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.carregando p {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 600;
}

/* ===== ERRO ===== */
.erro {
  text-align: center;
  color: #ccc;
  padding: 60px 20px;
}

.erro-icon {
  font-size: 4rem;
  color: #f44336;
  margin-bottom: 20px;
}

.erro p {
  font-size: 1.2rem;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.btn-tentar-novamente {
  padding: 12px 24px;
  background: rgba(255, 127, 38, 0.2);
  border: 1px solid rgba(255, 127, 38, 0.5);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-tentar-novamente:hover {
  background: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
}

/* ===== CABEÇALHO DA VENDA ===== */
.venda-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.venda-info {
  flex: 1;
}

.venda-id {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.venda-data {
  font-size: 1rem;
  color: #ccc;
  font-weight: 500;
}

.venda-status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.venda-status.pago {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.venda-status.pendente {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #ff9800;
}

.venda-status.cancelado {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

/* ===== SEÇÕES ===== */
.info-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== GRID DE INFORMAÇÕES ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #ff7f26;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.info-icon {
  font-size: 1.8rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
}

.info-value {
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
}

.info-value.valor-total {
  color: #4caf50;
  font-size: 1.2rem;
}

/* ===== SEÇÃO DE ITENS ===== */
.itens-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.itens-count {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  border-radius: 12px;
}

.itens-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.itens-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 15px;
  padding: 15px 20px;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.item-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-nome {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.item-codigo {
  font-size: 0.8rem;
  color: #888;
  font-family: monospace;
}

.item-quantidade,
.item-preco,
.item-subtotal {
  text-align: right;
  color: white;
  font-weight: 500;
}

.item-preco,
.item-subtotal {
  color: #4caf50;
}

/* ===== SEÇÃO TOTAL ===== */
.total-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.total-content {
  display: flex;
  align-items: center;
  gap: 15px;
  justify-content: center;
}

.total-icon {
  font-size: 2.5rem;
  color: #ff7f26;
}

.total-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.total-label {
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4caf50;
}

/* ===== SEÇÃO DE AÇÕES ===== */
.acoes-section {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-imprimir,
.btn-voltar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-imprimir {
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
}

.btn-imprimir:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 127, 38, 0.3);
}

.btn-voltar {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-voltar:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .detalhes-venda-container {
    padding: 15px;
  }

  .page-title {
    font-size: 2rem;
    margin: 60px 0 30px 0;
  }

  .botao-voltar {
    width: 60px;
    height: 60px;
    top: 15px;
    left: 15px;
  }

  .detalhes-card {
    padding: 20px;
  }

  .venda-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .itens-header,
  .item-row {
    grid-template-columns: 1fr;
    gap: 10px;
    text-align: left;
  }

  .item-quantidade,
  .item-preco,
  .item-subtotal {
    text-align: left;
  }

  .header-quantidade,
  .header-preco,
  .header-subtotal {
    display: none;
  }

  .item-row {
    position: relative;
    padding: 15px;
  }

  .item-row::before {
    content: 'Qtd: ' attr(data-quantidade) ' | Preço: ' attr(data-preco) ' | Subtotal: '
      attr(data-subtotal);
    font-size: 0.8rem;
    color: #888;
    margin-top: 5px;
  }

  .acoes-section {
    flex-direction: column;
  }

  .total-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .total-value {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .venda-id {
    font-size: 1.4rem;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

/* ===== ESTILOS PARA IMPRESSÃO ===== */
@media print {
  /* Esconder elementos não necessários na impressão */
  .botao-voltar,
  .acoes-section,
  .filtros-card,
  .alertas-card {
    display: none !important;
  }

  /* Reset completo para impressão */
  .detalhes-venda-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .page-title {
    color: #000 !important;
    text-shadow: none !important;
    font-size: 24pt !important;
    margin: 20px 0 !important;
    text-align: center !important;
  }

  .content-wrapper {
    max-width: 100% !important;
    margin: 0 !important;
  }

  .detalhes-card {
    background: white !important;
    box-shadow: none !important;
    border: none !important;
    padding: 20px !important;
    backdrop-filter: none !important;
  }

  /* Textos em preto para impressão */
  .venda-id,
  .venda-data,
  .section-title,
  .info-value,
  .item-nome,
  .total-value {
    color: #000 !important;
  }

  .info-label,
  .item-codigo,
  .itens-count {
    color: #666 !important;
  }

  /* Ajustar cards de informação */
  .info-item {
    background: #f8f9fa !important;
    border-left: 4px solid #333 !important;
    color: #000 !important;
  }

  .info-icon {
    color: #333 !important;
  }

  /* Lista de itens */
  .itens-list {
    background: white !important;
    border: 1px solid #ddd !important;
  }

  .itens-header {
    background: #e9ecef !important;
    color: #000 !important;
    font-weight: bold !important;
  }

  .item-row {
    border-bottom: 1px solid #ddd !important;
    color: #000 !important;
  }

  .item-row:hover {
    background: transparent !important;
  }

  /* Status da venda */
  .venda-status {
    background: #f8f9fa !important;
    border: 1px solid #333 !important;
    color: #000 !important;
  }

  /* Seção total */
  .total-section {
    background: #e9ecef !important;
    border: 1px solid #ddd !important;
    color: #000 !important;
  }

  .total-icon {
    color: #333 !important;
  }

  .total-value {
    color: #000 !important;
  }

  /* Garantir que não quebre páginas em lugares ruins */
  .info-section,
  .itens-section {
    page-break-inside: avoid;
  }

  /* Header fixo para cada página */
  @page {
    margin: 2cm;
    size: A4;

    @top-left {
      content: 'Detalhes da Venda';
      font-size: 10pt;
      color: #666;
    }

    @top-right {
      content: 'SystemPOS';
      font-size: 10pt;
      color: #666;
    }

    @bottom-center {
      content: 'Página ' counter(page);
      font-size: 10pt;
      color: #666;
    }
  }

  /* Evitar que o título quebre sozinho */
  .page-title {
    page-break-after: avoid;
  }

  /* Garantir que a lista de itens não quebre no meio */
  .item-row {
    page-break-inside: avoid;
  }
}

/* Melhorar o botão de impressão na tela */
.btn-imprimir {
  position: relative;
}

.btn-imprimir::after {
  content: ' (Ctrl+P)';
  font-size: 0.8em;
  opacity: 0.7;
}

/* Adicionar uma dica visual sobre a impressão */
.detalhes-card {
  position: relative;
}

@media screen and (min-width: 768px) {
  .detalhes-card::before {
    content: '💡 Dica: Use Ctrl+P para imprimir';
    position: absolute;
    top: -10px;
    right: 20px;
    background: rgba(255, 127, 38, 0.2);
    color: #ff7f26;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .detalhes-card:hover::before {
    opacity: 1;
  }
}
</style>
