<template>
  <div class="container">
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <div class="uilogo">
      <img src="../assets/cadeadoB.png" alt="User Logo" />
    </div>

    <h1>Redefinir nova senha!</h1>

    <div class="form">
      <label for="novaSenha" class="input-label">Nova senha:</label>
      <input
        type="password"
        id="novaSenha"
        v-model="novaSenha"
        :placeholder="senhaNovaPlaceholder"
        class="text-input"
        :class="{ 'campo-incorreto': !novaSenha && validado}"
      />

      <label for="confirmarSenha" class="input-label">Confirmar senha:</label>
      <input
        type="password"
        id="confirmarSenha"
        v-model="confirmarSenha"
        :placeholder="senhaNova2Placeholder"
        class="text-input"
        :class="{ 'campo-incorreto': !confirmarSenha && validado}"
      />

      <div class="btn-container">
        <UiButton label="Redefinir" class="next" @click="redefinirSenha" />
      </div>
      <!-- ✅ Mensagem de alerta -->
      <div v-if="mensagem" class="mensagem-alerta">
        <p>{{ mensagem }}</p>
        <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton } from '../components/index.js'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import axios from 'axios'

const router = useRouter()
const mensagem = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')
const senhaNovaPlaceholder = ref('Digite sua nova senha')
const senhaNova2Placeholder = ref('Confirme a senha')
const validado = ref(false)

const redefinirSenha = async () => {
  validado.value = true // ativa validação
  let valid = true

  // Verificar campos vazios
  if (!novaSenha.value) {
    senhaNovaPlaceholder.value = 'Nova senha é obrigatório'
    valid = false
  }
  if (!confirmarSenha.value) {
    senhaNova2Placeholder.value = 'Confirme senha é obrigatório'
    valid = false
  }
  if (!valid) {
    return
  }
  try {
    const response = await axios.put(
      `http://localhost:3333/token-senha/${cadastroFuncionario.value.dadosLogin.emailToken}`,
      {
        senha: novaSenha.value,
      },
    )
    if (response.status === 200) {
      router.push('/home')
      mensagem.value = 'Senha atualizado com sucesso!'
    } else {
      mensagem.value = 'token invalido!'
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    const erro = error.response?.data?.erro || 'Erro inesperado'
    mensagem.value = `${erro}`
  }
}
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-image: url('../assets/fundoTCClogin.png');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  font-family: 'Poppins', sans-serif;
}

.container {
  max-width: 600px;
  margin: auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;
}

.uilogo img {
  width: 150px;
  margin-bottom: 20px;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-label {
  font-size: 18px;
  margin-bottom: 6px;
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
.btn-container {
  display: flex;
  justify-content: center;
}
.input-field.campo-incorreto {
  border: 2px solid red !important;
}
.campo-incorreto::placeholder {
  color: red;
}
</style>
