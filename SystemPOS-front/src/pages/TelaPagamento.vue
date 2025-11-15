<template>
  <div class="container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="abrirModalSenha" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="content">
      <!-- Logo -->
      <div class="logo-container">
        <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />
      </div>

      <div class="form">
        <!-- Valor total -->
        <div class="login">
          <label class="input-label">TOTAL</label>
          <input
            type="text"
            :value="formatCurrency(total)"
            placeholder="TOTAL"
            class="text-input"
            readonly
          />
        </div>

        <!-- Seleção da forma de pagamento -->
        <div class="login">
          <label class="input-label">Qual a forma de pagamento?</label>
          <select v-model="formaPagamento" class="text-input" @change="handlePaymentMethodChange">
            <option disabled value="">Selecione a forma de pagamento...</option>
            <option value="cartao_credito">Cartão de Crédito</option>
            <option value="cartao_debito">Cartão de Débito</option>
            <option value="debito_cliente">Debitar cliente</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="vale_alimentacao">Vale Alimentação</option>
            <option value="vale_refeicao">Vale Refeição</option>
          </select>
        </div>

        <!-- Mostrar cliente selecionado -->
        <div v-if="clienteSelecionado && formaPagamento === 'debito_cliente'" class="login">
          <label class="input-label">Cliente Selecionado:</label>
          <div class="cliente-selecionado-info">
            <p><strong>Nome:</strong> {{ clienteSelecionado.nome_completo }}</p>
            <p><strong>CPF:</strong> {{ clienteSelecionado.cpf }}</p>
            <p>
              <strong>Saldo:</strong>
              <span :class="{ 'saldo-negativo': clienteSelecionado.saldo < 0 }">
                {{ formatCurrency(clienteSelecionado.saldo) }}
              </span>
            </p>
          </div>
        </div>

        <!-- Campo de valor pago (apenas para dinheiro) -->
        <div v-if="formaPagamento === 'dinheiro'" class="login">
          <label class="input-label">Valor Pago:</label>
          <input
            type="text"
            v-model="valorPago"
            @input="formatMoneyInput"
            @focus="$event.target.select()"
            placeholder="R$ 0,00"
            class="text-input"
            :class="{ 'input-error': valorPagoError }"
            @keyup.enter="finalizarPagamento"
          />
          <span v-if="valorPagoError" class="error-message">{{ valorPagoError }}</span>
        </div>

        <!-- Valor a pagar -->
        <div class="login">
          <label class="input-label">A pagar:</label>
          <input
            type="text"
            :value="formatCurrency(aPagar)"
            placeholder="A pagar"
            class="text-input"
            readonly
          />
        </div>

        <!-- Troco -->
        <div v-if="formaPagamento === 'dinheiro' && troco > 0" class="login">
          <label class="input-label">Troco:</label>
          <input
            type="text"
            :value="formatCurrency(troco)"
            placeholder="Troco"
            class="text-input"
            readonly
          />
        </div>

        <!-- PIX -->
        <div v-if="showPixForm" class="pix-container">
          <div v-if="pixLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Gerando QR Code PIX...</p>
          </div>

          <div v-else-if="pixStatus === 'completed'" class="success-container">
            <div class="check-icon">✓</div>
            <p class="success-text">Pagamento PIX aprovado!</p>
          </div>

          <div v-else class="qr-code-container">
            <h3>PIX - {{ formatCurrency(aPagar) }}</h3>
            <div v-if="qrCodeData">
              <img :src="qrCodeData" alt="QR Code Pix" class="qr-code" />
            </div>

            <div class="pix-key-container" v-if="pixKey">
              <label>Chave PIX (Copia e Cola):</label>
              <div class="pix-key-input-wrapper">
                <input
                  :value="pixKey"
                  readonly
                  class="text-input pix-key-input"
                  ref="pixKeyInput"
                />
                <button @click="copiarPixKey" class="copy-button">
                  {{ copySuccess ? '✓ Copiado!' : 'Copiar' }}
                </button>
              </div>
            </div>

            <p class="pix-instructions">
              💡 <strong>Como pagar:</strong><br />
              1. Escaneie o QR Code acima OU<br />
              2. Copie a chave PIX e cole no seu internet banking
            </p>

            <div class="pix-actions">
              <button @click="gerarPagamentoPix" class="secondary-button">
                🔄 Gerar Novo QR Code
              </button>
            </div>
          </div>
        </div>

        <!-- Cartão -->
        <div v-if="showCardForm" class="card-form">
          <h3>
            {{ formaPagamento === 'cartao_credito' ? 'Cartão de Crédito' : 'Cartão de Débito' }}
          </h3>
          <div class="card-inputs">
            <div class="login">
              <label class="input-label">Número do Cartão:</label>
              <input
                v-model="cardNumber"
                @input="formatCardNumber"
                placeholder="0000 0000 0000 0000"
                class="text-input"
                maxlength="19"
              />
            </div>

            <div class="card-row">
              <div class="login half-width">
                <label class="input-label">Validade:</label>
                <input
                  v-model="cardExpiry"
                  @input="formatCardExpiry"
                  placeholder="MM/AA"
                  class="text-input"
                  maxlength="5"
                />
              </div>
              <div class="login half-width">
                <label class="input-label">CVV:</label>
                <input v-model="cardCvv" placeholder="000" class="text-input" maxlength="4" />
              </div>
            </div>

            <div class="login">
              <label class="input-label">Nome no Cartão:</label>
              <input v-model="cardName" placeholder="Nome completo" class="text-input" />
            </div>

            <!-- Parcelas -->
            <div v-if="formaPagamento === 'cartao_credito'" class="login">
              <label class="input-label">Parcelas:</label>
              <select v-model="cardInstallments" class="text-input">
                <option v-for="i in 12" :key="i" :value="i">
                  {{ i }}x de {{ formatCurrency(aPagar / i) }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Benefícios -->
        <div v-if="showBenefitsForm" class="benefits-form">
          <h3>
            {{ formaPagamento === 'vale_alimentacao' ? 'Vale Alimentação' : 'Vale Refeição' }}
          </h3>
          <div class="login">
            <label class="input-label">Número do Cartão:</label>
            <input
              v-model="benefitsCardNumber"
              @input="formatBenefitsCardNumber"
              placeholder="0000 0000 0000 0000"
              class="text-input"
              maxlength="19"
            />
          </div>

          <div class="login">
            <label class="input-label">Senha:</label>
            <input
              v-model="benefitsPassword"
              type="password"
              placeholder="Digite sua senha"
              class="text-input"
              maxlength="6"
            />
          </div>
        </div>

        <!-- Botão pagar -->
        <button
          class="payment-button"
          :class="{
            disabled: !canProcessPayment || isProcessing,
            success: pagamentoFinalizado,
          }"
          :disabled="!canProcessPayment || isProcessing"
          @click="finalizarPagamento"
        >
          <span v-if="isProcessing" class="button-loading">
            <div class="spinner small"></div>
            Processando...
          </span>
          <span v-else-if="pagamentoFinalizado" class="button-success"> ✓ Liberar Caixa </span>
          <span v-else>
            {{ buttonText }}
          </span>
        </button>
      </div>
    </div>

    <!-- Modal Seleção de Clientes -->
    <div v-if="modalClientesAberto" class="modal-overlay">
      <div class="modal clientes-modal">
        <h2>Selecionar Cliente</h2>

        <!-- Barra de pesquisa -->
        <div class="search-container">
          <input
            v-model="pesquisaCliente"
            type="text"
            placeholder="Buscar por nome ou CPF..."
            class="text-input search-input"
            @input="filtrarClientes"
          />
        </div>

        <!-- Lista de clientes -->
        <div class="clientes-list">
          <div
            v-for="cliente in clientesFiltrados"
            :key="cliente.id"
            class="cliente-item"
            :class="{ selected: clienteSelecionado?.id === cliente.id }"
            @click="selecionarCliente(cliente)"
          >
            <div class="cliente-info">
              <p class="cliente-nome">{{ cliente.nome_completo }}</p>
              <p class="cliente-cpf">CPF: {{ cliente.cpf }}</p>
              <p class="cliente-saldo">
                Saldo:
                <span :class="{ 'saldo-negativo': cliente.saldo < 0 }">
                  {{ formatCurrency(cliente.saldo) }}
                </span>
              </p>
            </div>
          </div>

          <div v-if="clientesFiltrados.length === 0" class="no-results">
            Nenhum cliente encontrado
          </div>
        </div>

        <div class="modal-buttons">
          <button
            @click="confirmarSelecaoCliente"
            :disabled="!clienteSelecionado"
            class="btn-confirmar"
          >
            Confirmar
          </button>
          <button @click="fecharModalClientes" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Débito -->
    <div v-if="modalConfirmacaoDebitoAberto" class="modal-overlay">
      <div class="modal confirmacao-modal">
        <h2>Confirmar Débito</h2>

        <div class="confirmacao-info">
          <p><strong>Cliente:</strong> {{ clienteSelecionado.nome_completo }}</p>
          <p><strong>CPF:</strong> {{ clienteSelecionado.cpf }}</p>
          <p><strong>Saldo Atual:</strong> {{ formatCurrency(clienteSelecionado.saldo) }}</p>
          <p><strong>Valor do Débito:</strong> {{ formatCurrency(aPagar) }}</p>
          <p>
            <strong>Saldo Após Débito:</strong>
            <span :class="{ 'saldo-negativo': clienteSelecionado.saldo - aPagar < 0 }">
              {{ formatCurrency(clienteSelecionado.saldo - aPagar) }}
              <span v-if="clienteSelecionado.saldo - aPagar < 0" style="color: #ff6b6b">
                (Saldo Negativo)
              </span>
            </span>
          </p>
        </div>

        <div class="modal-buttons">
          <button @click="confirmarDebito" class="btn-confirmar">Confirmar Débito</button>
          <button @click="fecharModalConfirmacaoDebito" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Mensagem alerta -->
    <div v-if="mensagem" class="mensagem-alerta" :class="{ error: isError }">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>

    <!-- Modal Senha -->
    <div v-if="modalSenhaAberto" class="modal-overlay">
      <div class="modal">
        <h2>Liberar acesso</h2>
        <label>Senha:</label>
        <input
          type="password"
          v-model="senha"
          class="text-input"
          placeholder="Digite a senha de administrador"
          @keyup.enter="validarSenha"
        />
        <div class="modal-buttons">
          <button @click="validarSenha">Ok</button>
          <button @click="fecharModalSenha">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal sucesso -->
    <div v-if="modalAberto" class="modal-overlay">
      <div class="modal success">
        <h2>Status da compra</h2>
        <label>Compra aprovada com sucesso!</label>
        <div class="modal-buttons">
          <button @click="confirmarSucesso">Ok</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { cadastroVenda } from 'src/stores/registroVenda.js'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'

const router = useRouter()

// Estados básicos
const mensagem = ref('')
const isError = ref(false)
const total = ref(0)
const aPagar = ref(0)
const valorPago = ref('')
const formaPagamento = ref('')
const troco = ref(0.0)
const valorPagoError = ref('')

// Estados dos modais
const modalAberto = ref(false)
const modalSenhaAberto = ref(false)
const modalClientesAberto = ref(false)
const modalConfirmacaoDebitoAberto = ref(false)
const pagamentoFinalizado = ref(false)

// Autenticação
const senha = ref('')

// Estados PIX
const showPixForm = ref(false)
const pixLoading = ref(false)
const pixStatus = ref('')
const qrCodeData = ref('')
const pixKey = ref('')
const copySuccess = ref(false)
const pixKeyInput = ref(null)

// Estados Cartão
const showCardForm = ref(false)
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')
const cardName = ref('')
const cardInstallments = ref(1)

// Estados Benefícios
const showBenefitsForm = ref(false)
const benefitsCardNumber = ref('')
const benefitsPassword = ref('')

// Estados para débito de cliente
const clientes = ref([])
const clientesFiltrados = ref([])
const clienteSelecionado = ref(null)
const pesquisaCliente = ref('')

const isProcessing = ref(false)

// ========== PAGAMENTO E POLLING ==========
const paymentId = ref('')
const pollingInterval = ref(null)

// Usuários autorizados a liberar ação
const usuarios = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/user/SU/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    usuarios.value = response.data.message
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
  }
})

// ========== CARREGAR DADOS DA STORE ==========
onMounted(() => {
  carregarDadosStore()
})

function carregarDadosStore() {
  console.log('🔥 Carrinho recebido no pagamento:', cadastroVenda.value.totalVenda.carrinho)
  try {
    // Carrega os dados da store cadastroVenda
    if (cadastroVenda.value && cadastroVenda.value.totalVenda) {
      total.value = cadastroVenda.value.totalVenda.total || 0
      aPagar.value = cadastroVenda.value.totalVenda.total || 0
      console.log('💰 Valor carregado da store:', aPagar.value)
      console.log('🛒 Carrinho:', cadastroVenda.value.totalVenda.carrinho)
    } else {
      console.log('⚠️ Nenhum dado encontrado na store cadastroVenda')
      // Fallback para localStorage se necessário
      const dadosSalvos = localStorage.getItem('carrinhoVenda')
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos)
        total.value = dados.total || 0
        aPagar.value = dados.total || 0
        console.log('💾 Valor carregado do localStorage:', aPagar.value)
      }
    }
  } catch (error) {
    console.error('❌ Erro ao carregar dados da store:', error)
  }
}

// Computed properties
const canProcessPayment = computed(() => {
  if (!formaPagamento.value) return false

  if (formaPagamento.value === 'dinheiro') {
    const valorNumerico = parseFloat(valorPago.value.replace(/\D/g, '')) / 100 || 0
    return valorPago.value && !valorPagoError.value && valorNumerico >= aPagar.value
  }

  if (formaPagamento.value === 'debito_cliente') {
    // APENAS VERIFICAR SE O CLIENTE FOI SELECIONADO (SALDO PODE SER NEGATIVO)
    return clienteSelecionado.value && clienteSelecionado.value.id
  }

  if (formaPagamento.value === 'cartao_credito' || formaPagamento.value === 'cartao_debito') {
    return cardNumber.value && cardExpiry.value && cardCvv.value && cardName.value
  }

  if (formaPagamento.value === 'pix') {
    return true
  }

  if (formaPagamento.value === 'vale_alimentacao' || formaPagamento.value === 'vale_refeicao') {
    return benefitsCardNumber.value && benefitsPassword.value
  }

  return false
})

const buttonText = computed(() => {
  if (formaPagamento.value === 'dinheiro' && valorPago.value) {
    const valor = parseFloat(valorPago.value.replace(/\D/g, '')) / 100 || 0
    if (valor < aPagar.value) {
      return `Pagar Parcial (Restante: ${formatCurrency(aPagar.value - valor)})`
    }
  }

  if (formaPagamento.value === 'debito_cliente' && clienteSelecionado.value) {
    return `Debitar do Cliente`
  }

  return 'Finalizar Pagamento'
})

// Watchers
watch(valorPago, (newValue) => {
  if (formaPagamento.value === 'dinheiro' && newValue) {
    const valorPagoNum = parseFloat(newValue.replace(/\D/g, '')) / 100 || 0
    const valorAPagar = parseFloat(aPagar.value)

    if (!isNaN(valorPagoNum) && !isNaN(valorAPagar)) {
      troco.value = Math.max(0, valorPagoNum - valorAPagar)
    }
  }
})

watch(formaPagamento, () => {
  // Resetar estados ao mudar método de pagamento
  resetPaymentForms()
})

// ========== FUNÇÕES DE FORMATAÇÃO ==========
function formatCurrency(value) {
  if (!value && value !== 0) return 'R$ 0,00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num || 0)
}

function formatMoneyInput(event) {
  let value = event.target.value
  value = value.replace(/\D/g, '')

  if (!value) {
    valorPago.value = ''
    return
  }

  const numericValue = parseFloat(value) / 100
  valorPago.value = formatCurrency(numericValue)
}

function formatCardNumber(event) {
  const value = event.target.value.replace(/\D/g, '')
  const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  cardNumber.value = formattedValue
}

function formatCardExpiry(event) {
  const value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    cardExpiry.value = value.slice(0, 2) + '/' + value.slice(2, 4)
  } else {
    cardExpiry.value = value
  }
}

function formatBenefitsCardNumber(event) {
  const value = event.target.value.replace(/\D/g, '')
  const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  benefitsCardNumber.value = formattedValue
}

function resetPaymentForms() {
  cardNumber.value = ''
  cardExpiry.value = ''
  cardCvv.value = ''
  cardName.value = ''
  cardInstallments.value = 1
  benefitsCardNumber.value = ''
  benefitsPassword.value = ''
  valorPago.value = ''
  troco.value = 0
  valorPagoError.value = ''
  copySuccess.value = false
  clienteSelecionado.value = null
}

// ========== FUNÇÕES PARA DÉBITO DE CLIENTE ==========
async function carregarClientes() {
  try {
    const empresa_id = cadastroFuncionario.value.dadosLogin.codEmpresa
    const response = await axios.get(`http://localhost:3333/clientes/empresa/${empresa_id}`)
    clientes.value = response.data
    clientesFiltrados.value = response.data
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    mensagem.value = 'Erro ao carregar lista de clientes'
    isError.value = true
  }
}

function filtrarClientes() {
  if (!pesquisaCliente.value) {
    clientesFiltrados.value = clientes.value
    return
  }

  const termo = pesquisaCliente.value.toLowerCase()
  clientesFiltrados.value = clientes.value.filter(
    (cliente) => cliente.nome_completo.toLowerCase().includes(termo) || cliente.cpf.includes(termo),
  )
}

function selecionarCliente(cliente) {
  clienteSelecionado.value = cliente
}

function confirmarSelecaoCliente() {
  if (clienteSelecionado.value) {
    modalClientesAberto.value = false
  }
}

function fecharModalClientes() {
  modalClientesAberto.value = false
  clienteSelecionado.value = null
  pesquisaCliente.value = ''

  // Se cancelou a seleção, volta para seleção de forma de pagamento
  if (formaPagamento.value === 'debito_cliente') {
    formaPagamento.value = ''
  }
}

function abrirModalConfirmacaoDebito() {
  modalConfirmacaoDebitoAberto.value = true
}

function fecharModalConfirmacaoDebito() {
  modalConfirmacaoDebitoAberto.value = false
}

async function processarDebitoCliente() {
  try {
    console.log(clienteSelecionado.value.id)
    console.log(aPagar.value)
    const response = await axios.post(
      `http://localhost:3333/clientes/debito/${clienteSelecionado.value.id}`,
      {
        valor: aPagar.value,
      },
    )

    return response.data
  } catch (error) {
    console.error('Erro ao debitar cliente:', error)
    throw error
  }
}

// ========== FUNÇÕES PRINCIPAIS ==========
function handlePaymentMethodChange() {
  showPixForm.value = false
  showCardForm.value = false
  showBenefitsForm.value = false

  resetPaymentForms()

  if (formaPagamento.value === 'pix') {
    showPixForm.value = true
    gerarPagamentoPix()
  } else if (formaPagamento.value === 'debito_cliente') {
    // Abre modal para seleção de cliente
    carregarClientes()
    modalClientesAberto.value = true
    clienteSelecionado.value = null
  } else if (
    formaPagamento.value === 'cartao_credito' ||
    formaPagamento.value === 'cartao_debito'
  ) {
    showCardForm.value = true
  } else if (
    formaPagamento.value === 'vale_alimentacao' ||
    formaPagamento.value === 'vale_refeicao'
  ) {
    showBenefitsForm.value = true
  }
}

// ========== FUNÇÕES PIX E POLLING ==========
async function gerarPagamentoPix() {
  pixLoading.value = true
  try {
    const response = await axios.post('http://localhost:3333/pix', {
      valor: aPagar.value,
      email: 'comprador@example.com',
    })

    const { qr_code, qr_code_base64, payment_id } = response.data

    qrCodeData.value = qr_code_base64 ? `data:image/png;base64,${qr_code_base64}` : ''

    pixKey.value = qr_code || ''
    paymentId.value = payment_id

    console.log('💰 Payment ID para verificação:', payment_id)

    // INICIA VERIFICAÇÃO POR POLLING
    iniciarVerificacaoStatus(payment_id)

    mensagem.value = 'QR Code PIX gerado com sucesso! Aguardando pagamento...'
    isError.value = false
  } catch (error) {
    console.error(error)
    mensagem.value = 'Erro ao gerar PIX: ' + (error.response?.data?.error || error.message)
    isError.value = true
  } finally {
    pixLoading.value = false
  }
}

function copiarPixKey() {
  if (!pixKey.value) {
    mensagem.value = 'Gere o QR Code PIX primeiro'
    isError.value = true
    return
  }

  // Primeiro tentamos o método moderno
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(pixKey.value)
      .then(() => {
        copySuccess.value = true
        mensagem.value = 'Chave PIX copiada para a área de transferência!'
        isError.value = false
        setTimeout(() => (copySuccess.value = false), 3333)
      })
      .catch(() => {
        copiarPixKeyFallback()
      })
  } else {
    copiarPixKeyFallback()
  }
}

// Fallback para navegadores antigos ou insecure
function copiarPixKeyFallback() {
  if (!pixKeyInput.value) return

  const input = pixKeyInput.value
  input.disabled = false // garantir que seja selecionável
  input.select()
  input.setSelectionRange(0, 99999)

  try {
    const successful = document.execCommand('copy')
    if (successful) {
      copySuccess.value = true
      mensagem.value = 'Chave PIX copiada para a área de transferência!'
      isError.value = false
      setTimeout(() => (copySuccess.value = false), 3333)
    } else {
      throw new Error('Falha ao copiar')
    }
  } catch {
    mensagem.value = 'Erro ao copiar chave PIX. Selecione e copie manualmente.'
    isError.value = true
  } finally {
    input.disabled = true
  }
}

// Função para verificar status do pagamento via polling
function iniciarVerificacaoStatus(paymentId) {
  console.log('🔄 Iniciando verificação do pagamento:', paymentId)

  // Para qualquer verificação anterior
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  let tentativas = 0
  const maxTentativas = 36 // 3 minutos (36 * 5 segundos)

  pollingInterval.value = setInterval(async () => {
    try {
      tentativas++
      console.log(`📊 Verificando pagamento (tentativa ${tentativas}/${maxTentativas})`)

      const response = await axios.get(`http://localhost:3333/pix/status/${paymentId}`)
      console.log('📊 Status do pagamento:', response.data.status)

      if (response.data.status === 'approved') {
        clearInterval(pollingInterval.value)
        console.log('✅ Pagamento aprovado!')
        handlePagamentoAprovado()
        return
      }

      if (response.data.status === 'cancelled' || response.data.status === 'rejected') {
        clearInterval(pollingInterval.value)
        console.log('❌ Pagamento cancelado/rejeitado')
        mensagem.value = 'Pagamento não aprovado. Tente novamente.'
        isError.value = true
        return
      }

      // Se atingiu o limite de tentativas
      if (tentativas >= maxTentativas) {
        clearInterval(pollingInterval.value)
        console.log('⏰ Tempo esgotado para pagamento')
        mensagem.value = 'Tempo para pagamento expirado. Gere um novo QR Code.'
        isError.value = true
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)

      // Se der muitos erros, para o polling
      if (tentativas >= 10) {
        clearInterval(pollingInterval.value)
        console.log('🚫 Muitos erros, parando verificação')
        mensagem.value = 'Erro na verificação do pagamento.'
        isError.value = true
      }
    }
  }, 5000) // Verifica a cada 5 segundos
}

function handlePagamentoAprovado() {
  console.log('🎉 Pagamento aprovado!')
  pixStatus.value = 'completed'
  mensagem.value = 'Pagamento PIX confirmado! Registrando venda...'

  // Registrar venda automaticamente
  finalizarPagamento()
}

// ========== FUNÇÃO PARA REGISTRAR VENDA ==========
async function registrarVenda() {
  // VERIFICAÇÃO SEGURA DOS DADOS
  console.log('🔍 VERIFICANDO DADOS DAS STORES:')
  console.log('cadastroFuncionario:', cadastroFuncionario.value)
  console.log('cadastroVenda:', cadastroVenda.value)

  // Garantir que temos todos os dados necessários
  const empresa_id = cadastroFuncionario.value?.dadosLogin?.codEmpresa
  const usuario_id = 1
  const valor_total = aPagar.value
  const forma_pagamento = formaPagamento.value

  console.log('📋 DADOS EXTRAÍDOS:')
  console.log('- empresa_id:', empresa_id)
  console.log('- usuario_id:', usuario_id)
  console.log('- valor_total:', valor_total)
  console.log('- forma_pagamento:', forma_pagamento)
  console.log('- cliente_selecionado:', clienteSelecionado.value)

  // VALIDAÇÃO RÍGIDA
  if (!empresa_id) throw new Error('empresa_id não encontrado na store')
  if (!valor_total || valor_total <= 0) throw new Error('valor_total inválido')
  if (!forma_pagamento) throw new Error('forma_pagamento não selecionada')
  if (!cadastroVenda.value?.totalVenda?.carrinho?.length) throw new Error('Carrinho vazio')

  // VALIDAÇÃO ESPECÍFICA PARA DÉBITO DE CLIENTE
  if (forma_pagamento === 'debito_cliente' && !clienteSelecionado.value) {
    throw new Error('Cliente não selecionado para débito')
  }

  // Preparar itens com validação
  const itens = cadastroVenda.value.totalVenda.carrinho.map((item) => {
    if (!item.codigo_produto) throw new Error(`Produto sem codigo_produto: ${item.nome}`)
    if (!item.quantidade || item.quantidade <= 0)
      throw new Error(`Quantidade inválida para: ${item.nome}`)
    if (!item.preco || item.preco <= 0) throw new Error(`Preço inválido para: ${item.nome}`)

    return {
      codigo_produto: item.codigo_produto,
      quantidade: parseInt(item.quantidade),
      preco: parseFloat(item.preco),
    }
  })

  // DADOS FINAIS - INCLUINDO CLIENTE_ID QUANDO FOR DÉBITO
  const dadosVenda = {
    empresa_id: parseInt(empresa_id),
    usuario_id: usuario_id,
    valor_total: parseFloat(valor_total),
    forma_pagamento: forma_pagamento,
    itens: itens,
    // ADICIONE ESTA LINHA ↓
    cliente_id: forma_pagamento === 'debito_cliente' ? clienteSelecionado.value.id : null,
  }

  console.log('🎯 DADOS FINAIS VALIDADOS:')
  console.log(JSON.stringify(dadosVenda, null, 2))

  // ENVIAR PARA BACKEND
  console.log('📤 Enviando para backend...')
  const response = await axios.post('http://localhost:3333/venda/registrar', dadosVenda)

  console.log('✅ RESPOSTA DO BACKEND:', response.data)
  return response.data
}

// ========== FUNÇÃO PRINCIPAL DE PAGAMENTO ==========
async function finalizarPagamento() {
  if (pagamentoFinalizado.value) {
    PagamentoFinalizado()
    return
  }

  // Se for débito de cliente, abre modal de confirmação
  if (formaPagamento.value === 'debito_cliente') {
    abrirModalConfirmacaoDebito()
    return
  }

  // Processa outros tipos de pagamento normalmente
  isProcessing.value = true

  try {
    await registrarVenda()

    // SUCESSO
    isProcessing.value = false
    pagamentoFinalizado.value = true
    modalAberto.value = true
    mensagem.value = 'Venda registrada com sucesso!'
    isError.value = false

    // Limpar carrinho
    cadastroVenda.value.totalVenda.total = 0
    cadastroVenda.value.totalVenda.carrinho = []
    localStorage.removeItem('carrinhoVenda')
  } catch (error) {
    console.error('❌ ERRO NO FRONTEND:', error)

    let errorMessage = 'Erro ao processar pagamento: '

    if (error.response?.status === 500) {
      errorMessage += 'Erro interno no servidor (500). Verifique o backend.'
    } else if (error.response?.data?.error) {
      errorMessage += error.response.data.error
    } else if (error.message) {
      errorMessage += error.message
    } else {
      errorMessage += 'Erro desconhecido'
    }

    mensagem.value = errorMessage
    isError.value = true
    isProcessing.value = false

    console.error('📋 Detalhes do erro:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })
  }
}

// Nova função para confirmar débito
async function confirmarDebito() {
  isProcessing.value = true
  fecharModalConfirmacaoDebito()

  try {
    // Processa o débito do cliente
    await processarDebitoCliente()

    // Registra a venda (agora incluindo o cliente_id)
    await registrarVenda()

    // SUCESSO
    isProcessing.value = false
    pagamentoFinalizado.value = true
    modalAberto.value = true
    mensagem.value = 'Débito realizado e venda registrada com sucesso!'
    isError.value = false

    // Limpar carrinho
    cadastroVenda.value.totalVenda.total = 0
    cadastroVenda.value.totalVenda.carrinho = []
    localStorage.removeItem('carrinhoVenda')
  } catch (error) {
    console.error('Erro ao processar débito:', error)
    mensagem.value = 'Erro ao processar débito: ' + (error.response?.data?.error || error.message)
    isError.value = true
    isProcessing.value = false
  }
}

// ========== FUNÇÕES DE MODAL E NAVEGAÇÃO ==========
function abrirModalSenha() {
  senha.value = ''
  modalSenhaAberto.value = true
}

function fecharModalSenha() {
  modalSenhaAberto.value = false
  senha.value = ''
}

function validarSenha() {
  if (!senha.value) {
    mensagem.value = 'Digite a senha de administrador'
    isError.value = true
    return
  }

  // ✅ Validação REAL — exatamente igual na outra tela
  const ok = usuarios.value.some((u) => u.senha_hash === senha.value)

  if (ok) {
    modalSenhaAberto.value = false
    senha.value = ''
    router.push('/CaixaLivre')
  } else {
    mensagem.value = 'Senha de administrador incorreta!'
    isError.value = true
    modalSenhaAberto.value = false
  }
}

function confirmarSucesso() {
  modalAberto.value = false
}

function PagamentoFinalizado() {
  router.push('/CaixaLivre')
}

// Não esqueça de limpar o polling
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
})
</script>

<style scoped>
html,
body {
  overflow-y: auto;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  padding: 80px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
}

.logo-container {
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.logo {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Formulário */
.form {
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

.text-input {
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  padding: 12px;
  transition:
    border-color 0.3s,
    background-color 0.3s;
}

.text-input:focus {
  outline: none;
  border-color: #ff7f26;
  background-color: #222;
}

.text-input:read-only {
  background-color: #111;
  color: #aaa;
}

/* Cliente selecionado */
.cliente-selecionado-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ff7f26;
}

.cliente-selecionado-info p {
  margin: 5px 0;
  color: white;
}

/* Saldo negativo */
.saldo-negativo {
  color: #ff6b6b;
  font-weight: bold;
}

/* Seções de formulário */
.pix-container,
.card-form,
.benefits-form {
  background: #111;
  border-radius: 12px;
  padding: 20px;
  margin: 10px 0;
  border: 1px solid #222;
}

.pix-container h3,
.card-form h3,
.benefits-form h3 {
  color: #ff7f26;
  margin-bottom: 15px;
  text-align: center;
  font-size: 20px;
}

/* Loading / Sucesso */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #fff;
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.check-icon {
  width: 60px;
  height: 60px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: white;
  font-weight: bold;
}

.success-text {
  color: #28a745;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* QR Code Melhorado */
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.qr-code-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 2px solid #444;
  border-radius: 8px;
  background: white;
  padding: 10px;
}

.qr-code-text {
  color: #bbb;
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.qr-code-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 30px;
  background: #222;
  border-radius: 8px;
  margin: 15px 0;
}

.placeholder-icon {
  font-size: 48px;
}

.pix-key-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.pix-key-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.pix-key-input {
  flex: 1;
  font-size: 14px;
  font-family: monospace;
}

.copy-button {
  background: #ff7f26;
  border: none;
  color: white;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
  white-space: nowrap;
  min-width: 80px;
}

.copy-button:hover {
  background: #e55a00;
}

.pix-instructions {
  text-align: center;
  color: #bbb;
  font-size: 14px;
  margin: 15px 0;
  line-height: 1.5;
}

.pix-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 15px;
}

.success-button {
  background: #28a745;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.success-button:hover {
  background: #218838;
}

/* Cartão */
.card-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-row {
  display: flex;
  gap: 15px;
}

.half-width {
  flex: 1;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #333;
  border-top: 3px solid #ff7f26;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Botão de pagamento */
.payment-button {
  background: linear-gradient(135deg, #ff7f26, #ff9500);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-button:hover:not(.disabled) {
  background: linear-gradient(135deg, #e55a00, #cc7700);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 127, 38, 0.3);
}

.payment-button.disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.payment-button.success {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.payment-button.success:hover {
  background: linear-gradient(135deg, #218838, #1e9e8a);
}

.button-loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button-success {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Mensagem de alerta */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e64219;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  box-shadow: 0 8px 20px rgba(230, 66, 25, 0.4);
}

.mensagem-alerta.error {
  background-color: #e64219;
}

.mensagem-alerta:not(.error) {
  background-color: #28a745;
}

.botao-fechar {
  background: white;
  color: #e64219;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.botao-fechar:hover {
  background: #eee;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal {
  background: #111;
  padding: 30px;
  border-radius: 16px;
  color: white;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
}

.modal h2 {
  margin: 0;
  color: #ff7f26;
  text-align: center;
}

.modal label {
  font-size: 16px;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.modal-buttons button {
  background-color: #ff7f26;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.modal-buttons button:hover {
  background-color: #e55a00;
}

.modal-buttons button:last-child {
  background-color: #666;
}

.modal-buttons button:last-child:hover {
  background-color: #777;
}

/* Novos estilos para os modais de cliente */
.clientes-modal {
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
}

.clientes-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px;
}

.cliente-item {
  padding: 15px;
  border: 1px solid #333;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cliente-item:hover {
  background-color: #2a2a2a;
  border-color: #ff7f26;
}

.cliente-item.selected {
  background-color: #1e3a5f;
  border-color: #ff7f26;
}

.cliente-info p {
  margin: 5px 0;
}

.cliente-nome {
  font-weight: bold;
  font-size: 16px;
  color: white;
}

.cliente-cpf,
.cliente-saldo {
  font-size: 14px;
  color: #ccc;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #888;
}

.confirmacao-modal {
  max-width: 500px;
}

.confirmacao-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.confirmacao-info p {
  margin: 8px 0;
  color: white;
}

.btn-confirmar {
  background-color: #28a745;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-confirmar:hover:not(:disabled) {
  background-color: #218838;
}

.btn-confirmar:disabled {
  background-color: #666;
  cursor: not-allowed;
}

.btn-cancelar {
  background-color: #666;
  border: none;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-cancelar:hover {
  background-color: #777;
}

/* Utilitários */
.input-error {
  border-color: #e64219 !important;
  background-color: #2a1a1a !important;
}

.error-message {
  color: #e64219;
  font-size: 12px;
  margin-top: 4px;
}

.secondary-button {
  background: #666;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.secondary-button:hover {
  background: #777;
}

/* Responsividade */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    align-items: center;
    gap: 25px;
  }

  .form {
    width: 100%;
    max-width: 420px;
  }

  .logo-container {
    width: 150px;
    height: 150px;
  }

  .card-row {
    flex-direction: column;
    gap: 10px;
  }

  .pix-key-input-wrapper {
    flex-direction: column;
  }

  .pix-actions {
    flex-direction: column;
  }

  .qr-code {
    width: 180px;
    height: 180px;
  }

  .clientes-modal {
    width: 90%;
    max-width: none;
  }

  .confirmacao-modal {
    width: 90%;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 60px 15px;
  }

  .form {
    max-width: 100%;
  }

  .modal {
    width: 90%;
    padding: 20px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-buttons button {
    width: 100%;
  }
}
</style>
