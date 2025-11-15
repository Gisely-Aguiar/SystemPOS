<template>
  <div class="container-registro-usuario">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">DADOS DO USUÁRIO</h1>

    <!-- Nome -->
    <div class="text-input-container">
      <label for="nome" class="input-label">Nome completo: <text style="color: red">*</text></label>
      <input
        type="text"
        v-model="form.nome"
        id="nome"
        name="nome"
        :placeholder="nomePlaceholder"
        class="text-input"
        :class="{ 'campo-incorreto': !form.nome && validado }"
      />
    </div>

    <!-- Telefone -->
    <div class="text-input-container">
      <label for="telefone" class="input-label">Telefone: <text style="color: red">*</text></label>
      <input
        type="text"
        v-model="form.telefone"
        id="telefone"
        name="telefone"
        :placeholder="telefonePlaceholder"
        class="text-input"
        :class="{ 'campo-incorreto': !form.telefone && validado }"
      />
    </div>

    <!-- WhatsApp -->
    <div class="checkbox-container">
      <label for="whatsapp" class="input-label checkbox-label">
        <input type="checkbox" id="whatsapp" v-model="form.whatsapp" />
        WhatsApp
      </label>
    </div>

    <!-- Gênero -->
    <div class="text-input-container">
      <label for="genero" class="input-label">Gênero: <text style="color: red">*</text></label>
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

    <!-- Botão -->
    <UiButton class="next" label="Criar Cadastro" @click="handleSubmit()" />

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
import axios from 'axios'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'

const router = useRouter()
const customOptions = ref(['Masculino', 'Feminino'])
const nomeRegex = /^[A-Za-zÀ-ÿ ]+$/
const telefoneRegex = /^[0-9()\- ]+$/

const form = ref({
  nome: '',
  telefone: '',
  whatsapp: false,
  genero: '',
})

const padroes = ref(cadastroFuncionario.value.dadosPadroes)

const perfis = {
  estoque: {
    adicionarUsuario: 0,
    adicionarProduto: 1,
    relatorios: 0,
    reporEstoque: 1,
    gerenciarPermissoes: 0,
    adicionarPromocao: 0,
    cadastrarEmpresa: 0,
    prestesAVencer: 1,
    iniciarExpediente: 0,
    adicionarCliente: 0,
  },
  gerente: {
    adicionarUsuario: 1,
    adicionarProduto: 1,
    relatorios: 1,
    reporEstoque: 1,
    gerenciarPermissoes: 1,
    adicionarPromocao: 1,
    cadastrarEmpresa: 0,
    prestesAVencer: 1,
    iniciarExpediente: 1,
    adicionarCliente: 1,
  },
  caixa: {
    adicionarUsuario: 0,
    adicionarProduto: 0,
    relatorios: 0,
    reporEstoque: 0,
    gerenciarPermissoes: 0,
    adicionarPromocao: 0,
    cadastrarEmpresa: 0,
    prestesAVencer: 0,
    iniciarExpediente: 1,
    adicionarCliente: 0,
  },
}

const tipo = cadastroFuncionario.value.dadosLogin.tipo
if (perfis[tipo]) {
  padroes.value = perfis[tipo]
}
cadastroFuncionario.value.dadosPadroes = padroes.value

const mensagem = ref('')

const nomePlaceholder = ref('Digite seu nome')
const telefonePlaceholder = ref('Digite seu telefone')
const validado = ref(false)

// Função para enviar cadastro
async function handleSubmit() {
  validado.value = true
  let valid = true

  // ✅ Nome obrigatório
  if (!form.value.nome) {
    nomePlaceholder.value = 'Nome é obrigatório'
    valid = false
  }

  // ✅ Nome precisa ter pelo menos 3 caracteres
  if (form.value.nome && form.value.nome.length < 3) {
    mensagem.value = 'O nome deve ter pelo menos 3 caracteres.'
    valid = false
  }

  // ✅ Nome não pode ter números ou símbolos
  if (form.value.nome && !nomeRegex.test(form.value.nome)) {
    mensagem.value = 'O nome deve conter apenas letras.'
    valid = false
  }

  // ✅ Telefone obrigatório
  if (!form.value.telefone) {
    telefonePlaceholder.value = 'Telefone é obrigatório'
    valid = false
  }

  // ✅ Telefone só pode ter números e alguns caracteres comuns
  if (form.value.telefone && !telefoneRegex.test(form.value.telefone)) {
    mensagem.value = 'O telefone deve conter apenas números (ex: 11988887777).'
    valid = false
  }

  // ✅ Telefone tamanho mínimo/máximo
  const cleanNumber = form.value.telefone.replace(/\D/g, '') // remove símbolos

  if (cleanNumber.length < 10 || cleanNumber.length > 11) {
    mensagem.value = 'O telefone deve ter 10 ou 11 dígitos (DDD + número).'
    valid = false
  }

  // ✅ Gênero obrigatório
  if (!form.value.genero) {
    mensagem.value = 'Selecione o gênero!'
    valid = false
  }

  if (!valid) return

  // ✅ Preenchimento da store antes do envio
  cadastroFuncionario.value.dadosFuncionario.nome = form.value.nome.trim()
  cadastroFuncionario.value.dadosFuncionario.telefone = cleanNumber
  cadastroFuncionario.value.dadosFuncionario.whatsapp = form.value.whatsapp
  cadastroFuncionario.value.dadosFuncionario.genero = form.value.genero

  try {
    await axios.post('http://localhost:3333/padroes', cadastroFuncionario.value.dadosPadroes)

    const response = await axios.get('http://localhost:3333/padroes')
    const acesso = response.data[0].id

    // ✅ Envio final para a API
    await axios.post('http://localhost:3333/user', {
      nome: cadastroFuncionario.value.dadosFuncionario.nome,
      telefone: cadastroFuncionario.value.dadosFuncionario.telefone,
      whatsapp: cadastroFuncionario.value.dadosFuncionario.whatsapp,
      genero: cadastroFuncionario.value.dadosFuncionario.genero,
      codEmpresa: cadastroFuncionario.value.dadosLogin.codEmpresa,
      email: cadastroFuncionario.value.dadosLogin.email,
      nomeUsuario: cadastroFuncionario.value.dadosLogin.nomeUsuario,
      senha: cadastroFuncionario.value.dadosLogin.senha,
      tipo: tipo,
      acesso: acesso,
    })

    mensagem.value = 'Cadastro concluído com sucesso!'
    router.push('/home')
  } catch (error) {
    console.error('Erro no cadastro:', error)
    mensagem.value = 'Erro ao enviar o cadastro. Tente novamente.'
  }
}
</script>

<style scoped>
.container-registro-usuario {
  margin: 0 auto;
  max-width: 600px;
  width: 90%;
  padding: 20px;
  box-sizing: border-box;
}

.title {
  text-align: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  margin-bottom: 30px;
}

.text-input-container {
  margin-bottom: 20px;
}

.input-label {
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;
  display: block;
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

/* Campos de erro */
.campo-incorreto {
  border: 2px solid red !important;
}

.campo-incorreto::placeholder {
  color: red;
}

.checkbox-container {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #ffffff;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 24px;
  height: 24px;
  accent-color: #ff7f26;
  cursor: pointer;
}

.next {
  width: 100%;
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

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .container-registro-usuario {
    padding: 15px;
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
</style>
