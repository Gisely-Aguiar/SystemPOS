<template>
  <div class="container-registro-usuario">
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <!-- Botão de voltar -->
    <div class="container-titulo">
      <h1 class="titulo-principal">CADASTRO</h1>
    </div>

    <!-- Email -->
    <div class="email">
      <label for="email" class="input-label">Email: <text style="color: red">*</text></label>
      <input
        type="email"
        v-model="form.email"
        id="email"
        name="email"
        :placeholder="emailPlaceholder"
        class="text-input"
        :class="{ 'campo-incorreto': !form.email && validado }"
      />
    </div>

    <!-- Nome de usuário -->
    <div class="text-input-container">
      <label for="nome" class="input-label"
        >Nome de usuário: <text style="color: red">*</text></label
      >
      <input
        type="text"
        v-model="form.userlogin"
        id="nome"
        name="nome"
        :placeholder="userloginPlaceholder"
        class="text-input"
        :class="{ 'campo-incorreto': !form.userlogin && validado }"
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
        @input="formatarTelefone"
        maxlength="15"
      />
    </div>

    <!-- Senhas -->
    <div class="passwd">
      <div class="senha">
        <label for="senha" class="input-label">Senha: <text style="color: red">*</text></label>
        <input
          type="password"
          v-model="form.senha"
          id="senha"
          name="senha"
          :placeholder="senhaPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.senha && validado }"
        />
      </div>
      <div class="senhadnv">
        <label for="confirmarSenha" class="input-label"
          >Senha Novamente: <text style="color: red">*</text></label
        >
        <input
          type="password"
          v-model="form.confirmarSenha"
          id="confirmarSenha"
          name="confirmarSenha"
          :placeholder="confirmarSenhaPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.confirmarSenha && validado }"
        />
      </div>
    </div>

    <!-- Tipo -->
    <div class="tipo">
      <label for="tipo" class="input-label">Tipo: <text style="color: red">*</text></label>
      <select
        v-model="form.tipo"
        :class="{ 'campo-incorreto': !form.tipo && validado }"
        class="text-input"
      >
        <option value="" disabled selected>Selecione o tipo</option>
        <option v-for="option in customOptions" :key="option" :value="option">
          {{ option.charAt(0).toUpperCase() + option.slice(1) }}
        </option>
      </select>
    </div>

    <!-- Botão -->
    <div class="botao-container">
      <UiButton class="next" label="Próximo" @click="handleNext()" />
    </div>

    <!-- ✅ Mensagem de alerta personalizada -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import { UiButton } from '../components/index.js'

const router = useRouter()
const customOptions = ref(['dono', 'gerente', 'caixa', 'estoque'])
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//const telefoneRegex = /^[0-9()\- ]+$/

const form = ref({
  email: '',
  userlogin: '',
  telefone: '',
  senha: '',
  confirmarSenha: '',
  tipo: '',
})

const mensagem = ref('')
const emailPlaceholder = ref('Digite seu email')
const userloginPlaceholder = ref('Digite seu nome')
const telefonePlaceholder = ref('Digite seu telefone')
const senhaPlaceholder = ref('Digite sua senha')
const confirmarSenhaPlaceholder = ref('Digite sua senha novamente')
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

function handleNext() {
  validado.value = true // ativa validação
  let valid = true

  // Verificar campos vazios
  if (!form.value.email) {
    emailPlaceholder.value = 'Email é obrigatório'
    valid = false
  }
  if (!form.value.userlogin) {
    userloginPlaceholder.value = 'Nome de usuário é obrigatório'
    valid = false
  }
  if (!form.value.telefone) {
    telefonePlaceholder.value = 'Telefone é obrigatório'
    valid = false
  }
  if (!form.value.senha) {
    senhaPlaceholder.value = 'Senha é obrigatória'
    valid = false
  }
  if (!form.value.confirmarSenha) {
    confirmarSenhaPlaceholder.value = 'Confirme a senha'
    valid = false
  }
  if (!form.value.tipo) {
    mensagem.value = 'Selecione o tipo de usuário'
    valid = false
  }

  // ✅ Validação de email correto
  if (form.value.email && !emailRegex.test(form.value.email)) {
    mensagem.value = 'Digite um email válido (ex: exemplo@dominio.com).'
    valid = false
  }

  // ✅ Limite do email por segurança (mesmo do BD)
  if (form.value.email.length > 100) {
    mensagem.value = 'O email deve ter no máximo 100 caracteres.'
    valid = false
  }

  // ✅ Validar userlogin tamanho máximo (compatível com BD)
  if (form.value.userlogin.length >= 25) {
    mensagem.value = 'O nome de usuário deve ter menos de 25 caracteres!'
    valid = false
  }

  // ✅ Validação de telefone
  const telefoneLimpo = form.value.telefone.replace(/\D/g, '')
  if (form.value.telefone && telefoneLimpo.length < 10) {
    mensagem.value = 'Digite um telefone válido com DDD (ex: 11999999999).'
    valid = false
  }

  // ✅ Senha mínima
  if (form.value.senha.length < 8) {
    mensagem.value = 'A senha deve ter mais de 8 dígitos!'
    valid = false
  }

  // ✅ Validar se senhas coincidem
  if (form.value.senha !== form.value.confirmarSenha) {
    mensagem.value = 'As senhas não coincidem!'
    valid = false
  }

  // ✅ Se falhou validação, não continua
  if (!valid) {
    return
  }

  // Salvar no store
  let codEmpresa = cadastroFuncionario.value.dadosLogin.codEmpresa
  cadastroFuncionario.value.dadosLogin = {
    email: form.value.email.trim(),
    nomeUsuario: form.value.userlogin.trim(),
    telefone: telefoneLimpo, // Salva o telefone sem máscara
    senha: form.value.senha,
    tipo: form.value.tipo,
    codEmpresa,
  }

  // Redirecionamento
  if (form.value.tipo === 'dono') {
    router.push('/registerProp')
  } else {
    router.push('/CadastroFuncionario')
  }
}
</script>

<style scoped>
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

.container-titulo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.titulo-principal {
  font-size: 50px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.container-registro-usuario {
  margin: 0 auto;
  width: 75%;
  max-width: 900px;
  padding: 20px;
}

.email,
.text-input-container,
.tipo {
  margin-bottom: 20px;
}

.passwd {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.passwd > div {
  flex: 1;
}

.input-label {
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 8px;
  display: block;
  font-weight: 500;
}

/* ===== BOTÃO PRÓXIMO ===== */
.botao-container {
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

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
@media (max-width: 768px) {
  .container-registro-usuario {
    width: 90%;
    padding: 15px;
  }

  .titulo-principal {
    font-size: 36px;
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

  .passwd {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .titulo-principal {
    font-size: 32px;
  }

  .container-registro-usuario {
    padding: 10px;
  }
}
</style>
