<template>
  <div class="alterar-preco-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">ALTERAR PREÇO</h1>

    <div class="content-wrapper">
      <!-- Seção do produto -->
      <div class="produto-card">
        <h1 class="section-title">{{ dadosPromocao.nome }}</h1>
        <div class="produto-imagem-container">
          <img :src="dadosPromocao.imagem" :alt="dadosPromocao.nome" class="produto-imagem" />
        </div>
      </div>

      <!-- Seção de formulário -->
      <div class="form-card">
        <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

        <div class="precos-container">
          <div class="preco-group">
            <label class="input-label">Valor atual:</label>
            <div class="preco-atual">R$ {{ dadosPromocao.preco }}</div>
          </div>

          <div class="preco-group">
            <label class="input-label">Novo valor:</label>
            <div class="input-com-simbolo">
              <span class="simbolo-moeda">R$</span>
              <input
                class="text-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                v-model="novaEntrada"
                @keyup.enter="abrirModalConfirmacao"
              />
            </div>
          </div>
        </div>

        <div class="btn-container">
          <UiButton
            label="Aplicar Novo Preço"
            class="confirmar-btn"
            @click="abrirModalConfirmacao"
            :disabled="!novaEntrada || isNaN(novaEntrada)"
          />
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="modalConfirmacaoAberto" class="modal-overlay">
      <div class="modal-confirmacao">
        <div class="modal-header">
          <h2>Confirmar Alteração de Preço</h2>
          <button class="fechar-modal" @click="fecharModalConfirmacao">×</button>
        </div>

        <div class="modal-content">
          <div class="produto-info">
            <img :src="dadosPromocao.imagem" :alt="dadosPromocao.nome" class="modal-imagem" />
            <h3>{{ dadosPromocao.nome }}</h3>
          </div>

          <div class="precos-comparacao">
            <div class="preco-antigo">
              <span class="preco-label">Valor Antigo:</span>
              <span class="preco-valor antigo">R$ {{ dadosPromocao.preco }}</span>
            </div>

            <div class="seta">↓</div>

            <div class="preco-novo">
              <span class="preco-label">Novo Valor:</span>
              <span class="preco-valor novo">R$ {{ novaEntrada }}</span>
            </div>
          </div>

          <div class="diferenca">
            <span class="diferenca-label">Diferença:</span>
            <span class="diferenca-valor" :class="diferencaClasse">
              {{ calcularDiferenca() }}
            </span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="modal-btn cancelar" @click="fecharModalConfirmacao">Cancelar</button>
          <button class="modal-btn confirmar" @click="confirmarAlteracao">
            Confirmar Alteração
          </button>
        </div>
      </div>
    </div>

    <!-- Mensagem de Alerta -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { reporEstoque } from '../stores/registroProduto.js'
import { UiButton } from '../components/index.js'

const router = useRouter()
const dadosPromocao = reporEstoque.value.dadosPromocao
const novaEntrada = ref('')
const modalConfirmacaoAberto = ref(false)
const mensagem = ref('')
const isLoading = ref(false)

const abrirModalConfirmacao = () => {
  if (!novaEntrada.value || isNaN(novaEntrada.value)) {
    mensagem.value = 'Digite um valor válido para o novo preço.'
    return
  }
  modalConfirmacaoAberto.value = true
}

const fecharModalConfirmacao = () => {
  modalConfirmacaoAberto.value = false
}

// Calcular diferença entre preços
const calcularDiferenca = () => {
  const antigo = parseFloat(dadosPromocao.preco)
  const novo = parseFloat(novaEntrada.value)
  const diferenca = novo - antigo
  const percentual = ((diferenca / antigo) * 100).toFixed(1)

  if (diferenca > 0) {
    return `+R$ ${Math.abs(diferenca).toFixed(2)} (+${percentual}%)`
  } else if (diferenca < 0) {
    return `-R$ ${Math.abs(diferenca).toFixed(2)} (-${percentual}%)`
  } else {
    return 'Sem alteração'
  }
}

// Classe CSS para a diferença (positiva/negativa)
const diferencaClasse = computed(() => {
  const antigo = parseFloat(dadosPromocao.preco)
  const novo = parseFloat(novaEntrada.value)
  const diferenca = novo - antigo

  if (diferenca > 0) return 'positivo'
  if (diferenca < 0) return 'negativo'
  return 'neutro'
})

const confirmarAlteracao = async () => {
  if (isLoading.value) return

  isLoading.value = true
  mensagem.value = ''

  try {
    const produtoId = dadosPromocao.id

    if (!produtoId) {
      mensagem.value = 'Erro: Dados insuficientes para alterar o preço.'
      return
    }

    const payload = {
      preco: Number(novaEntrada.value),
    }

    await axios.put(`http://localhost:3333/produto/AP/${produtoId}`, payload)

    // Fechar modal e mostrar mensagem de sucesso
    modalConfirmacaoAberto.value = false
    mensagem.value = 'Preço alterado com sucesso!'

    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push('/alterarPreco')
    }, 2000)
  } catch (error) {
    console.error('Erro ao alterar preço:', error)
    mensagem.value = 'Erro ao alterar o preço. Tente novamente.'
    modalConfirmacaoAberto.value = false
  } finally {
    isLoading.value = false
  }
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
  min-height: 500px;
}

/* ===== CARDS LADO A LADO ===== */
.produto-card,
.form-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 500px;
}

.produto-card {
  justify-content: flex-start;
}

.form-card {
  justify-content: space-between;
  gap: 30px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 30px;
  border-bottom: 2px solid #ff7f26;
  padding-bottom: 10px;
  text-align: center;
  word-break: break-word;
}

.produto-imagem-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  padding: 20px;
  flex-shrink: 0;
}

.produto-imagem {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 10px;
  flex-shrink: 0;
}

/* ===== CONTAINER DE PREÇOS ===== */
.precos-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 25px;
  flex: 1;
  justify-content: center;
}

.preco-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
}

.preco-atual {
  background: rgba(255, 127, 38, 0.1);
  border: 2px solid #ff7f26;
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff7f26;
  text-align: center;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== INPUT COM SÍMBOLO DE MOEDA ===== */
.input-com-simbolo {
  position: relative;
  width: 100%;
}

.simbolo-moeda {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  font-weight: 600;
  color: #888;
  z-index: 2;
}

.text-input {
  width: 100%;
  height: 60px;
  border: 2px solid #333;
  font-size: 1.2rem;
  padding: 0 20px 0 50px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-weight: 600;
}

/* ===== BOTÃO CONFIRMAR ===== */
.btn-container {
  width: 100%;
  margin-top: auto;
  flex-shrink: 0;
}

.confirmar-btn {
  width: 100%;
  background-color: #ff7f26;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 65px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.confirmar-btn:hover:not(:disabled) {
  background-color: #e67322;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

.confirmar-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  border-radius: 20px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  background: #ff7f26;
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.fechar-modal {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.fechar-modal:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 30px;
}

.produto-info {
  text-align: center;
  margin-bottom: 30px;
}

.modal-imagem {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 15px;
  border: 2px solid #333;
}

.produto-info h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.precos-comparacao {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.preco-antigo,
.preco-novo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
}

.preco-antigo {
  background: rgba(255, 127, 38, 0.1);
  border: 1px solid #ff7f26;
}

.preco-novo {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
}

.preco-label {
  color: #ccc;
  font-weight: 600;
}

.preco-valor {
  font-size: 1.3rem;
  font-weight: 700;
}

.preco-valor.antigo {
  color: #ff7f26;
}

.preco-valor.novo {
  color: #4caf50;
}

.seta {
  text-align: center;
  color: #666;
  font-size: 1.5rem;
  margin: 5px 0;
}

.diferenca {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid #333;
}

.diferenca-label {
  color: #ccc;
  font-weight: 600;
}

.diferenca-valor {
  font-weight: 700;
  font-size: 1.1rem;
}

.diferenca-valor.positivo {
  color: #4caf50;
}

.diferenca-valor.negativo {
  color: #f44336;
}

.diferenca-valor.neutro {
  color: #ff9800;
}

.modal-actions {
  display: flex;
  gap: 15px;
  padding: 0 30px 30px;
}

.modal-btn {
  flex: 1;
  padding: 15px 20px;
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

/* ===== MENSAGEM DE ALERTA ===== */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  max-width: 90%;
}

.botao-fechar {
  background: white;
  color: #4caf50;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.botao-fechar:hover {
  background: #f0f0f0;
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
  .form-card {
    width: 100%;
    max-width: 500px;
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

  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .modal-confirmacao {
    width: 95%;
    margin: 20px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-header {
    padding: 20px;
  }
}
</style>
