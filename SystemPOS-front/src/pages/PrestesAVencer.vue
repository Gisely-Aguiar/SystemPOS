<template>
  <div class="prestes-vencer-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="goHome()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">PRODUTOS PRÓXIMOS DO VENCIMENTO</h1>

    <div class="content-wrapper">
      <!-- Sistema de Filtros Simplificado -->
      <div class="filtros-card">
        <div class="filtro-group">
          <label class="filtro-label">Período de Vencimento</label>
          <div class="filtro-buttons">
            <button
              v-for="opcao in opcoesDias"
              :key="opcao.valor"
              class="filtro-btn"
              :class="{ active: diasLimite === opcao.valor }"
              @click="aplicarFiltroDias(opcao.valor)"
            >
              <q-icon :name="opcao.icone" class="filtro-icon" />
              <span>{{ opcao.texto }}</span>
            </button>
          </div>
        </div>

        <!-- Botões de Ação -->
        <div class="filtros-actions">
          <button class="btn-recarregar" @click="buscarProdutos">
            <q-icon name="refresh" class="btn-icon" />
            Atualizar
          </button>
        </div>
      </div>

      <!-- Estatísticas e Alertas -->
      <div class="header-section">
        <div class="stats-card">
          <div class="stats-header">
            <q-icon name="analytics" class="stats-icon" />
            <h3 class="stats-title">Estatísticas</h3>
          </div>

          <div class="stats-content">
            <div class="stat-item">
              <span class="stat-label">Produtos encontrados:</span>
              <span class="stat-value">{{ produtos.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Período selecionado:</span>
              <span class="stat-value periodo">{{ diasLimite }} dias</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Status geral:</span>
              <span class="stat-value status" :style="{ color: statusGeralCor }">
                {{ statusGeralTexto }}
              </span>
            </div>
          </div>
        </div>

        <div class="alertas-card">
          <div class="alerta-header">
            <q-icon name="warning" class="alerta-icon" />
            <h3 class="alerta-title">Alertas de Vencimento</h3>
          </div>

          <div class="alertas-list">
            <div class="alerta-item critico" v-if="produtosCriticos.length > 0">
              <span class="alerta-text"
                >{{ produtosCriticos.length }} produtos CRÍTICOS (≤ 7 dias)</span
              >
            </div>
            <div class="alerta-item atencao" v-if="produtosAtencao.length > 0">
              <span class="alerta-text"
                >{{ produtosAtencao.length }} produtos em ATENÇÃO (8-15 dias)</span
              >
            </div>
            <div class="alerta-item normal" v-if="produtosNormais.length > 0">
              <span class="alerta-text"
                >{{ produtosNormais.length }} produtos MONITORADOS (16-30 dias)</span
              >
            </div>
            <div class="alerta-item longo" v-if="produtosLongoPrazo.length > 0">
              <span class="alerta-text"
                >{{ produtosLongoPrazo.length }} produtos LONGO PRAZO (> 30 dias)</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de produtos -->
      <div class="produtos-section">
        <div class="produtos-card">
          <div class="produtos-header">
            <h3 class="section-title">Produtos Próximos do Vencimento</h3>
            <div class="resultados-info">
              <span class="total-produtos">{{ produtos.length }} produtos</span>
              <span class="filtro-ativo">{{ periodoAtivoTexto }}</span>
            </div>
          </div>

          <div class="scrollview">
            <div v-if="produtos.length === 0" class="sem-produtos">
              <q-icon name="event_available" class="sem-produtos-icon" />
              <p>Nenhum produto próximo do vencimento</p>
              <span>Todos os produtos estão com validade dentro do período seguro</span>
            </div>

            <div v-else class="produtos-list">
              <div
                v-for="produto in produtos"
                :key="produto.id_produto"
                class="produto-item"
                :class="getStatusClass(produto)"
              >
                <div class="produto-content">
                  <img
                    :src="produto.imagem"
                    :alt="produto.nome"
                    @click="goDescricao(produto)"
                    class="produto-imagem"
                  />

                  <div class="produto-info">
                    <div class="info-main">
                      <h4 class="produto-nome">{{ produto.nome }}</h4>
                      <span class="produto-codigo">Cód: {{ produto.codigo_barras }}</span>
                    </div>

                    <div class="info-detalhes">
                      <div class="detalhe-item">
                        <q-icon name="calendar_today" class="detalhe-icon" />
                        <div class="detalhe-content">
                          <span class="detalhe-label">Validade Mais Próxima:</span>
                          <span class="detalhe-valor data">{{
                            formatarData(produto.validade_proxima)
                          }}</span>
                        </div>
                      </div>

                      <div class="detalhe-item">
                        <q-icon name="inventory" class="detalhe-icon" />
                        <div class="detalhe-content">
                          <span class="detalhe-label">Estoque Total:</span>
                          <span class="detalhe-valor">{{ produto.estoque_total }} unidades</span>
                        </div>
                      </div>

                      <div class="detalhe-item">
                        <q-icon name="access_time" class="detalhe-icon" />
                        <div class="detalhe-content">
                          <span class="detalhe-label">Dias Restantes:</span>
                          <span class="detalhe-valor dias" :class="getDiasClass(produto)">
                            {{ calcularDiasRestantes(produto) }} dias
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="produto-actions">
                    <div class="status-badge" :class="getStatus(produto).cor">
                      {{ getStatus(produto).texto }}
                    </div>

                    <div class="action-buttons">
                      <button
                        v-if="getStatus(produto).proximo"
                        class="btn-ver-lotes"
                        @click="VerLotes(produto)"
                      >
                        <q-icon name="list_alt" class="btn-icon" />
                        Ver Lotes
                      </button>
                      <button class="btn-detalhes" @click="goDescricao(produto)">
                        <q-icon name="visibility" class="btn-icon" />
                        Detalhes
                      </button>
                    </div>
                  </div>
                </div>

                <div class="timeline-indicator">
                  <div class="timeline-bar">
                    <div
                      class="timeline-progress"
                      :class="getStatus(produto).cor"
                      :style="{ width: calcularProgresso(produto) + '%' }"
                    ></div>
                  </div>
                  <div class="timeline-labels">
                    <span>Hoje</span>
                    <span>{{ formatarData(produto.validade_proxima) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'
import { reporEstoque } from '../stores/registroProduto.js'

const router = useRouter()

const goHome = () => router.push('/home')

const produtos = ref([])
const diasLimite = ref(30)

// Opções de filtro - CORRIGIDO
const opcoesDias = [
  { valor: 7, texto: '7 dias (Crítico)', icone: 'warning' },
  { valor: 15, texto: '15 dias (Atenção)', icone: 'schedule' },
  { valor: 30, texto: '30 dias (Monitorar)', icone: 'visibility' },
  { valor: 60, texto: '60 dias (Preventivo)', icone: 'calendar_today' },
]

// Computed properties - CORRIGIDO
const produtosCriticos = computed(() => produtos.value.filter((p) => calcularDiasRestantes(p) <= 7))

const produtosAtencao = computed(() =>
  produtos.value.filter((p) => calcularDiasRestantes(p) > 7 && calcularDiasRestantes(p) <= 15),
)

const produtosNormais = computed(() =>
  produtos.value.filter((p) => calcularDiasRestantes(p) > 15 && calcularDiasRestantes(p) <= 30),
)

const produtosLongoPrazo = computed(() =>
  produtos.value.filter((p) => calcularDiasRestantes(p) > 30),
)

const statusGeralTexto = computed(() => {
  if (produtosCriticos.value.length > 0) return 'Crítico'
  if (produtosAtencao.value.length > 0) return 'Atenção'
  if (produtosNormais.value.length > 0) return 'Monitorado'
  if (produtosLongoPrazo.value.length > 0) return 'Seguro'
  return 'Sem produtos'
})

// CORRIGIDO - Função para determinar cor do status geral
const statusGeralCor = computed(() => {
  if (produtosCriticos.value.length > 0) return '#f44336' // Vermelho
  if (produtosAtencao.value.length > 0) return '#ff9800' // Laranja
  if (produtosNormais.value.length > 0) return '#2196f3' // Azul
  if (produtosLongoPrazo.value.length > 0) return '#4caf50' // Verde
  return '#888' // Cinza para sem produtos
})

const periodoAtivoTexto = computed(() => {
  const dias = opcoesDias.find((op) => op.valor === diasLimite.value)
  return dias ? dias.texto : '30 dias'
})

// Métodos
function aplicarFiltroDias(valor) {
  diasLimite.value = valor
  buscarProdutos()
}

function formatarData(date) {
  return new Date(date).toLocaleDateString('pt-BR')
}

// Calcular dias restantes
function calcularDiasRestantes(produto) {
  const hoje = new Date()
  const validade = new Date(produto.validade_proxima)
  const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24))
  return Math.max(0, diasRestantes)
}

// Calcular progresso para a barra de timeline
function calcularProgresso(produto) {
  const diasRestantes = calcularDiasRestantes(produto)
  return Math.max(0, Math.min(100, ((diasLimite.value - diasRestantes) / diasLimite.value) * 100))
}

function getStatus(produto) {
  const diasRestantes = calcularDiasRestantes(produto)

  if (diasRestantes <= 0) {
    return { texto: 'VENCIDO', cor: 'vencido', proximo: true }
  } else if (diasRestantes <= 7) {
    return { texto: 'CRÍTICO', cor: 'critico', proximo: true }
  } else if (diasRestantes <= 15) {
    return { texto: 'ATENÇÃO', cor: 'atencao', proximo: true }
  } else if (diasRestantes <= 30) {
    return { texto: 'MONITORAR', cor: 'normal', proximo: false }
  } else {
    return { texto: 'LONGO PRAZO', cor: 'longo', proximo: false }
  }
}

// Classes para o item do produto
function getStatusClass(produto) {
  return getStatus(produto).cor
}

// Classes para os dias restantes
function getDiasClass(produto) {
  const diasRestantes = calcularDiasRestantes(produto)
  if (diasRestantes <= 0) return 'vencido'
  if (diasRestantes <= 7) return 'critico'
  if (diasRestantes <= 15) return 'atencao'
  if (diasRestantes <= 30) return 'normal'
  return 'longo'
}

async function buscarProdutos() {
  try {
    const empresaId = cadastroFuncionario.value.dadosLogin.codEmpresa
    const response = await axios.get(
      `http://localhost:3333/produto/PV/${empresaId}/${diasLimite.value}`,
    )

    produtos.value = response.data.message
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
  }
}

onMounted(() => {
  buscarProdutos()
})

function goDescricao(produto) {
  reporEstoque.value.dadosDescricao = {
    id_produto: produto.id_produto,
    validade: produto.validade_proxima,
    nome: produto.nome,
    quantidade: produto.estoque_total,
    imagem: produto.imagem,
    codigo_barras: produto.codigo_barras,
    codigo_produto: produto.codigo_produto,
  }

  router.push('/descricaoDetalhada')
}

function VerLotes(produto) {
  reporEstoque.value.produtoSelecionado = {
    id_produto: produto.id_produto,
    nome: produto.nome,
    imagem: produto.imagem,
    precoAtual: produto.preco,
    codigo_barras: produto.codigo_barras,
    validade_proxima: produto.validade_proxima,
  }

  router.push('/VerLotes')
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.prestes-vencer-container {
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
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* ===== SISTEMA DE FILTROS SIMPLIFICADO ===== */
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

/* Ações dos Filtros */
.filtros-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
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

/* ===== HEADER SECTION ===== */
.header-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.stats-card,
.alertas-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.stats-header,
.alerta-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.stats-icon,
.alerta-icon {
  font-size: 1.8rem;
  color: #ff7f26;
}

.stats-title,
.alerta-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.stat-value.periodo {
  color: #ff7f26;
}

/* ===== ALERTAS CARD ===== */
.alertas-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alerta-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.alerta-item.critico {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  color: #f44336;
}

.alerta-item.atencao {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid #ff9800;
  color: #ff9800;
}

.alerta-item.normal {
  background: rgba(33, 150, 243, 0.2);
  border: 1px solid #2196f3;
  color: #2196f3;
}

.alerta-item.longo {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #4caf50;
}

/* ===== PRODUTOS SECTION ===== */
.produtos-section {
  width: 100%;
}

.produtos-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.produtos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.resultados-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.total-produtos {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.filtro-ativo {
  color: #ff7f26;
  font-size: 0.9rem;
  font-weight: 600;
}

/* ===== SCROLLVIEW ===== */
.scrollview {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 25px 25px;
}

/* ===== LISTA DE PRODUTOS ===== */
.produtos-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.produto-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.produto-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Classes de status para os itens */
.produto-item.vencido {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.produto-item.critico {
  border-left-color: #f44336;
  background: rgba(244, 67, 54, 0.05);
}

.produto-item.atencao {
  border-left-color: #ff9800;
  background: rgba(255, 152, 0, 0.05);
}

.produto-item.normal {
  border-left-color: #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

.produto-item.longo {
  border-left-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.produto-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 15px;
}

.produto-imagem {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
  flex-shrink: 0;
}

.produto-imagem:hover {
  border-color: #ff7f26;
}

.produto-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.produto-nome {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.produto-codigo {
  font-size: 0.9rem;
  color: #ccc;
  font-family: monospace;
}

.info-detalhes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detalhe-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detalhe-icon {
  font-size: 1.1rem;
  color: #ff7f26;
  margin-top: 2px;
  flex-shrink: 0;
}

.detalhe-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detalhe-label {
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
}

.detalhe-valor {
  font-size: 0.95rem;
  color: white;
  font-weight: 600;
}

.detalhe-valor.data {
  color: #ff7f26;
}

.detalhe-valor.dias {
  font-weight: 700;
}

.detalhe-valor.dias.vencido {
  color: #f44336;
}

.detalhe-valor.dias.critico {
  color: #f44336;
}

.detalhe-valor.dias.atencao {
  color: #ff9800;
}

.detalhe-valor.dias.normal {
  color: #2196f3;
}

.detalhe-valor.dias.longo {
  color: #4caf50;
}

/* ===== AÇÕES DO PRODUTO ===== */
.produto-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-shrink: 0;
  min-width: 150px;
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

.status-badge.vencido {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.status-badge.critico {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.status-badge.atencao {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid #ff9800;
}

.status-badge.normal {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid #2196f3;
}

.status-badge.longo {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-ver-lotes,
.btn-detalhes {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  justify-content: center;
}

.btn-ver-lotes {
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
}

.btn-ver-lotes:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 127, 38, 0.3);
}

.btn-detalhes {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-detalhes:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 0.9rem;
}

/* ===== TIMELINE INDICATOR ===== */
.timeline-indicator {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.timeline-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.timeline-progress.vencido {
  background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
}

.timeline-progress.critico {
  background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
}

.timeline-progress.atencao {
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
}

.timeline-progress.normal {
  background: linear-gradient(90deg, #2196f3 0%, #0b7dda 100%);
}

.timeline-progress.longo {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
}

/* ===== SEM PRODUTOS ===== */
.sem-produtos {
  text-align: center;
  color: #888;
  padding: 60px 20px;
}

.sem-produtos-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
}

.sem-produtos p {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.sem-produtos span {
  font-size: 0.95rem;
  color: #777;
}

/* ===== SCROLLBAR PERSONALIZADA ===== */
.scrollview::-webkit-scrollbar {
  width: 8px;
}

.scrollview::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb {
  background: #ff7f26;
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb:hover {
  background: #e67322;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .header-section {
    grid-template-columns: 1fr;
  }

  .produtos-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .resultados-info {
    align-self: stretch;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .prestes-vencer-container {
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

  .produto-content {
    flex-direction: column;
    text-align: center;
  }

  .produto-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    flex-direction: row;
  }

  .filtros-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .stat-item {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-ver-lotes,
  .btn-detalhes {
    width: 100%;
  }

  .filtro-buttons {
    flex-direction: column;
  }

  .resultados-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>
