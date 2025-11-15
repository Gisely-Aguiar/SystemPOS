<template>
  <div class="historico-vendas-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="voltar" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">HISTÓRICO DE VENDAS</h1>

    <div class="content-wrapper">
      <!-- Seção de filtros e lista -->
      <div class="lista-section">
        <div class="filtros-card">
          <!-- Novo Sistema de Filtros -->
          <div class="filtros-grid">
            <!-- Filtro de Período -->
            <div class="filtro-group">
              <label class="filtro-label">Período</label>
              <div class="filtro-buttons">
                <button
                  v-for="opcao in opcoesFiltro"
                  :key="opcao.valor"
                  class="filtro-btn"
                  :class="{ active: filtroAtual === opcao.valor }"
                  @click="aplicarFiltro(opcao.valor)"
                >
                  <q-icon :name="opcao.icone" class="filtro-icon" />
                  <span>{{ opcao.texto }}</span>
                </button>
              </div>
            </div>

            <!-- Filtro de Data Personalizada -->
            <div class="filtro-group">
              <label class="filtro-label">Data Personalizada</label>
              <div class="date-inputs">
                <div class="date-input">
                  <q-icon name="calendar_today" class="date-icon" />
                  <input
                    type="date"
                    v-model="dataInicio"
                    class="date-picker"
                    @change="aplicarFiltroPersonalizado"
                  />
                </div>
                <span class="date-separator">até</span>
                <div class="date-input">
                  <q-icon name="calendar_today" class="date-icon" />
                  <input
                    type="date"
                    v-model="dataFim"
                    class="date-picker"
                    @change="aplicarFiltroPersonalizado"
                  />
                </div>
              </div>
            </div>

            <!-- Filtro de Forma de Pagamento -->
          </div>

          <!-- Botões de Ação -->
          <div class="filtros-actions">
            <button class="btn-limpar" @click="limparFiltros">
              <q-icon name="clear_all" class="btn-icon" />
              Limpar Filtros
            </button>
            <button class="btn-recarregar" @click="buscarVendas">
              <q-icon name="refresh" class="btn-icon" />
              Atualizar
            </button>
          </div>
        </div>

        <!-- Status dos Filtros Ativos -->
        <div v-if="filtrosAtivos.length > 0" class="filtros-ativos">
          <span class="filtros-label">Filtros ativos:</span>
          <div class="filtros-chips">
            <div v-for="filtro in filtrosAtivos" :key="filtro" class="filtro-chip">
              <span>{{ filtro }}</span>
              <button @click="removerFiltro(filtro)" class="chip-remove">
                <q-icon name="close" />
              </button>
            </div>
          </div>
        </div>

        <div class="vendas-card">
          <div class="card-header">
            <h3 class="section-title">Histórico de Vendas</h3>
            <div class="resultados-info">
              <span class="total-vendas">{{ totalVendas }} vendas</span>
              <span class="valor-total">Total: R$ {{ valorTotalPeriodo.toFixed(2) }}</span>
            </div>
          </div>

          <div class="scrollview">
            <div v-if="carregando" class="carregando">
              <q-icon name="refresh" class="carregando-icon" />
              <p>Carregando vendas...</p>
            </div>

            <div v-else-if="historico_vendas.length === 0" class="sem-vendas">
              <q-icon name="receipt" class="sem-vendas-icon" />
              <p>Nenhuma venda encontrada</p>
              <span>Não há vendas registradas para os filtros selecionados</span>
            </div>

            <div v-else class="vendas-list">
              <div v-for="(grupo, index) in historico_vendas" :key="index">
                <div class="dataGrupo">{{ grupo.titulo }}</div>

                <div
                  v-for="(venda, idx) in grupo.vendas"
                  :key="idx"
                  class="venda-item"
                  @click="verDetalhesVenda(venda)"
                >
                  <div class="venda-content">
                    <div class="venda-info">
                      <div class="info-main">
                        <h4 class="venda-id">#{{ venda.vendaId.toString().padStart(3, '0') }}</h4>
                        <span class="venda-data">{{ formatarDataHora(venda.dataHora) }}</span>
                      </div>

                      <div class="info-detalhes">
                        <div class="detalhe-item">
                          <span class="detalhe-label">Valor Total:</span>
                          <span class="detalhe-valor valor">{{ venda.valorTotal }}</span>
                        </div>
                        <div class="detalhe-item">
                          <span class="detalhe-label">Forma de Pagamento:</span>
                          <span class="detalhe-valor pagamento">{{
                            formatarFormaPagamento(venda.formaPagamento)
                          }}</span>
                        </div>
                        <div class="detalhe-item">
                          <span class="detalhe-label">Itens Vendidos:</span>
                          <span class="detalhe-valor itens">
                            {{ venda.totalItens }} {{ venda.totalItens === 1 ? 'item' : 'itens' }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="venda-actions">
                      <div class="status-badge" :class="getPagamentoClass(venda.formaPagamento)">
                        {{ formatarFormaPagamento(venda.formaPagamento) }}
                      </div>
                      <button class="btn-detalhes" @click.stop="verDetalhesVenda(venda)">
                        <q-icon name="visibility" class="btn-icon" />
                        Detalhes
                      </button>
                    </div>
                  </div>

                  <div class="venda-indicator">
                    <div class="indicator-bar">
                      <div
                        class="indicator-fill"
                        :class="getPagamentoClass(venda.formaPagamento)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção informativa -->
      <div class="info-section">
        <div class="info-card">
          <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

          <div class="info-content">
            <h3 class="section-title">Controle de Vendas</h3>

            <div class="info-grid">
              <div class="info-item">
                <q-icon name="analytics" class="info-icon" />
                <div class="info-text">
                  <strong>Filtros Avançados</strong>
                  <span>Filtre por período, data e forma de pagamento</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="date_range" class="info-icon" />
                <div class="info-text">
                  <strong>Período Personalizado</strong>
                  <span>Selecione datas específicas</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="credit_card" class="info-icon" />
                <div class="info-text">
                  <strong>Múltiplos Filtros</strong>
                  <span>Combine diferentes critérios</span>
                </div>
              </div>
            </div>

            <div class="vendas-guide">
              <h4 class="guide-title">Formas de Pagamento</h4>
              <div class="guide-items">
                <div class="guide-item">
                  <div class="guide-color dinheiro"></div>
                  <span>Dinheiro</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color cartao"></div>
                  <span>Cartão</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color pix"></div>
                  <span>PIX</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color vale"></div>
                  <span>Vale</span>
                </div>
              </div>
            </div>

            <div class="periodo-info">
              <h4 class="info-title">Período Selecionado</h4>
              <div class="periodo-content">
                <q-icon name="calendar_month" class="periodo-icon" />
                <div class="periodo-text">
                  <strong>{{ periodoSelecionadoTexto }}</strong>
                  <span>{{ totalVendas }} vendas encontradas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'

export default {
  name: 'ListarVendas',
  data() {
    return {
      historico_vendas: [],
      filtroAtual: 'Hoje',
      filtroPagamento: null,
      dataInicio: null,
      dataFim: null,
      carregando: false,
      jsonData: null,
      opcoesFiltro: [
        { valor: 'Hoje', texto: 'Hoje', icone: 'today' },
        { valor: 'Dia', texto: 'Últimos 7 dias', icone: 'date_range' },
        { valor: 'Mes', texto: 'Este mês', icone: 'calendar_month' },
        { valor: 'Todos', texto: 'Todos', icone: 'all_inclusive' },
      ],
      formasPagamento: [
        { valor: 'dinheiro', texto: 'Dinheiro' },
        { valor: 'cartao', texto: 'Cartão' },
        { valor: 'pix', texto: 'PIX' },
        { valor: 'vale', texto: 'Vale' },
        { valor: 'conta', texto: 'Conta' },
      ],
    }
  },

  mounted() {
    this.buscarVendas()
  },

  computed: {
    totalVendas() {
      if (!this.historico_vendas.length) return 0
      return this.historico_vendas.reduce((total, grupo) => total + grupo.vendas.length, 0)
    },

    valorTotalPeriodo() {
      if (!this.historico_vendas.length) return 0
      let total = 0
      this.historico_vendas.forEach((grupo) => {
        grupo.vendas.forEach((venda) => {
          const valor = parseFloat(venda.valorTotal.replace('R$', '').replace(',', '.').trim())
          total += isNaN(valor) ? 0 : valor
        })
      })
      return total
    },

    filtrosAtivos() {
      const filtros = []

      // Filtro de período
      if (this.filtroAtual !== 'Todos') {
        const periodo = this.opcoesFiltro.find((op) => op.valor === this.filtroAtual)
        if (periodo) filtros.push(periodo.texto)
      }

      // Filtro de pagamento
      if (this.filtroPagamento) {
        const pagamento = this.formasPagamento.find((fp) => fp.valor === this.filtroPagamento)
        if (pagamento) filtros.push(pagamento.texto)
      }

      // Filtro de data personalizada
      if (this.dataInicio && this.dataFim) {
        filtros.push('Data Personalizada')
      }

      return filtros
    },

    periodoSelecionadoTexto() {
      if (this.dataInicio && this.dataFim) {
        return `De ${this.formatarData(this.dataInicio)} até ${this.formatarData(this.dataFim)}`
      }

      const opcao = this.opcoesFiltro.find((o) => o.valor === this.filtroAtual)
      return opcao ? opcao.texto : 'Todos'
    },
  },

  methods: {
    getFiltroTexto(filtro) {
      const opcao = this.opcoesFiltro.find((o) => o.valor === filtro)
      return opcao ? opcao.texto : filtro
    },

    getPagamentoClass(formaPagamento) {
      const classes = {
        dinheiro: 'dinheiro',
        pix: 'pix',
        cartao_credito: 'cartao',
        cartao_debito: 'cartao',
        vale_alimentacao: 'vale',
        vale_refeicao: 'vale',
        conta_cliente: 'conta',
      }
      return classes[formaPagamento] || 'default'
    },

    aplicarFiltro(filtro) {
      this.filtroAtual = filtro
      this.dataInicio = null
      this.dataFim = null
      this.filtrarVendas()
    },

    aplicarFiltroPagamento(pagamento) {
      this.filtroPagamento = this.filtroPagamento === pagamento ? null : pagamento
      this.filtrarVendas()
    },

    aplicarFiltroPersonalizado() {
      if (this.dataInicio && this.dataFim) {
        this.filtroAtual = 'Personalizado'
        this.filtrarVendas()
      }
    },

    filtrarVendas() {
      if (!this.jsonData) return

      let historicoArray = Object.entries(this.jsonData).map(([data, vendas]) => ({
        data,
        vendas,
      }))

      // Aplicar filtro de período
      if (this.filtroAtual !== 'Personalizado' && this.filtroAtual !== 'Todos') {
        historicoArray = this.aplicarFiltroPeriodo(historicoArray)
      }

      // Aplicar filtro de data personalizada
      if (this.dataInicio && this.dataFim) {
        historicoArray = this.aplicarFiltroDataPersonalizada(historicoArray)
      }

      // Aplicar filtro de forma de pagamento
      if (this.filtroPagamento) {
        historicoArray = this.aplicarFiltroPagamentoArray(historicoArray)
      }

      // Formatar resultado
      const resultado = historicoArray.map((g) => ({
        titulo: this.formatarData(g.data),
        vendas: g.vendas,
      }))

      this.historico_vendas = resultado.filter((grupo) => grupo.vendas.length > 0)
    },

    aplicarFiltroPeriodo(historicoArray) {
      const hoje = new Date()
      let resultado = [...historicoArray]

      if (this.filtroAtual === 'Hoje') {
        const dataHoje = hoje.toISOString().split('T')[0]
        resultado = historicoArray.filter((g) => g.data === dataHoje)
      } else if (this.filtroAtual === 'Dia') {
        const semana = new Date(hoje)
        semana.setDate(hoje.getDate() - 7)
        resultado = historicoArray.filter((g) => new Date(g.data) >= semana)
      } else if (this.filtroAtual === 'Mes') {
        const mes = hoje.getMonth()
        const ano = hoje.getFullYear()
        resultado = historicoArray.filter((g) => {
          const d = new Date(g.data)
          return d.getMonth() === mes && d.getFullYear() === ano
        })
      }

      return resultado
    },

    aplicarFiltroDataPersonalizada(historicoArray) {
      const inicio = new Date(this.dataInicio)
      const fim = new Date(this.dataFim)
      fim.setHours(23, 59, 59, 999) // Incluir todo o dia final

      return historicoArray.filter((g) => {
        const dataVenda = new Date(g.data)
        return dataVenda >= inicio && dataVenda <= fim
      })
    },

    aplicarFiltroPagamentoArray(historicoArray) {
      return historicoArray.map((grupo) => ({
        ...grupo,
        vendas: grupo.vendas.filter((venda) => {
          const classePagamento = this.getPagamentoClass(venda.formaPagamento)
          return classePagamento === this.filtroPagamento
        }),
      }))
    },

    limparFiltros() {
      this.filtroAtual = 'Todos'
      this.filtroPagamento = null
      this.dataInicio = null
      this.dataFim = null
      this.filtrarVendas()
    },

    removerFiltro(filtro) {
      if (filtro === 'Data Personalizada') {
        this.dataInicio = null
        this.dataFim = null
        this.filtroAtual = 'Todos'
      } else {
        // Verifica se é um filtro de período
        const periodo = this.opcoesFiltro.find((op) => op.texto === filtro)
        if (periodo) {
          this.filtroAtual = 'Todos'
        } else {
          // É um filtro de pagamento
          this.filtroPagamento = null
        }
      }
      this.filtrarVendas()
    },

    async buscarVendas() {
      try {
        this.carregando = true

        const empresaId = cadastroFuncionario.value?.dadosLogin?.codEmpresa

        if (!empresaId) {
          alert('Erro: Empresa não identificada.')
          return
        }

        const res = await axios.get(`http://localhost:3333/historico-vendas/${empresaId}`)
        this.jsonData = res.data
        this.filtrarVendas()
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
        this.historico_vendas = []
      } finally {
        this.carregando = false
      }
    },

    verDetalhesVenda(venda) {
      const empresaId = cadastroFuncionario.value?.dadosLogin?.codEmpresa

      if (!empresaId || !venda.vendaId) {
        alert('Erro ao abrir detalhes.')
        return
      }

      this.$router.push(`/detalhes-venda/${Number(venda.vendaId)}/${Number(empresaId)}`)
    },

    formatarData(data) {
      if (!data) return 'N/A'
      const [ano, mes, dia] = data.split('-')
      return `${dia}/${mes}/${ano}`
    },

    formatarDataHora(dataHora) {
      if (!dataHora) return 'N/A'

      if (dataHora.includes('/')) return dataHora

      const d = new Date(dataHora)
      if (isNaN(d.getTime())) return 'Data inválida'

      const dia = String(d.getDate()).padStart(2, '0')
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const ano = d.getFullYear()

      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')

      return `${dia}/${mes}/${ano} ${hh}:${mm}`
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
      }
      return formas[forma] || forma
    },

    voltar() {
      this.$router.back()
    },
  },
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.historico-vendas-container {
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
  display: flex;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  min-height: 600px;
}

/* ===== SEÇÃO DA LISTA ===== */
.lista-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== NOVO SISTEMA DE FILTROS ===== */
.filtros-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.filtro-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filtro-label {
  color: white;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 5px;
}

.filtro-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filtro-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
  justify-content: center;
}

.filtro-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 127, 38, 0.3);
}

.filtro-btn.active {
  background: rgba(255, 127, 38, 0.2);
  border-color: #ff7f26;
  color: white;
}

.filtro-icon {
  font-size: 1.1rem;
}

/* Date Inputs */
.date-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  position: relative;
  flex: 1;
}

.date-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 1.1rem;
  z-index: 2;
}

.date-picker {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.date-picker:focus {
  outline: none;
  border-color: #ff7f26;
  background: rgba(255, 255, 255, 0.08);
}

.date-separator {
  color: #888;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Filtros de Pagamento */
.pagamento-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagamento-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ccc;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagamento-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.pagamento-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: currentColor;
}

.pagamento-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.pagamento-color.dinheiro {
  background: #4caf50;
}
.pagamento-color.cartao {
  background: #2196f3;
}
.pagamento-color.pix {
  background: #32cd32;
}
.pagamento-color.vale {
  background: #ff9800;
}
.pagamento-color.conta {
  background: #9c27b0;
}

/* Ações dos Filtros */
.filtros-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.btn-limpar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-limpar:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-recarregar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-recarregar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 127, 38, 0.3);
}

/* Filtros Ativos */
.filtros-ativos {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filtros-label {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.filtros-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filtro-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 127, 38, 0.2);
  border: 1px solid rgba(255, 127, 38, 0.5);
  border-radius: 16px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Card Header Melhorado */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.resultados-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.total-vendas {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.valor-total {
  color: #ff7f26;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Botão Limpar Filtros no Estado Vazio */
.btn-limpar-filtros {
  margin-top: 15px;
  padding: 10px 20px;
  background: rgba(255, 127, 38, 0.2);
  border: 1px solid rgba(255, 127, 38, 0.5);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-limpar-filtros:hover {
  background: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
}

/* ===== RESTANTE DO CSS PERMANECE IGUAL ===== */
.vendas-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 1;
}

.scrollview {
  min-height: 100vh;
  flex: 1;
  overflow-y: auto;
  padding: 0 25px 25px;
  max-height: 60vh;
  position: relative;
  z-index: 1;
}

/* ===== LISTA DE VENDAS ===== */
.vendas-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dataGrupo {
  color: #fff;
  font-weight: bold;
  margin: 20px 0 10px 0;
  font-size: 1.3rem;
  padding-bottom: 5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

.venda-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.venda-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.venda-content {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
}

.venda-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.venda-id {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.venda-data {
  font-size: 0.95rem;
  color: #ccc;
  font-weight: 500;
}

.info-detalhes {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detalhe-label {
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
}

.detalhe-valor {
  font-size: 0.95rem;
  color: white;
  font-weight: 600;
}

.detalhe-valor.valor {
  color: #4caf50;
}

.detalhe-valor.pagamento {
  color: #ff7f26;
}

.detalhe-valor.itens {
  color: #2196f3;
}

.venda-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.dinheiro {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-badge.cartao {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid #2196f3;
}

.status-badge.pix {
  background: rgba(50, 205, 50, 0.2);
  color: #32cd32;
  border: 1px solid #32cd32;
}

.status-badge.vale {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #ff9800;
}

.status-badge.conta {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid #9c27b0;
}

.status-badge.default {
  background: rgba(136, 136, 136, 0.2);
  color: #888;
  border: 1px solid #888;
}

.btn-detalhes {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-detalhes:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* ===== INDICADOR DE VENDA ===== */
.venda-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.indicator-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 100%;
}

.indicator-fill.dinheiro {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.indicator-fill.cartao {
  background: linear-gradient(90deg, #2196f3 0%, #0b7dda 100%);
}

.indicator-fill.pix {
  background: linear-gradient(90deg, #32cd32 0%, #2ca02c 100%);
}

.indicator-fill.vale {
  background: linear-gradient(90deg, #ff9800 0%, #e68900 100%);
}

.indicator-fill.conta {
  background: linear-gradient(90deg, #9c27b0 0%, #7b1fa2 100%);
}

.indicator-fill.default {
  background: linear-gradient(90deg, #888 0%, #666 100%);
}

/* ===== ESTADOS DE CARREGAMENTO E SEM VENDAS ===== */
.carregando {
  text-align: center;
  color: #888;
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
  margin: 0 0 10px 0;
  font-weight: 600;
}

.sem-vendas {
  text-align: center;
  color: #888;
  padding: 60px 20px;
}

.sem-vendas-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
}

.sem-vendas p {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.sem-vendas span {
  font-size: 0.95rem;
  color: #777;
}

/* ===== SEÇÃO INFORMATIVA ===== */
.info-section {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.logo {
  width: 180px;
  height: auto;
  align-self: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid #ff7f26;
}

.info-icon {
  font-size: 1.5rem;
  color: #ff7f26;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-text strong {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.info-text span {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* ===== GUIA DE VENDAS ===== */
.vendas-guide {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.guide-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  text-align: center;
}

.guide-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.guide-color {
  width: 20px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.guide-color.dinheiro {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.guide-color.cartao {
  background: linear-gradient(90deg, #2196f3 0%, #0b7dda 100%);
}

.guide-color.pix {
  background: linear-gradient(90deg, #32cd32 0%, #2ca02c 100%);
}

.guide-color.vale {
  background: linear-gradient(90deg, #ff9800 0%, #e68900 100%);
}

.guide-item span {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== PERÍODO INFO ===== */
.periodo-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  text-align: center;
}

.periodo-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.periodo-icon {
  font-size: 2rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.periodo-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.periodo-text strong {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.periodo-text span {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 1.4;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 30px;
    max-width: 800px;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .info-section {
    max-width: 100%;
  }

  .venda-content {
    flex-wrap: wrap;
  }

  .venda-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .historico-vendas-container {
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

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .resultados-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .info-detalhes {
    flex-direction: column;
    gap: 8px;
  }

  .venda-indicator {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .filtros-actions {
    flex-direction: column;
  }

  .filtros-ativos {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .venda-content {
    flex-direction: column;
    text-align: center;
  }

  .venda-actions {
    justify-content: center;
  }

  .logo {
    width: 150px;
  }

  .guide-items {
    gap: 8px;
  }

  .guide-item span {
    font-size: 0.8rem;
  }

  .periodo-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .date-inputs {
    flex-direction: column;
    gap: 8px;
  }

  .date-separator {
    display: none;
  }
}
</style>
