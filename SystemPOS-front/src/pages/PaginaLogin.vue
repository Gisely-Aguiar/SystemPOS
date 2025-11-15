<template>
  <div class="paginalogin-container">
    <div class="login-wrapper">
      <!-- Container com fundo branco translúcido -->
      <div class="content-container">
        <!-- Imagem do usuário -->
        <div class="image-container">
          <img
            src="../assets/user.png"
            alt="Foto do usuario"
            class="user-image"
          />
        </div>

        <!-- Formulário de login -->
        <div class="form-container">
          <!-- Email -->
          <div class="input-group">
            <label class="input-label">Email ou nome de usuário:</label>
            <input
              type="text"
              v-model="form.email"
              :placeholder="emailPlaceholder"
              class="text-input"
              @keyup.enter="login"
              :class="{ 'campo-incorreto': !form.email && validado }"
              autocomplete="username"
            />
          </div>

          <!-- Senha -->
          <div class="input-group">
            <label class="input-label">Senha:</label>
            <div class="input-com-olho">
              <input
                :type="mostrarSenha ? 'text' : 'password'"
                v-model="form.senha"
                @keyup.enter="login"
                :placeholder="senhaPlaceholder"
                class="text-input"
                :class="{ 'campo-incorreto': !form.senha && validado }"
                autocomplete="current-password"
              />
              <q-icon
                :name="mostrarSenha ? 'visibility_off' : 'visibility'"
                class="olhinho-senha"
                @click="mostrarSenha = !mostrarSenha"
              />
            </div>
          </div>

          <router-link to="/redefinirSenha" class="forgot-password">
            Esqueci senha
          </router-link>

          <div class="btn-container">
            <UiButton
              :label="isLoading ? 'Entrando...' : 'Entrar'"
              :disabled="isLoading"
              class="next"
              @click="login"
            />
          </div>
        </div>
      </div>

      <!-- Mensagem de erro/alerta -->
      <div v-if="mensagem" class="mensagem-alerta">
        <p>{{ mensagem }}</p>
        <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { UiButton } from '../components/index.js'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import { emailDono } from '../stores/registroDono.js'

const mostrarSenha = ref(false)
const router = useRouter()

const form = ref({
  email: '',
  senha: '',
})

const isLoading = ref(false)
const mensagem = ref('')
const emailPlaceholder = ref('Digite seu email')
const senhaPlaceholder = ref('Digite sua senha')
const validado = ref(false)

const login = async () => {
  validado.value = true
  let valid = true

  // Verificar campos vazios
  if (!form.value.email) {
    emailPlaceholder.value = 'Email é obrigatório'
    valid = false
  }
  if (!form.value.senha) {
    senhaPlaceholder.value = 'Senha é obrigatória'
    valid = false
  }

  if (!valid || isLoading.value) return

  const loginInput = form.value.email.trim()
  const senha = form.value.senha.trim()

  if (senha.length < 8) {
    mensagem.value = 'A senha deve ter pelo menos 8 caracteres!'
    return
  }

  // Verifica se é email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmail = emailRegex.test(loginInput)

  isLoading.value = true
  mensagem.value = '' // Limpa mensagens anteriores

  try {
    let response

    try {
      if (isEmail) {
        response = await axios.get(`http://localhost:3333/user/${loginInput}`)
      } else {
        response = await axios.get(`http://localhost:3333/user/nameUser/${loginInput}`)
      }
    } catch (error) {
      // Se for erro 404 (usuário não encontrado)
      if (error.response && error.response.status === 404) {
        mensagem.value = 'Usuário não encontrado!'
        return
      }
      // Se for outro erro
      throw error
    }

    // Verifica se a resposta tem a estrutura esperada
    if (!response.data || !response.data.message || !Array.isArray(response.data.message)) {
      mensagem.value = 'Erro inesperado na resposta do servidor!'
      return
    }

    const usuario = response.data.message[0]

    // Verifica se o usuário foi encontrado
    if (!usuario) {
      mensagem.value = 'Usuário não encontrado!'
      return
    }

    // Verifica se tem senha_hash
    if (!usuario.senha_hash) {
      mensagem.value = 'Erro nos dados do usuário!'
      return
    }

    // Verifica senha (ATENÇÃO: isso parece inseguro - você deveria usar hash)
    if (senha !== usuario.senha_hash) {
      mensagem.value = 'Senha incorreta. Tente novamente!'
      return
    }

    // Resto do código para redirecionamento...
    if (usuario.tipo === 'dono') {
      emailDono.value.dadosDono.codDono = usuario.dono_id

      const res = await axios.get(`http://localhost:3333/dono/${usuario.dono_id}`)
      const empresas = res.data.message

      if (!empresas || !Array.isArray(empresas)) {
        mensagem.value = 'Erro ao buscar empresas!'
        return
      }

      if (empresas.length > 1) {
        cadastroFuncionario.value.dadosFuncionario.emailV = usuario.email
        router.push('/escolherEmpresa')
        return
      } else if (empresas.length === 1) {
        await axios.put(`http://localhost:3333/dono`, {
          codEmpresa: empresas[0].e_id,
          codDono: usuario.dono_id,
        })
        cadastroFuncionario.value.dadosLogin.codEmpresa = empresas[0].e_id
        cadastroFuncionario.value.dadosFuncionario.emailV = usuario.email
        router.push('/home')
        return
      } else {
        mensagem.value = 'Nenhuma empresa cadastrada para este dono.'
        return
      }
    }

    cadastroFuncionario.value.dadosLogin.codEmpresa = usuario.empresa_id
    cadastroFuncionario.value.dadosFuncionario.emailV = usuario.email
    router.push('/home')
  } catch (error) {
    console.error('Erro ao fazer login:', error)

    if (error.response) {
      // Erro com resposta do servidor
      switch (error.response.status) {
        case 404:
          mensagem.value = 'Usuário não encontrado!'
          break
        case 500:
          mensagem.value = 'Erro interno do servidor!'
          break
        default:
          mensagem.value = 'Erro ao conectar com o servidor!'
      }
    } else if (error.request) {
      // Erro de rede
      mensagem.value = 'Erro de conexão. Verifique sua internet!'
    } else {
      // Outros erros
      mensagem.value = 'Erro inesperado!'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.paginalogin-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== CONTAINER DO CONTEÚDO ===== */
.content-container {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 40px 30px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ===== IMAGEM DO USUÁRIO ===== */
.image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.user-image {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ff7f26;
  padding: 5px;
  background: #1a1a1a;
}

/* ===== FORMULÁRIO ===== */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
}

/* ===== INPUTS ESTILIZADOS ===== */
.text-input {
  width: 100%;
  height: 50px;
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  padding: 0 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.text-input:focus {
  outline: none;
  border-color: #ff7f26;
  background-color: #222;
  box-shadow: 0 0 0 2px rgba(255, 127, 38, 0.1);
}

.text-input::placeholder {
  color: #888;
}

/* ===== INPUT DE SENHA COM ÍCONE ===== */
.input-com-olho {
  position: relative;
  display: flex;
  align-items: center;
}

.input-com-olho .text-input {
  padding-right: 50px;
}

.olhinho-senha {
  position: absolute;
  right: 16px;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 2;
}

.olhinho-senha:hover {
  color: #ff7f26;
}

/* ===== LINK ESQUECI SENHA ===== */
.forgot-password {
  text-align: right;
  font-size: 14px;
  color: #ff7f26;
  text-decoration: none;
  margin-top: -10px;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #e67322;
  text-decoration: underline;
}

/* ===== BOTÃO DE LOGIN ===== */
.btn-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.next {
  width: 100%;
 
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  max-width: 90%;
}

.botao-fechar {
  background: white;
  color: #e64219;
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

/* ===== CAMPOS INCORRETOS ===== */
.campo-incorreto {
  border: 2px solid #e64219 !important;
}

.campo-incorreto::placeholder {
  color: #e64219;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .paginalogin-container {
    padding: 15px;
  }
  
  .content-container {
    padding: 30px 20px;
  }
  
  .user-image {
    width: 120px;
    height: 120px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 25px 15px;
  }
  
  .user-image {
    width: 100px;
    height: 100px;
  }
  
  .text-input {
    height: 45px;
    font-size: 15px;
  }
  
  .login-btn {
    height: 45px;
    font-size: 15px;
  }
  
  .mensagem-alerta {
    bottom: 10px;
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* ===== ANIMAÇÕES ===== */
.content-container {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-image {
  animation: bounceIn 0.8s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
