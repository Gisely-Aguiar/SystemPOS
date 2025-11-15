<template>
  <div class="selecao-empresa-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">COM QUAL EMPRESA DESEJA ENTRAR?</h1>

    <div class="empresas-content">
      <!-- Se empresas existir e tiver itens -->
      <div v-if="empresas.length > 0" class="empresas-grid">
        <div v-for="empresa in empresas" :key="empresa.id" class="empresa-card">
          <div class="empresa-header">
            <div class="empresa-avatar">
              <q-icon name="business" class="empresa-icon" />
            </div>
            <div class="empresa-info">
              <h3 class="empresa-nome">{{ empresa.nome_fantasia || empresa.razao_social }}</h3>
              <p class="empresa-cnpj">{{ formatarCNPJ(empresa.cnpj) }}</p>
            </div>
          </div>

          <div class="empresa-detalhes">
            <div class="detalhe-item">
              <q-icon name="corporate_fare" class="detalhe-icon" />
              <span class="detalhe-texto">{{ empresa.razao_social }}</span>
            </div>
            <div class="detalhe-item">
              <q-icon name="phone" class="detalhe-icon" />
              <span class="detalhe-texto">{{
                empresa.telefone ? formatarTelefone(empresa.telefone) : 'Não informado'
              }}</span>
            </div>
          </div>

          <button class="btn-entrar" @click="entrarNaEmpresa(empresa)">
            <q-icon name="login" class="btn-icon" />
            Entrar na Empresa
          </button>
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else class="empty-state">
        <q-icon name="business" class="empty-icon" />
        <h3 class="empty-title">Nenhuma empresa cadastrada</h3>
        <p class="empty-description">Você ainda não possui empresas vinculadas ao seu cadastro.</p>
        <button class="btn-cadastrar-empresa" @click="cadastrarEmpresa">
          <q-icon name="add" class="btn-icon" />
          Cadastrar Primeira Empresa
        </button>
      </div>
    </div>

    <!-- Mensagem de feedback -->
    <div v-if="mensagem" class="mensagem-feedback">
      <q-icon name="check_circle" class="mensagem-icon" />
      <span>{{ mensagem }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { emailDono } from '../stores/registroDono.js'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'

const router = useRouter()
const empresas = ref([])
const mensagem = ref('')

// Funções de formatação
function formatarCNPJ(cnpj) {
  if (!cnpj) return 'Não informado'
  const cnpjLimpo = cnpj.replace(/\D/g, '')
  if (cnpjLimpo.length === 14) {
    return `${cnpjLimpo.slice(0, 2)}.${cnpjLimpo.slice(2, 5)}.${cnpjLimpo.slice(5, 8)}/${cnpjLimpo.slice(8, 12)}-${cnpjLimpo.slice(12)}`
  }
  return cnpj
}

function formatarTelefone(telefone) {
  if (!telefone) return 'Não informado'
  const telLimpo = telefone.replace(/\D/g, '')
  if (telLimpo.length === 11) {
    return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 7)}-${telLimpo.slice(7)}`
  } else if (telLimpo.length === 10) {
    return `(${telLimpo.slice(0, 2)}) ${telLimpo.slice(2, 6)}-${telLimpo.slice(6)}`
  }
  return telefone
}

async function fetchEmpresas() {
  try {
    const res = await axios.get(`http://localhost:3333/dono/${emailDono.value.dadosDono.codDono}`)
    empresas.value = res.data.message || []
  } catch (err) {
    console.error(err)
    empresas.value = []
  }
}

async function entrarNaEmpresa(empresa) {
  try {
    const response = await axios.put(`http://localhost:3333/dono`, {
      codEmpresa: empresa.e_id,
      codDono: emailDono.value.dadosDono.codDono,
    })

    if (response.status === 200) {
      cadastroFuncionario.value.dadosLogin.codEmpresa = empresa.e_id
      mensagem.value = `Acessando ${empresa.nome_fantasia || empresa.razao_social}...`

      // Redirecionar após breve delay para mostrar feedback
      setTimeout(() => {
        router.push('/home')
      }, 1000)
    } else {
      mensagem.value = 'Erro ao acessar empresa'
    }
  } catch (error) {
    console.error('Erro de servidor:', error)
    const erro = error.response?.data?.erro || 'Erro inesperado'
    mensagem.value = `${erro}`
  }
}

function cadastrarEmpresa() {
  router.push('/dataStore')
}

onMounted(() => {
  fetchEmpresas()
})
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.selecao-empresa-container {
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

/* ===== CONTEÚDO PRINCIPAL ===== */
.empresas-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== GRID DE EMPRESAS ===== */
.empresas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

/* ===== CARD DA EMPRESA ===== */
.empresa-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empresa-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 127, 38, 0.3);
}

/* ===== HEADER DA EMPRESA ===== */
.empresa-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.empresa-avatar {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empresa-icon {
  font-size: 2rem;
  color: white;
}

.empresa-info {
  flex: 1;
}

.empresa-nome {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  line-height: 1.3;
  word-break: break-word;
}

.empresa-cnpj {
  font-size: 0.9rem;
  color: #ccc;
  margin: 0;
  font-weight: 500;
}

/* ===== DETALHES DA EMPRESA ===== */
.empresa-detalhes {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.detalhe-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid #ff7f26;
}

.detalhe-icon {
  font-size: 1.2rem;
  color: #ff7f26;
  flex-shrink: 0;
  margin-top: 2px;
}

.detalhe-texto {
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
}

/* ===== BOTÃO ENTRAR ===== */
.btn-entrar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 55px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.btn-entrar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

.btn-entrar:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ===== ESTADO VAZIO ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ccc;
  margin: 0 0 15px 0;
}

.empty-description {
  font-size: 1.1rem;
  color: #888;
  margin: 0 0 30px 0;
  line-height: 1.5;
}

.btn-cadastrar-empresa {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 15px 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cadastrar-empresa:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* ===== MENSAGEM DE FEEDBACK ===== */
.mensagem-feedback {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

.mensagem-icon {
  font-size: 1.5rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .empresas-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .selecao-empresa-container {
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

  .empresas-content {
    padding: 0 10px;
  }

  .empresas-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .empresa-card {
    padding: 25px;
  }

  .empresa-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .empty-state {
    padding: 60px 20px;
  }

  .empty-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .empresa-card {
    padding: 20px;
  }

  .empresa-nome {
    font-size: 1.3rem;
  }

  .btn-entrar,
  .btn-cadastrar-empresa {
    height: 50px;
    font-size: 1rem;
  }
}
</style>
