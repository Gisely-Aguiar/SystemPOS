<template>
  <div class="container-data-store">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="goHome" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">DADOS DA LOJA</h1>

    <div class="form-row">
      <!-- Razão Social -->
      <div class="form-group full-width">
        <label class="input-label">Razão Social: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.razaoSocial"
          placeholder="Digite a razão"
          class="text-input"
        />
      </div>
    </div>

    <div class="form-row">
      <!-- Nome Fantasia -->
      <div class="form-group full-width">
        <label class="input-label">Nome Fantasia: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.nomeFantasia"
          placeholder="Digite o nome"
          class="text-input"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <!-- CNPJ -->
        <label class="input-label">CNPJ: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.cnpj"
          placeholder="Digite o CNPJ"
          class="text-input"
          @input="formatarCNPJ"
          maxlength="18"
        />

        <!-- Telefone -->
        <label class="input-label">Telefone: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.telefone"
          placeholder="Digite o telefone da loja"
          class="text-input"
          @input="formatarTelefone"
          maxlength="15"
        />

        <!-- WhatsApp -->
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.whatsapp" />
          WhatsApp
        </label>
      </div>

      <!-- Código do dono -->
      <div class="form-group">
        <label class="input-label">Código da empresa: <text style="color: red">*</text></label>
        <input
          type="text"
          v-model="form.codEmpresa"
          placeholder="Digite o código do dono"
          class="text-input"
        />
      </div>
    </div>

    <!-- Botão Próximo -->
    <UiButton class="next" label="Próximo" @click="handleNext" />

    <!-- ✅ Mensagem de alerta -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { cadastroLoja } from '../stores/registroLoja.js'
import { UiButton } from '../components/index.js'

const router = useRouter()
const mensagem = ref('')

const form = ref({
  razaoSocial: '',
  nomeFantasia: '',
  telefone: '',
  whatsapp: false,
  cnpj: '',
  codEmpresa: '',
})

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

// Função para formatar CNPJ
function formatarCNPJ() {
  let cnpj = form.value.cnpj.replace(/\D/g, '')

  if (cnpj.length <= 14) {
    if (cnpj.length <= 2) {
      form.value.cnpj = cnpj
    } else if (cnpj.length <= 5) {
      form.value.cnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`
    } else if (cnpj.length <= 8) {
      form.value.cnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`
    } else if (cnpj.length <= 12) {
      form.value.cnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`
    } else {
      form.value.cnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
    }
  }
}

function handleNext() {
  // Limpar caracteres especiais para validação
  const telefoneLimpo = form.value.telefone.replace(/\D/g, '')
  const cnpjLimpo = form.value.cnpj.replace(/\D/g, '')

  if (
    !form.value.razaoSocial ||
    !form.value.nomeFantasia ||
    !form.value.telefone ||
    !form.value.cnpj ||
    !form.value.codEmpresa
  ) {
    mensagem.value = 'Preencha todos os campos obrigatórios!'
    return
  }

  // Validações específicas
  if (telefoneLimpo.length < 10) {
    mensagem.value = 'Digite um telefone válido com DDD.'
    return
  }

  if (cnpjLimpo.length !== 14) {
    mensagem.value = 'Digite um CNPJ válido com 14 dígitos.'
    return
  }

  // Salvar dados com valores limpos
  cadastroLoja.value.dadosLoja = {
    ...form.value,
    telefone: telefoneLimpo,
    cnpj: cnpjLimpo,
  }

  router.push('/adressStoreB')
}

const goHome = () => {
  router.push('/home')
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
  font-weight: 500;
}

/* ===== ESTILO BASE DO INPUT ===== */
.text-input {
  width: 100%;
}

.checkbox-label {
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.checkbox-label input[type='checkbox'] {
  width: 24px;
  height: 24px;
  accent-color: #ff7f26;
  cursor: pointer;
}

/* ===== BOTÃO PRÓXIMO ===== */
.next {
  width: 100%;
}

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

/* ✅ Mensagem de alerta */
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

@media (max-width: 480px) {
  .container-data-store {
    padding: 15px;
  }

  .title {
    font-size: 32px;
  }
}
</style>
