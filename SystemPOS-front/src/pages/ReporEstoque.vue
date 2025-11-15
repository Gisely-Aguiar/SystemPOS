<template>
  <div class="repor-estoque-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="goHome()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">REPOR ESTOQUE</h1>

    <div class="content-wrapper">
      <!-- Seção de pesquisa e lista -->
      <div class="lista-section">
        <div class="search-card">
          <div class="input-com-icone">
            <svg class="icone-pesquisa" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              v-model="filtro"
              type="text"
              placeholder="Buscar por nome ou código de barras..."
              class="search-input"
            />
          </div>
        </div>

        <div class="produtos-card">
          <h3 class="section-title">Produtos em Estoque</h3>

          <div class="scrollview">
            <div v-if="produtosFiltrados.length === 0" class="sem-produtos">
              <q-icon name="inventory_2" class="sem-produtos-icon" />
              <p>Nenhum produto encontrado</p>
              <span>Tente ajustar os termos da pesquisa</span>
            </div>

            <div v-else class="produtos-list">
              <div
                v-for="produto in produtosFiltrados"
                :key="produto.id_produto"
                class="produto-item"
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
                      <span class="produto-marca">{{ produto.marca }}</span>
                    </div>

                    <div class="info-detalhes">
                      <div class="detalhe-item">
                        <span class="detalhe-label">Estoque Atual:</span>
                        <span class="detalhe-valor estoque">{{ produto.estoque_total }} un</span>
                      </div>
                      <div class="detalhe-item">
                        <span class="detalhe-label">Código:</span>
                        <span class="detalhe-valor codigo">{{ produto.codigo_barras }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="produto-actions">
                    <button class="btn-repor-estoque" @click="Repor(produto)">
                      <q-icon name="add_circle" class="btn-icon" />
                      Repor Estoque
                    </button>
                    <button class="btn-detalhes" @click="goDescricao(produto)">
                      <q-icon name="visibility" class="btn-icon" />
                      Detalhes
                    </button>
                  </div>
                </div>

                <div class="estoque-indicator">
                  <div class="indicator-bar">
                    <div
                      class="indicator-fill"
                      :class="getEstoqueLevel(produto.estoque_total)"
                      :style="{ width: getEstoquePercent(produto.estoque_total) + '%' }"
                    ></div>
                  </div>
                  <span class="indicator-text">{{ getEstoqueText(produto.estoque_total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lista-stats" v-if="produtosFiltrados.length > 0">
            <span class="stat-text">
              {{ produtosFiltrados.length }}
              {{ produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}
            </span>
            <span class="stat-total"> Estoque total: {{ calcularEstoqueTotal() }} unidades </span>
          </div>
        </div>
      </div>

      <!-- Seção informativa -->
      <div class="info-section">
        <div class="info-card">
          <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

          <div class="info-content">
            <h3 class="section-title">Controle de Estoque</h3>

            <div class="info-grid">
              <div class="info-item">
                <q-icon name="inventory" class="info-icon" />
                <div class="info-text">
                  <strong>Reposição Rápida</strong>
                  <span>Adicione novos lotes aos produtos</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="visibility" class="info-icon" />
                <div class="info-text">
                  <strong>Visualização Detalhada</strong>
                  <span>Veja informações completas do produto</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="search" class="info-icon" />
                <div class="info-text">
                  <strong>Busca Inteligente</strong>
                  <span>Encontre produtos por nome ou código</span>
                </div>
              </div>
            </div>

            <div class="estoque-guide">
              <h4 class="guide-title">Níveis de Estoque</h4>
              <div class="guide-items">
                <div class="guide-item">
                  <div class="guide-color baixo"></div>
                  <span>Baixo (≤ 10 unidades)</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color medio"></div>
                  <span>Médio (11-50 unidades)</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color alto"></div>
                  <span>Alto (> 50 unidades)</span>
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
import { reporEstoque } from '../stores/registroProduto.js'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'

const router = useRouter()
const goHome = () => router.push('/home')

const filtro = ref('')
const produtos = ref([])

// ✅ Buscar produtos COM ESTOQUE POR LOTE (somatório)
onMounted(async () => {
  try {
    const empresaId = cadastroFuncionario.value.dadosLogin.codEmpresa

    const response = await axios.get(`http://localhost:3333/produto/RE/${empresaId}`)

    produtos.value = response.data.message
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  }
})

// ✅ Filtro por nome ou código
const produtosFiltrados = computed(() => {
  const texto = filtro.value.toLowerCase()

  return produtos.value.filter((p) => {
    return p.nome?.toLowerCase().includes(texto) || p.codigo_barras?.toString().includes(texto)
  })
})

// ✅ Calcular estoque total
const calcularEstoqueTotal = () => {
  return produtosFiltrados.value.reduce((total, produto) => {
    const valor = parseInt(produto.estoque_total, 10)
    return total + (isNaN(valor) ? 0 : valor)
  }, 0)
}

// ✅ Nível de estoque
const getEstoqueLevel = (estoque) => {
  if (estoque <= 10) return 'baixo'
  if (estoque <= 50) return 'medio'
  return 'alto'
}

// ✅ Percentual de estoque (para barra visual)
const getEstoquePercent = (estoque) => {
  const max = 100 // Considerando 100 como estoque máximo para visualização
  return Math.min((estoque / max) * 100, 100)
}

// ✅ Texto descritivo do estoque
const getEstoqueText = (estoque) => {
  if (estoque <= 10) return 'Estoque Baixo'
  if (estoque <= 50) return 'Estoque Médio'
  return 'Estoque Alto'
}

// ✅ Envia dados para a tela descrição
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

function Repor(produto) {
  reporEstoque.value.dadosEstoque = {
    id: produto.id,
    nome: produto.nome,
    marca: produto.marca,
    imagem: produto.imagem,
    quantidade: produto.estoque_total,
  }
  console.log(reporEstoque.value.dadosEstoque)

  router.push('/reporEstoqueParticular')
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.repor-estoque-container {
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

/* .search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
} */

.input-com-icone {
  position: relative;
  width: 100%;
}

.icone-pesquisa {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  color: #888;
  pointer-events: none;
  transition: color 0.3s ease;
}

.search-input {
  width: 100%;
  height: 60px;
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1.1rem;
  padding: 0 20px 0 55px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #ff7f26;
  background-color: #222;
  box-shadow: 0 0 0 2px rgba(255, 127, 38, 0.1);
}

.search-input:focus + .icone-pesquisa {
  color: #ff7f26;
}

.search-input::placeholder {
  color: #888;
}

.produtos-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.scrollview {
  flex: 1;
  overflow-y: auto;
  padding: 0 25px 25px;
  max-height: 60vh;
}

/* ===== LISTA DE PRODUTOS ===== */
.produtos-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.produto-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.produto-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.produto-content {
  display: flex;
  gap: 20px;
  align-items: center;
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
  gap: 12px;
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

.produto-marca {
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

.detalhe-valor.estoque {
  color: #ff7f26;
}

.detalhe-valor.codigo {
  color: #ccc;
  font-family: monospace;
  font-size: 0.85rem;
}

.produto-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.btn-repor-estoque,
.btn-detalhes {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-repor-estoque {
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
}

.btn-repor-estoque:hover {
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
  font-size: 1.1rem;
}

/* ===== INDICADOR DE ESTOQUE ===== */
.estoque-indicator {
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

.indicator-fill.baixo {
  background: linear-gradient(90deg, #f44336 0%, #e53935 100%);
}

.indicator-fill.medio {
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
}

.indicator-fill.alto {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.indicator-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ccc;
  min-width: 100px;
  text-align: right;
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

/* ===== LISTA STATS ===== */
.lista-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.stat-text {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-total {
  color: #ff7f26;
  font-size: 0.9rem;
  font-weight: 600;
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

/* ===== GUIA DE ESTOQUE ===== */
.estoque-guide {
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

.guide-color.baixo {
  background: linear-gradient(90deg, #f44336 0%, #e53935 100%);
}

.guide-color.medio {
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
}

.guide-color.alto {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.guide-item span {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
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
  .content-wrapper {
    flex-direction: column;
    gap: 30px;
    max-width: 800px;
  }

  .info-section {
    max-width: 100%;
  }

  .produto-content {
    flex-wrap: wrap;
  }

  .produto-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .repor-estoque-container {
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

  .info-detalhes {
    flex-direction: column;
    gap: 8px;
  }

  .estoque-indicator {
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

  .produto-content {
    flex-direction: column;
    text-align: center;
  }

  .produto-actions {
    justify-content: center;
  }

  .lista-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
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
}
</style>
