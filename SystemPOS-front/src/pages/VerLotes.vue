<template>
  <div class="lotes-produto-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">LOTES DO PRODUTO</h1>

    <!-- Card do produto -->
    <div class="produto-card">
      <div class="produto-header">
        <img :src="produtoSelecionado.imagem" class="produto-imagem" />
        <div class="produto-info">
          <h2 class="produto-nome">{{ produtoSelecionado.nome }}</h2>
          <div class="produto-detalhes">
            <div class="detalhe-item">
              <q-icon name="qr_code" class="detalhe-icon" />
              <span class="detalhe-texto">
                <strong>Código de barras:</strong> {{ produtoSelecionado.codigo_barras }}
              </span>
            </div>
            <div class="detalhe-item">
              <q-icon name="event" class="detalhe-icon" />
              <span class="detalhe-texto">
                <strong>Validade mais próxima:</strong>
                {{ formatarData(produtoSelecionado.validade_proxima) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de lotes -->
    <div class="lotes-section">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="inventory_2" class="section-icon" />
          Lotes em Estoque
        </h3>
        <span class="lotes-count">{{ lotes.length }} lote{{ lotes.length !== 1 ? 's' : '' }}</span>
      </div>

      <div class="lotes-scrollview">
        <!-- Lista de lotes -->
        <div v-if="Array.isArray(lotes) && lotes.length > 0" class="lotes-list">
          <div class="lote-card" v-for="lote in lotes" :key="lote.id_lote">
            <div class="lote-header">
              <div class="lote-numero">
                <q-icon name="tag" class="lote-icon" />
                <span class="lote-texto">Lote #{{ lote.numero_lote }}</span>
              </div>
              <div class="status-badge" :class="getStatus(lote).cor">
                {{ getStatus(lote).texto }}
              </div>
            </div>

            <div class="lote-content">
              <div class="lote-info-grid">
                <div class="info-item">
                  <q-icon name="calendar_today" class="info-icon" />
                  <div class="info-content">
                    <span class="info-label">Validade</span>
                    <span class="info-value">{{ formatarData(lote.data_validade) }}</span>
                  </div>
                </div>

                <div class="info-item">
                  <q-icon name="inventory" class="info-icon" />
                  <div class="info-content">
                    <span class="info-label">Quantidade</span>
                    <span class="info-value quantidade">{{ lote.quantidade }} unidades</span>
                  </div>
                </div>
              </div>

              <!-- Barra de progresso visual -->
              <div class="lote-indicator">
                <div class="indicator-bar">
                  <div
                    class="indicator-fill"
                    :class="getStatus(lote).cor"
                    :style="{ width: getQuantidadePercent(lote) + '%' }"
                  ></div>
                </div>
                <span class="indicator-text">Estoque: {{ lote.quantidade }} unidades</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vazio -->
        <div v-else class="empty-state">
          <q-icon name="inventory_2" class="empty-icon" />
          <h3 class="empty-title">Nenhum lote encontrado</h3>
          <p class="empty-description">Não há lotes cadastrados para este produto.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { reporEstoque } from '../stores/registroProduto.js'

const router = useRouter()
const lotes = ref([])

const produtoSelecionado = reporEstoque.value.produtoSelecionado ?? {}

function formatarData(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

function getStatus(lote) {
  const hoje = new Date()
  const validade = new Date(lote.data_validade)
  const diasRestantes = (validade - hoje) / (1000 * 60 * 60 * 24)

  if (diasRestantes < 0) return { texto: 'Vencido', cor: 'vencido' }
  if (diasRestantes <= 30) return { texto: 'Perto do vencimento', cor: 'alerta' }
  return { texto: 'Dentro da validade', cor: 'ok' }
}

function getQuantidadePercent(lote) {
  const max = 100 // Valor máximo para visualização
  return Math.min((lote.quantidade / max) * 100, 100)
}

async function buscarLotes() {
  try {
    const response = await axios.get(
      `http://localhost:3333/produto/lotes/${produtoSelecionado.id_produto}`,
    )

    lotes.value = response.data.message ?? []
  } catch (err) {
    console.error('Erro ao buscar lotes:', err)
    lotes.value = []
  }
}

onMounted(() => {
  if (!produtoSelecionado.id_produto) {
    console.error('Nenhum produto selecionado!')
    router.back()
    return
  }

  buscarLotes()
})
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.lotes-produto-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  color: white;
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

/* ===== CARD DO PRODUTO ===== */
.produto-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.produto-header {
  display: flex;
  align-items: center;
  gap: 25px;
}

.produto-imagem {
  width: 150px;
  height: 150px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.produto-info {
  flex: 1;
}

.produto-nome {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.produto-detalhes {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detalhe-icon {
  font-size: 1.3rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.detalhe-texto {
  color: #ccc;
  font-size: 1.1rem;
  line-height: 1.4;
}

/* ===== SEÇÃO DE LOTES ===== */
.lotes-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.section-icon {
  font-size: 1.6rem;
  color: #ff7f26;
}

.lotes-count {
  background: rgba(255, 127, 38, 0.2);
  color: #ff7f26;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* ===== SCROLLVIEW ===== */
.lotes-scrollview {
  flex: 1;
  overflow-y: auto;
  padding: 0 30px 30px;
}

/* ===== LISTA DE LOTES ===== */
.lotes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lote-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 25px;
  transition: all 0.3s ease;
}

.lote-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.lote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.lote-numero {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lote-icon {
  font-size: 1.3rem;
  color: #ff7f26;
}

.lote-texto {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.ok {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.status-badge.alerta {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.status-badge.vencido {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

/* ===== CONTEÚDO DO LOTE ===== */
.lote-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.lote-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #ff7f26;
}

.info-icon {
  font-size: 1.3rem;
  color: #ff7f26;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.85rem;
  color: #ccc;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
}

.info-value.quantidade {
  color: #ff7f26;
}

/* ===== INDICADOR DE ESTOQUE ===== */
.lote-indicator {
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
}

.indicator-fill.ok {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.indicator-fill.alerta {
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
}

.indicator-fill.vencido {
  background: linear-gradient(90deg, #f44336 0%, #e53935 100%);
}

.indicator-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ccc;
  min-width: 140px;
  text-align: right;
}

/* ===== ESTADO VAZIO ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.empty-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ccc;
  margin: 0 0 10px 0;
}

.empty-description {
  font-size: 1rem;
  color: #777;
  margin: 0;
}

/* ===== SCROLLBAR PERSONALIZADA ===== */
.lotes-scrollview::-webkit-scrollbar {
  width: 8px;
}

.lotes-scrollview::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.lotes-scrollview::-webkit-scrollbar-thumb {
  background: #ff7f26;
  border-radius: 4px;
}

.lotes-scrollview::-webkit-scrollbar-thumb:hover {
  background: #e67322;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .produto-header {
    flex-direction: column;
    text-align: center;
  }

  .produto-imagem {
    width: 120px;
    height: 120px;
  }

  .lote-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lotes-produto-container {
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

  .produto-card {
    padding: 20px;
  }

  .produto-nome {
    font-size: 1.6rem;
  }

  .lotes-section {
    height: 500px;
  }

  .section-header {
    padding: 20px;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .lotes-scrollview {
    padding: 0 20px 20px;
  }

  .lote-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .lote-indicator {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .indicator-text {
    text-align: left;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .produto-imagem {
    width: 100px;
    height: 100px;
  }

  .produto-nome {
    font-size: 1.4rem;
  }

  .lote-card {
    padding: 20px;
  }
}
</style>
