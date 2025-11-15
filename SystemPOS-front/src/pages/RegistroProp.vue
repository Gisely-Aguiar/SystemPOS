<template>
  <div class="container-registro-prop">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">DADOS DO PROPRIETÁRIO</h1>

    <div class="form-row">
      <!-- Nome -->
      <div class="form-group">
        <label class="input-label">Nome Completo: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.nome"
          :placeholder="nomePlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.nome && validado }"
        />
      </div>

      <!-- Telefone -->
      <div class="form-group">
        <label class="input-label">Telefone: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.telefone"
          :placeholder="telefonePlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.telefone && validado }"
          @input="formatarTelefone"
          maxlength="15"
        />
      </div>
    </div>

    <div class="form-row">
      <!-- CPF -->
      <div class="form-group">
        <label class="input-label">CPF: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.cpf"
          :placeholder="cpfPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.cpf && validado }"
          @input="formatarCPF"
          maxlength="14"
        />
      </div>

      <!-- WhatsApp -->
      <div class="form-group">
        <label class="input-label checkbox-label">
          <input type="checkbox" v-model="form.whatsapp" class="checkbox-input" />
          WhatsApp
        </label>
      </div>
    </div>

    <div class="form-row">
      <!-- Data de Nascimento -->
      <div class="form-group">
        <label class="input-label">Data de Nascimento: <text style="color: red">*</text></label>
        <input
          type="date"
          v-model="form.dataNascimento"
          :placeholder="dataNascimentoPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.dataNascimento && validado }"
        />
      </div>

      <!-- Gênero -->
      <div class="form-group">
        <label class="input-label">Gênero: <text style="color: red">*</text></label>
        <select
          v-model="form.genero"
          :class="{ 'campo-incorreto': !form.genero && validado }"
          class="text-input"
        >
          <option value="" disabled selected>Selecione o gênero</option>
          <option v-for="option in customOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <!-- Endereço -->
      <div class="form-group">
        <label class="input-label">Endereço: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.endereco"
          :placeholder="enderecoPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.endereco && validado }"
        />
      </div>

      <!-- Código do dono -->
      <div class="form-group">
        <label class="input-label">Código do dono: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.codDono"
          :placeholder="codDonoPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.codDono && validado }"
        />
      </div>
    </div>

    <!-- Botão -->
    <UiButton class="next" label="Próximo" @click="handleNext" />

    <!-- ✅ Mensagem de alerta -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { UiButton } from '../components/index.js'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import { cadastroDono, emailDono } from '../stores/registroDono.js'

const router = useRouter()
const customOptions = ref(['Masculino', 'Feminino'])
const mensagem = ref('')

const form = ref({
  nome: '',
  telefone: '',
  whatsapp: false,
  genero: '',
  cpf: '',
  dataNascimento: '',
  endereco: '',
  codDono: '',
})

const nomePlaceholder = ref('Digite seu nome')
const telefonePlaceholder = ref('Digite seu telefone')
const cpfPlaceholder = ref('Digite seu CPF')
const dataNascimentoPlaceholder = ref('Digite sua data de nascimento')
const enderecoPlaceholder = ref('Digite seu endereço completo')
const codDonoPlaceholder = ref('Digite o código do dono')
const validado = ref(false)

// Função para formatar telefone
function formatarTelefone() {
  let telefone = form.value.telefone.replace(/\D/g, '')

  if (telefone.length <= 11) {
    if (telefone.length <= 2) {
      form.value.telefone = telefone
    } else if (telefone.length <= 6) {
      form.value.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`
    } else if (telefone.length <= 10) {
      form.value.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`
    } else {
      form.value.telefone = `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`
    }
  }
}

// Função para formatar CPF
function formatarCPF() {
  let cpf = form.value.cpf.replace(/\D/g, '')

  if (cpf.length <= 11) {
    if (cpf.length <= 3) {
      form.value.cpf = cpf
    } else if (cpf.length <= 6) {
      form.value.cpf = `${cpf.slice(0, 3)}.${cpf.slice(3)}`
    } else if (cpf.length <= 9) {
      form.value.cpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`
    } else {
      form.value.cpf = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
    }
  }
}

async function handleNext() {
  validado.value = true // ativa validação
  let valid = true

  if (!form.value.nome) {
    nomePlaceholder.value = 'Nome obrigatório'
    valid = false
  }
  if (!form.value.telefone) {
    telefonePlaceholder.value = 'Telefone obrigatório'
    valid = false
  }
  if (!form.value.cpf) {
    cpfPlaceholder.value = 'CPF obrigatório'
    valid = false
  }
  if (!form.value.dataNascimento) {
    dataNascimentoPlaceholder.value = 'Data de nascimento obrigatória'
    valid = false
  }
  if (!form.value.endereco) {
    enderecoPlaceholder.value = 'Endereço obrigatório'
    valid = false
  }
  if (!form.value.codDono) {
    codDonoPlaceholder.value = 'Código obrigatório'
    valid = false
  }

  // Validações adicionais
  const telefoneLimpo = form.value.telefone.replace(/\D/g, '')
  if (telefoneLimpo.length < 10) {
    mensagem.value = 'Digite um telefone válido com DDD (ex: 11999999999).'
    valid = false
  }

  const cpfLimpo = form.value.cpf.replace(/\D/g, '')
  if (cpfLimpo.length !== 11) {
    mensagem.value = 'Digite um CPF válido com 11 dígitos.'
    valid = false
  }

  const hoje = new Date()
  const dataNas = new Date(form.value.dataNascimento)
  hoje.setHours(0, 0, 0, 0)
  dataNas.setHours(0, 0, 0, 0)
  if (dataNas > hoje) {
    mensagem.value = 'A data de nascimento não pode ser futura.'
    valid = false
  }

  if (!valid) return

  // Salvar dados (com valores limpos)
  cadastroFuncionario.value.dadosFuncionario.nome = form.value.nome
  cadastroFuncionario.value.dadosFuncionario.telefone = telefoneLimpo
  cadastroFuncionario.value.dadosFuncionario.whatsapp = form.value.whatsapp
  cadastroFuncionario.value.dadosFuncionario.genero = form.value.genero

  cadastroDono.value.dadosDono.cpf = cpfLimpo
  cadastroDono.value.dadosDono.dataNascimento = form.value.dataNascimento
  cadastroDono.value.dadosDono.endereco = form.value.endereco
  emailDono.value.dadosDono.codDono = form.value.codDono

  router.push('/dataStore')
}
</script>

<style scoped>
.container-registro-prop {
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

.input-label {
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 500;
}

/* ===== ESTILO BASE DO INPUT ===== */
.text-input {
  width: 100%;
}

/* ===== ESTILO ESPECÍFICO PARA O SELECT ===== */
select.text-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 16px;
  padding-right: 45px;
}

/* ===== CHECKBOX ===== */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-top: 8px;
}

.checkbox-input {
  width: 24px;
  height: 24px;
  accent-color: #ff7f26;
  cursor: pointer;
}

/* ===== BOTÃO PRÓXIMO ===== */
.next {
  width: 100%;
  height: 60px;
  background-color: #ff7f26;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.next:hover {
  background-color: #b14a01;
}

.next:active {
  background-color: #ff7f26;
}

/* ===== CAMPOS COM ERRO ===== */
.campo-incorreto {
  border: 2px solid red !important;
}

.campo-incorreto::placeholder {
  color: red;
}

/* ===== MENSAGEM DE ALERTA ===== */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e64219;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
}

.botao-fechar {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 800px) {
  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100% !important;
  }

  .title {
    font-size: 36px;
    margin-top: 60px;
  }

  .botao-voltar {
    width: 45px;
    height: 45px;
    top: 15px;
    left: 15px;
  }

  .botao-voltar svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .container-registro-prop {
    padding: 15px;
  }

  .title {
    font-size: 32px;
  }
}
</style>
