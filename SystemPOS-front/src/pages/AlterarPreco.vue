<template>
  <div class="alterar-preco-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="goHome()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">ALTERAR PREÇO</h1>

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
          <h3 class="section-title">Produtos Cadastrados</h3>

          <div class="scrollview">
            <div v-if="produtosFiltrados.length === 0" class="sem-produtos">
              <q-icon name="search_off" class="sem-produtos-icon" />
              <p>Nenhum produto encontrado</p>
              <span>Tente ajustar os termos da pesquisa</span>
            </div>

            <div v-else class="produtos-list">
              <div v-for="produto in produtosFiltrados" :key="produto.id" class="produto-item">
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
                        <span class="detalhe-label">Preço:</span>
                        <span class="detalhe-valor preco">R$ {{ produto.preco }}</span>
                      </div>
                      <div class="detalhe-item">
                        <span class="detalhe-label">Estoque:</span>
                        <span class="detalhe-valor">{{ produto.estoque_total }} un</span>
                      </div>
                      <div class="detalhe-item">
                        <span class="detalhe-label">Status:</span>
                        <span :class="['status-badge', produto.ativo === 1 ? 'ativo' : 'inativo']">
                          {{ Ativo(produto) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="produto-actions">
                    <button class="btn-alterar-preco" @click="AlterarPreco(produto)">
                      <q-icon name="edit" class="btn-icon" />
                      Alterar Preço
                    </button>
                    <button class="btn-detalhes" @click="goDescricao(produto)">
                      <q-icon name="visibility" class="btn-icon" />
                      Detalhes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lista-stats" v-if="produtosFiltrados.length > 0">
            <span class="stat-text">
              {{ produtosFiltrados.length }}
              {{ produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Seção de filtros -->
      <div class="filtros-section">
        <div class="filtros-card">
          <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

          <div class="filtros-container">
            <h3 class="section-title">Filtros Rápidos</h3>

            <div class="filtros-list">
              <button class="filtro-btn" @click="prestesAVencer()">
                <q-icon name="schedule" class="filtro-icon" />
                <span>Próximos ao Vencimento</span>
              </button>

              <button class="filtro-btn" @click="filtro = 'recentes'">
                <q-icon name="fiber_new" class="filtro-icon" />
                <span>Adicionados Recentemente</span>
              </button>

              <button class="filtro-btn" @click="filtro = ''">
                <q-icon name="refresh" class="filtro-icon" />
                <span>Limpar Filtros</span>
              </button>
            </div>

            <div class="filtro-ativo" v-if="filtro === 'recentes'">
              <q-icon name="info" class="filtro-info-icon" />
              <span>Mostrando produtos mais recentes</span>
            </div>
          </div>

          <div class="help-section">
            <h4 class="help-title">Como alterar preços?</h4>
            <ul class="help-list">
              <li>Use a barra de pesquisa para encontrar produtos</li>
              <li>Clique em "Alterar Preço" para modificar o valor</li>
              <li>Produtos inativos aparecem em vermelho</li>
            </ul>
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

const filtro = ref('')
const produtos = ref([])

const router = useRouter()
const goHome = () => router.push('/home')
const prestesAVencer = () => router.push('/prestesAVencer')

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/produto/AP/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    // ✅ Agora o Back envia quantidade_total (JOIN com lote_produto)
    produtos.value = response.data.message
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
})

const produtosFiltrados = computed(() => {
  const texto = filtro.value.toLowerCase()
  let lista = produtos.value

  if (texto === 'recentes') {
    return [...lista].sort((a, b) => new Date(b.data_adicao) - new Date(a.data_adicao))
  }

  return lista.filter((produto) => {
    return (
      produto.nome?.toLowerCase().includes(texto) ||
      produto.codigo_barras?.toString().includes(texto)
    )
  })
})

function Ativo(produto) {
  return produto.ativo === 1 ? 'Ativo' : 'Inativo'
}

async function AlterarPreco(produto) {
  reporEstoque.value.dadosPromocao = {
    nome: produto.nome,
    marca: produto.marca,
    imagem: produto.imagem,
    preco: produto.preco,
    codigo_barras: produto.codigo_barras,
    id: produto.id,
  }

  router.push('/alterarPrecoParticular')
}

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
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.alterar-preco-container {
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
  gap: 15px;
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

.detalhe-valor.preco {
  color: #ff7f26;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.ativo {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-badge.inativo {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.produto-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.btn-alterar-preco,
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

.btn-alterar-preco {
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
}

.btn-alterar-preco:hover {
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
  padding: 15px 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.stat-text {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== SEÇÃO DE FILTROS ===== */
.filtros-section {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.filtros-card {
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

.filtros-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filtros-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filtro-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.filtro-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff7f26;
  transform: translateY(-2px);
}

.filtro-icon {
  font-size: 1.3rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.filtro-ativo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: rgba(255, 127, 38, 0.1);
  border: 1px solid #ff7f26;
  border-radius: 8px;
  color: #ff7f26;
  font-size: 0.9rem;
  font-weight: 500;
}

.filtro-info-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* ===== SEÇÃO DE AJUDA ===== */
.help-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #ff7f26;
}

.help-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
}

.help-list {
  margin: 0;
  padding-left: 20px;
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
}

.help-list li {
  margin-bottom: 8px;
}

.help-list li:last-child {
  margin-bottom: 0;
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

  .filtros-section {
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
  .alterar-preco-container {
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

  .filtros-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .filtro-btn {
    flex: 1;
    min-width: 200px;
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

  .filtro-btn {
    min-width: 100%;
  }

  .logo {
    width: 150px;
  }
}
</style>
