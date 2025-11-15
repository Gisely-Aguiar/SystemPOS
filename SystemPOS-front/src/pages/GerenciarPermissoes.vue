<template>
  <div class="container-registro-usuario">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">QUAIS PERMISSÕES {{ usuario }} DEVE TER?</h1>

    <!-- Container dos checkboxes em 2 colunas -->
    <div class="checkboxes-container">
      <div class="checkboxes-grid">
        <div v-for="(label, key) in permissions" :key="key" class="checkbox-wrapper">
          <label :for="key" class="checkbox-label">
            <input
              type="checkbox"
              :id="key"
              v-model="form[key]"
              :true-value="1"
              :false-value="0"
              class="checkbox-input"
            />
            <span class="checkmark"></span>
            <span class="checkbox-text">{{ label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Botão -->
    <UiButton class="next" label="Atribuir" @click="handleSubmit" />
  </div>
</template>

<script setup>
import { UiButton } from '../components/index.js'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { emailDono } from '../stores/registroDono.js'
//import { cadastroFuncionario } from '../stores/registroFuncionario.js'


//const usuarioNome = cadastroFuncionario.value.dadosFuncionario.nome

const router = useRouter()

// Estrutura de permissões
const permissions = {
  adicionarUsuario: 'Adicionar usuário',
  adicionarPromocao: 'Adicionar promoção',
  adicionarProduto: 'Adicionar produto',
  cadastrarEmpresa: 'Cadastrar Empresa',
  relatorios: 'Relatórios',
  prestesAVencer: 'Prestes a vencer',
  reporEstoque: 'Repor estoque',
  iniciarExpediente: 'Iniciar expediente',
  gerenciarPermissoes: 'Gerenciar permissões',
  adicionarCliente: 'Adicionar cliente',
  desativarConta: 'Desativar conta',
}

const form = ref({
  // Inicializa todas as permissões com 0
  adicionarUsuario: 0,
  adicionarPromocao: 0,
  adicionarProduto: 0,
  cadastrarEmpresa: 0,
  relatorios: 0,
  prestesAVencer: 0,
  reporEstoque: 0,
  iniciarExpediente: 0,
  gerenciarPermissoes: 0,
  adicionarCliente: 0,
  desativarConta: 0,
})

const usuario = ref('')

// Função para pegar os padrões (permissões)
async function pegaPadroes() {
  try {
    const response = await axios.get(
      `http://localhost:3333/padroes/email/${emailDono.value.dadosDono.email}`,
    )
    const dados = response.data.message

    Object.keys(permissions).forEach((key) => {
      if (key === 'desativarConta') {
        // Aqui você define o checkbox "desativarConta" com base no campo 'ativo' do BD
        form.value.desativarConta = dados.ativo === 0 ? 1 : 0
      } else {
        form.value[key] = dados[key]
      }
    })
  } catch (error) {
    console.error('Erro ao buscar padrões:', error)
  }
}

// Função de envio dos dados
async function handleSubmit() {
  try {
    const response = await axios.get(
      `http://localhost:3333/padroes/email/${emailDono.value.dadosDono.email}`,
    )
    const dados = response.data.message

    if (form.value.desativarConta) {
      await axios.delete(`http://localhost:3333/padroes/${dados.id}`)
    } else {
      const dadosParaEnviar = { ...form.value }
      delete dadosParaEnviar.desativarConta
      dadosParaEnviar.ativo = form.value.desativarConta ? 0 : 1
      await axios.put(`http://localhost:3333/padroes/${dados.id}`, dadosParaEnviar)
    }

    router.push('/atribuicaoSucesso')
  } catch (error) {
    console.error('Erro ao enviar a atualização do usuário:', error)
  }
}

onMounted(() => {
  pegaPadroes()
  
})
</script>

<style scoped>
.container-registro-usuario {
  margin: 0 auto;
  max-width: 800px;
  width: 90%;
  padding: 40px 20px;
  box-sizing: border-box;
  min-height: 100vh;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 50px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.checkboxes-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
}

.checkboxes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.1rem;
  color: #ffffff;
  cursor: pointer;
  padding: 12px 0;
  transition: all 0.3s ease;
  width: 100%;
}

.checkbox-label:hover {
  color: #ff7f26;
}

.checkbox-input {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 2px solid #ff7f26;
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.checkbox-input:checked + .checkmark {
  background-color: #ff7f26;
  border-color: #ff7f26;
}

.checkbox-input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-weight: 500;
  transition: color 0.3s ease;
}

.next {
  display: block;
  width: 100%;
  max-width: 300px;
  height: 60px;
  margin: 40px auto 0 auto;
  background: linear-gradient(135deg, #ff7f26, #ff6b00);
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 4px 15px rgba(255, 127, 38, 0.3);
}

.next:hover {
  background: linear-gradient(135deg, #ff6b00, #ff5500);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

.next:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(255, 127, 38, 0.3);
}

/* Responsividade */
@media (max-width: 768px) {
  .container-registro-usuario {
    max-width: 95%;
    padding: 20px 15px;
  }

  .title {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  .checkboxes-container {
    padding: 25px 20px;
  }

  .checkboxes-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .checkbox-label {
    font-size: 1rem;
    padding: 10px 0;
  }

  .next {
    max-width: 100%;
    height: 55px;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.7rem;
  }

  .checkboxes-container {
    padding: 20px 15px;
  }

  .checkbox-label {
    font-size: 0.95rem;
  }

  .botao-voltar {
    width: 45px;
    height: 45px;
    top: 15px;
    left: 15px;
  }
}
</style>
