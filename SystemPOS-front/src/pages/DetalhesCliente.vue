<template>
  <div class="detalhes-cliente-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">DETALHES DO CLIENTE</h1>

    <div class="content-wrapper">
      <!-- Card principal de informações -->
      <div class="info-card principal">
        <div class="card-header">
          <div class="avatar-cliente">
            <q-icon name="person" class="avatar-icon" />
          </div>
          <div class="cliente-titulo">
            <h2 class="cliente-nome">{{ nome_completo }}</h2>
            <span class="cliente-status">Cliente Ativo</span>
          </div>
          <button class="btn-editar" @click="editarCliente">
            <q-icon name="edit" class="btn-icon" />
            Editar
          </button>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <q-icon name="badge" class="info-icon" />
            <div class="info-content">
              <span class="info-label">CPF</span>
              <span class="info-value">{{ cpf }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="phone" class="info-icon" />
            <div class="info-content">
              <span class="info-label">Telefone</span>
              <span class="info-value">{{ telefone }}</span>
            </div>
          </div>

          <div class="info-item full-width">
            <q-icon name="email" class="info-icon" />
            <div class="info-content">
              <span class="info-label">Email</span>
              <span class="info-value">{{ email }}</span>
            </div>
          </div>

          <div class="info-item full-width">
            <q-icon name="location_on" class="info-icon" />
            <div class="info-content">
              <span class="info-label">Endereço</span>
              <span class="info-value">{{ endereco }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card de saldo -->
      <div class="info-card saldo">
        <div class="card-header">
          <q-icon name="account_balance_wallet" class="card-icon saldo" />
          <h3 class="card-title">Saldo Disponível</h3>
        </div>

        <div class="saldo-content">
          <div class="saldo-valor">R$ {{ saldoFormatado }}</div>
          <div class="saldo-actions">
            <button class="btn-adicionar-saldo" @click="abrirModalSaldo">
              <q-icon name="add" class="btn-icon" />
              Adicionar Saldo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar Saldo -->
    <div v-if="modalAberto" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Adicionar Saldo</h2>
          <button class="btn-fechar-modal" @click="fecharModal">
            <q-icon name="close" />
          </button>
        </div>

        <div class="modal-content">
          <div class="cliente-info-modal">
            <div class="avatar-cliente-modal">
              <q-icon name="person" class="avatar-icon-modal" />
            </div>
            <div class="cliente-detalhes-modal">
              <h3 class="cliente-nome-modal">{{ nome_completo }}</h3>
              <span class="cliente-cpf-modal">CPF: {{ cpf }}</span>
              <div class="saldo-atual-modal">
                <span class="saldo-label">Saldo atual:</span>
                <span class="saldo-valor-modal">R$ {{ saldoFormatado }}</span>
              </div>
            </div>
          </div>

          <div class="form-adicionar-saldo">
            <div class="input-group">
              <label class="input-label">Valor a Adicionar (R$)</label>
              <input
                v-model="valorAdicionar"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                class="valor-input"
                @keyup.enter="confirmarAdicaoSaldo"
              />
            </div>

            <div class="saldo-futuro">
              <span class="saldo-futuro-label">Saldo após adição:</span>
              <span class="saldo-futuro-valor">R$ {{ saldoFuturo }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancelar" @click="fecharModal">Cancelar</button>
          <button
            class="btn-confirmar"
            @click="confirmarAdicaoSaldo"
            :disabled="!valorAdicionar || Number(valorAdicionar) <= 0"
          >
            <q-icon name="check" class="btn-icon" />
            Confirmar Adição
          </button>
        </div>
      </div>
    </div>

    <!-- Loading e erro -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Carregando dados do cliente...</span>
    </div>

    <div v-if="erro" class="erro-mensagem">
      <q-icon name="error" class="erro-icon" />
      <span>{{ erro }}</span>
    </div>

    <!-- Mensagem de sucesso -->
    <div v-if="mensagemSucesso" class="mensagem-sucesso">
      <q-icon name="check_circle" class="sucesso-icon" />
      <span>{{ mensagemSucesso }}</span>
      <button @click="mensagemSucesso = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { cliente } from 'src/stores/registroCliente.js'

const router = useRouter()
const clientes = ref(null)

const nome_completo = computed(() => clientes.value?.nome_completo || '')
const cpf = computed(() => clientes.value?.cpf || '')
const telefone = computed(() => clientes.value?.telefone || '')
const email = computed(() => clientes.value?.email || '')
const endereco = computed(() => clientes.value?.endereco || '')

const loading = ref(true)
const erro = ref('')
const modalAberto = ref(false)
const valorAdicionar = ref('')
const mensagemSucesso = ref('')

async function carregarCliente() {
  try {
    const id = cliente.value.dados.id
    const { data } = await axios.get(`http://localhost:3333/clientes/detalhe/${id}`)
    clientes.value = data
  } catch (error) {
    erro.value = 'Erro ao carregar dados do cliente.'
    console.error('Erro:', error)
  } finally {
    loading.value = false
  }
}

const saldoFormatado = computed(() => {
  const valor = Number(clientes.value?.saldo || 0)
  return valor.toFixed(2)
})

const saldoFuturo = computed(() => {
  const saldoAtual = Number(clientes.value?.saldo || 0)
  const adicional = Number(valorAdicionar.value || 0)
  return (saldoAtual + adicional).toFixed(2)
})

function editarCliente() {
  console.log('Editar cliente:', clientes.value)
  router.push('/EditarCliente')
}

function abrirModalSaldo() {
  modalAberto.value = true
  valorAdicionar.value = ''
}

function fecharModal() {
  modalAberto.value = false
  valorAdicionar.value = ''
}

async function confirmarAdicaoSaldo() {
  if (!valorAdicionar.value || Number(valorAdicionar.value) <= 0) {
    return
  }

  try {
    const id = cliente.value.dados.id
    const valor = Number(valorAdicionar.value)

    // Aqui você faria a chamada API para atualizar o saldo
    await axios.post(`http://localhost:3333/clientes/credito/${id}`, {
      valor: valor,
    })

    // Atualiza localmente (remova isso quando implementar a API)
    if (clientes.value) {
      clientes.value.saldo = Number(clientes.value.saldo) + valor
    }

    mensagemSucesso.value = `Saldo de R$ ${valor.toFixed(2)} adicionado com sucesso!`
    fecharModal()
  } catch (error) {
    console.error('Erro ao adicionar saldo:', error)
    erro.value = 'Erro ao adicionar saldo. Tente novamente.'
  }
}

onMounted(carregarCliente)
</script>

<style scoped>
.detalhes-cliente-container {
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

/* ===== LAYOUT DO CONTEÚDO ===== */
.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: stretch;
  min-height: 400px;
}

/* ===== CARDS PRINCIPAIS ===== */
.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* ===== HEADER DOS CARDS ===== */
.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.avatar-cliente {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  font-size: 2rem;
  color: white;
}

.cliente-titulo {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.cliente-nome {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.cliente-status {
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  align-self: flex-start;
}

.card-icon {
  font-size: 1.8rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.card-icon.saldo {
  color: #4caf50;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

/* ===== BOTÃO EDITAR ===== */
.btn-editar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-editar:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ff7f26;
  transform: translateY(-2px);
}

/* ===== GRID DE INFORMAÇÕES ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #ff7f26;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.info-item.full-width {
  grid-column: 1 / -1;
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
  gap: 5px;
  flex: 1;
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
  word-break: break-word;
}

/* ===== CARD DE SALDO ===== */
.saldo-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.saldo-valor {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4caf50;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
  margin-bottom: 10px;
}

.saldo-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 200px;
}

.btn-adicionar-saldo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  width: 100%;
}

.btn-adicionar-saldo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ===== MODAL ADICIONAR SALDO ===== */
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

.modal-container {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px;
  border-bottom: 1px solid #333;
  background: rgba(255, 255, 255, 0.05);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.btn-fechar-modal {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.btn-fechar-modal:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 30px;
}

.cliente-info-modal {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #4caf50;
}

.avatar-cliente-modal {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon-modal {
  font-size: 1.5rem;
  color: white;
}

.cliente-detalhes-modal {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.cliente-nome-modal {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.cliente-cpf-modal {
  font-size: 0.9rem;
  color: #ccc;
}

.saldo-atual-modal {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.saldo-label {
  font-size: 0.9rem;
  color: #888;
}

.saldo-valor-modal {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4caf50;
}

.form-adicionar-saldo {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.valor-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #333;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.valor-input:focus {
  outline: none;
  border-color: #4caf50;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.valor-input::placeholder {
  color: #666;
}

.saldo-futuro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4caf50;
  border-radius: 10px;
}

.saldo-futuro-label {
  font-size: 1rem;
  color: #ccc;
  font-weight: 500;
}

.saldo-futuro-valor {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4caf50;
}

.modal-actions {
  display: flex;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid #333;
  background: rgba(255, 255, 255, 0.05);
}

.btn-cancelar {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #666;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #888;
}

.btn-confirmar {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirmar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-confirmar:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ===== MENSAGEM DE SUCESSO ===== */
.mensagem-sucesso {
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

.sucesso-icon {
  font-size: 1.5rem;
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

/* ===== LOADING E ERRO ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  z-index: 9999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ff7f26;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.erro-mensagem {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
}

.erro-icon {
  font-size: 2rem;
  color: #f44336;
}

.erro-mensagem span {
  color: white;
  font-weight: 600;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .detalhes-cliente-container {
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .cliente-nome {
    font-size: 1.5rem;
  }

  .saldo-valor {
    font-size: 2rem;
  }

  .card-header {
    flex-wrap: wrap;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cliente-info-modal {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .info-card {
    padding: 20px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .avatar-cliente {
    width: 60px;
    height: 60px;
  }

  .cliente-status {
    align-self: center;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .btn-editar {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    width: 95%;
    margin: 20px;
  }

  .modal-header,
  .modal-content {
    padding: 20px;
  }
}
</style>
