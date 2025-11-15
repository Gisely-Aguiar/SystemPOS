<template>
  <div class="descricao-produto-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">DETALHES DO PRODUTO</h1>

    <div class="content-wrapper">
      <!-- Seção do produto -->
      <div class="produto-section">
        <div class="produto-card">
          <div class="produto-header">
            <h2 class="produto-nome">{{ produto.nome }}</h2>
            <button class="btn-delete-produto" @click="confirmarExcluirProduto">
              <q-icon name="delete" class="delete-icon" />
              Excluir Produto
            </button>
          </div>

          <div class="produto-imagem-container">
            <img :src="produto.imagem" :alt="produto.nome" class="produto-imagem" />
          </div>

          <div class="produto-stats">
            <div class="stat-item">
              <span class="stat-label">Estoque Total</span>
              <span class="stat-value">{{ quantidadeTotal }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Preço</span>
              <span class="stat-value preco">R$ {{ produto.preco }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de informações -->
      <div class="info-section">
        <div class="info-card">
          <h3 class="section-title">Informações do Produto</h3>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Marca:</span>
              <span class="info-value">{{ produto.marca }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">{{ produto.tipo_produto }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Modelo:</span>
              <span class="info-value">{{ produto.modelo || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código de Barras:</span>
              <span class="info-value">{{ produto.codigo_barras }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Código do Produto:</span>
              <span class="info-value">{{ produto.codigo_produto }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Categoria:</span>
              <span class="info-value">{{ produto.categoria }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Validade Mais Próxima:</span>
              <span class="info-value validade">
                {{
                  validadeMaisProxima
                    ? new Date(validadeMaisProxima).toLocaleDateString('pt-BR')
                    : '—'
                }}
              </span>
            </div>
          </div>

          <div class="lotes-section">
            <h3 class="section-title">Lotes do Produto</h3>

            <div v-if="lotes.length === 0" class="sem-lotes">
              <q-icon name="inventory_2" class="sem-lotes-icon" />
              <p>Nenhum lote cadastrado</p>
            </div>

            <div v-else class="lotes-list">
              <div v-for="l in lotes" :key="l.id" class="lote-item">
                <div class="lote-info">
                  <div class="lote-header">
                    <span class="lote-numero">Lote: {{ l.numero_lote }}</span>
                    <button class="btn-delete-lote" @click="confirmarExcluirLote(l.id_lote)">
                      <q-icon name="close" />
                    </button>
                  </div>
                  <div class="lote-detalhes">
                    <span class="lote-validade">
                      Validade: {{ new Date(l.data_validade).toLocaleDateString('pt-BR') }}
                    </span>
                    <span class="lote-quantidade">Quantidade: {{ l.quantidade }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="mensagem" class="modal-overlay">
      <div class="modal-confirmacao">
        <div class="modal-header">
          <h3>Confirmação</h3>
        </div>

        <div class="modal-content">
          <p>{{ mensagem }}</p>
        </div>

        <div class="modal-actions">
          <template v-if="confirmacao">
            <button class="modal-btn cancelar" @click="cancelarConfirmacao">Cancelar</button>
            <button class="modal-btn confirmar" @click="acaoConfirmada">Confirmar</button>
          </template>
          <template v-else>
            <button class="modal-btn confirmar" @click="mensagem = ''">Fechar</button>
          </template>
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
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'

const router = useRouter()

// ✅ Estados
const mensagem = ref('')
const confirmacao = ref(false)
const acaoConfirmada = ref(null)

const produto = ref({})
const lotes = ref([])
const quantidadeTotal = ref(0)
const validadeMaisProxima = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/produto/COD/${reporEstoque.value.dadosDescricao.codigo_produto}/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    const data = response.data

    if (!data.message || data.message.length === 0) {
      mensagem.value = 'Produto não encontrado.'
      return
    }

    const produtoApi = data.message[0]

    produto.value = produtoApi
    quantidadeTotal.value = produtoApi.estoque_total
    validadeMaisProxima.value = produtoApi.validade_proxima

    const lotesResponse = await axios.get(`http://localhost:3333/produto/lotes/${produtoApi.id}`)
    lotes.value = lotesResponse.data.message || []
  } catch (error) {
    console.error(error)
    mensagem.value = 'Erro ao buscar dados do produto.'
  }
})

// ✅ SISTEMA DE CONFIRMAÇÃO CUSTOMIZADA
function abrirConfirmacao(texto, acao) {
  mensagem.value = texto
  confirmacao.value = true
  acaoConfirmada.value = acao
}

function cancelarConfirmacao() {
  mensagem.value = ''
  confirmacao.value = false
  acaoConfirmada.value = null
}

// ✅ Confirma excluir lote
function confirmarExcluirLote(id) {
  abrirConfirmacao('Deseja realmente excluir este lote?', () => excluirLote(id))
}

// ✅ Confirma excluir produto inteiro
function confirmarExcluirProduto() {
  abrirConfirmacao('Deseja EXCLUIR o produto COMPLETO e TODOS os lotes?', () => excluirProduto())
}

// ✅ EXCLUIR LOTE
async function excluirLote(idLote) {
  cancelarConfirmacao()

  try {
    await axios.delete(`http://localhost:3333/produto/lote/${idLote}`)

    lotes.value = lotes.value.filter((l) => l.id !== idLote)
    quantidadeTotal.value = lotes.value.reduce((s, l) => s + l.quantidade, 0)

    mensagem.value = 'Lote excluído com sucesso!'
  } catch (err) {
    console.error(err)
    mensagem.value = 'Erro ao excluir lote.'
  }
}

// ✅ EXCLUIR PRODUTO COMPLETO
async function excluirProduto() {
  cancelarConfirmacao()

  try {
    await axios.delete(
      `http://localhost:3333/produto/${produto.value.codigo_produto}/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    mensagem.value = 'Produto excluído com sucesso!'
    setTimeout(() => router.push('/telaInicial'), 1000)
  } catch (err) {
    console.error(err)
    mensagem.value = 'Erro ao excluir produto.'
  }
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.descricao-produto-container {
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
  max-width: 1200px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  min-height: 600px;
}

/* ===== SEÇÃO DO PRODUTO ===== */
.produto-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.produto-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.produto-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.produto-nome {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.btn-delete-produto {
  background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.btn-delete-produto:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
}

.delete-icon {
  font-size: 1.2rem;
}

.produto-imagem-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.produto-imagem {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.produto-stats {
  display: flex;
  gap: 20px;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #ccc;
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.stat-value.preco {
  color: #ff7f26;
}

/* ===== SEÇÃO DE INFORMAÇÕES ===== */
.info-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
  border-bottom: 2px solid #ff7f26;
  padding-bottom: 10px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-weight: 600;
  color: #ccc;
  font-size: 0.95rem;
}

.info-value {
  color: white;
  font-weight: 500;
  text-align: right;
}

.info-value.validade {
  color: #ff7f26;
  font-weight: 600;
}

/* ===== SEÇÃO DE LOTES ===== */
.lotes-section {
  margin-top: 10px;
}

.sem-lotes {
  text-align: center;
  color: #888;
  padding: 40px 20px;
}

.sem-lotes-icon {
  font-size: 3rem;
  color: #666;
  margin-bottom: 15px;
}

.sem-lotes p {
  margin: 0;
  font-size: 1rem;
}

.lotes-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}

.lotes-list::-webkit-scrollbar {
  width: 6px;
}

.lotes-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.lotes-list::-webkit-scrollbar-thumb {
  background: #ff7f26;
  border-radius: 3px;
}

.lote-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  transition: all 0.3s ease;
}

.lote-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 127, 38, 0.3);
}

.lote-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.lote-numero {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

.btn-delete-lote {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-delete-lote:hover {
  background: #cc0000;
  transform: scale(1.1);
}

.lote-detalhes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.lote-validade {
  color: #ff7f26;
  font-weight: 500;
}

.lote-quantidade {
  color: #ccc;
  font-weight: 500;
}

/* ===== MODAL DE CONFIRMAÇÃO ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal-confirmacao {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 0;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  background: #ff7f26;
  padding: 20px;
  text-align: center;
}

.modal-header h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.modal-content {
  padding: 30px 20px;
  text-align: center;
}

.modal-content p {
  color: white;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 15px;
  padding: 0 20px 20px;
}

.modal-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.cancelar {
  background: #666;
  color: white;
}

.modal-btn.cancelar:hover {
  background: #777;
}

.modal-btn.confirmar {
  background: #4caf50;
  color: white;
}

.modal-btn.confirmar:hover {
  background: #45a049;
  transform: translateY(-2px);
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 30px;
    max-width: 600px;
    align-items: center;
  }

  .produto-card,
  .info-card {
    width: 100%;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .descricao-produto-container {
    padding: 15px;
  }

  .page-title {
    font-size: 2rem;
    margin: 60px 0 30px 0;
  }

  .produto-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .produto-stats {
    flex-direction: column;
    gap: 15px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .botao-voltar {
    width: 60px;
    height: 60px;
    top: 15px;
    left: 15px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .produto-card,
  .info-card {
    padding: 20px 15px;
  }

  .produto-nome {
    font-size: 1.5rem;
  }

  .produto-imagem-container {
    height: 250px;
  }

  .lote-detalhes {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
