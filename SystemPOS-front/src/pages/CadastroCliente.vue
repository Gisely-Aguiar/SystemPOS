<template>
  <div class="container-data-store">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">CADASTRO DE CLIENTE</h1>

    <div class="form-row">
      <div class="form-group full-width">
        <label class="input-label">Nome: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.nome"
          :placeholder="nomePlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.nome && validado }"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="input-label">CPF: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.cpf"
          :placeholder="cpfPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.cpf && validado }"
        />
      </div>

      <div class="form-group">
        <label class="input-label">Telefone: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.telefone"
          :placeholder="telefonePlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.telefone && validado }"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group full-width">
        <label class="input-label">Email: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.email"
          :placeholder="emailPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.email && validado }"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group full-width">
        <label class="input-label">Endereço: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.endereco"
          :placeholder="enderecoPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.endereco && validado }"
        />
      </div>
    </div>

    <!-- Botão de enviar -->
    <div class="botao-container">
      <UiButton class="next" label="Cadastrar" @click="handleNext" />
    </div>

    <!-- Mensagem de alerta -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import axios from 'axios'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'
import { UiButton } from '../components/index.js'

const router = useRouter()
const mensagem = ref('')
const validado = ref(false)

const form = ref({
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
})

/* ============================================================
   ✅ MÁSCARAS E VALIDAÇÕES
============================================================ */

// ✅ Máscara CPF: 000.000.000-00
function mascararCpf(v) {
  v = v.replace(/\D/g, '')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d)/, '$1.$2')
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return v
}

// ✅ Validação REAL de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += cpf.charAt(i) * (10 - i)
  let dig1 = (soma * 10) % 11
  if (dig1 === 10) dig1 = 0

  if (dig1 != cpf.charAt(9)) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += cpf.charAt(i) * (11 - i)
  let dig2 = (soma * 10) % 11
  if (dig2 === 10) dig2 = 0

  return dig2 == cpf.charAt(10)
}

// ✅ Máscara telefone (XX) XXXXX-XXXX
function mascararTelefone(v) {
  v = v.replace(/\D/g, '')
  v = v.replace(/(\d{2})(\d)/, '($1) $2')
  v = v.replace(/(\d{5})(\d)/, '$1-$2')
  return v.slice(0, 15)
}

// ✅ Watchers para mascarar inputs automaticamente
watch(
  () => form.value.cpf,
  (v) => (form.value.cpf = mascararCpf(v || '')),
)
watch(
  () => form.value.telefone,
  (v) => (form.value.telefone = mascararTelefone(v || '')),
)

/* ============================================================
   ✅ PLACEHOLDERS
============================================================ */
const nomePlaceholder = ref('Digite o nome do cliente')
const cpfPlaceholder = ref('Digite o CPF do cliente')
const telefonePlaceholder = ref('Digite o telefone do cliente')
const emailPlaceholder = ref('Digite o email do cliente')
const enderecoPlaceholder = ref('Digite o endereço do cliente')

/* ============================================================
   ✅ FUNÇÃO DE CADASTRO
============================================================ */
async function handleNext() {
  validado.value = true
  let valid = true

  if (!form.value.nome) {
    nomePlaceholder.value = 'Nome é obrigatório'
    valid = false
  }

  if (!form.value.cpf) {
    cpfPlaceholder.value = 'CPF é obrigatório'
    valid = false
  } else if (!validarCPF(form.value.cpf)) {
    mensagem.value = 'CPF inválido. Verifique e tente novamente.'
    valid = false
  }

  if (!form.value.telefone) {
    telefonePlaceholder.value = 'Telefone é obrigatório'
    valid = false
  }

  if (!form.value.email) {
    emailPlaceholder.value = 'Email é obrigatório'
    valid = false
  } else if (!form.value.email.includes('@') || !form.value.email.includes('.')) {
    mensagem.value = 'Email inválido'
    valid = false
  }

  if (!form.value.endereco) {
    enderecoPlaceholder.value = 'Endereço é obrigatório'
    valid = false
  }

  if (!valid) return

  try {
    const empresa_id = cadastroFuncionario.value.dadosLogin.codEmpresa

    if (!empresa_id) {
      mensagem.value = 'Não foi possível identificar sua empresa.'
      return
    }

    const payload = {
      empresa_id,
      nome: form.value.nome.trim(),
      cpf: form.value.cpf.replace(/\D/g, ''),
      telefone: form.value.telefone,
      email: form.value.email.trim(),
      endereco: form.value.endereco.trim(),
    }

    await axios.post('http://localhost:3333/clientes', payload)

    mensagem.value = 'Cliente cadastrado com sucesso!'
    router.push('/home')
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error)
    mensagem.value = error.response?.data?.erro || 'Erro ao cadastrar cliente.'
  }
}
</script>

<style scoped>
.container-data-store {
  max-width: 900px;
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  color: white;
}

.title {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.form-group {
  flex: 1 1 400px;
  min-width: 350px;
  display: flex;
  flex-direction: column;
}

.full-width {
  flex-basis: 100%;
  min-width: 0;
}

.input-label {
  font-size: 18px;
  margin-bottom: 8px;
}

.botao-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

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
}

.botao-fechar {
  background: white;
  color: #e64219;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.botao-fechar:hover {
  background: #eee;
}

.campo-incorreto {
  border: 2px solid red !important;
}

.campo-incorreto::placeholder {
  color: red;
}
</style>
