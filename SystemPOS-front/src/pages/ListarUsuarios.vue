<template>
  <div class="usuarios-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="goHome()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">USUÁRIOS DO SISTEMA</h1>

    <div class="content-wrapper">
      <!-- Seção de pesquisa e lista -->
      <div class="lista-section">
        <div class="search-card">
          <div class="input-com-icone">
            <svg class="icone-pesquisa" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <input
              v-model="filtro"
              type="text"
              placeholder="Buscar por nome ou código de barras..."
              class="search-input"
            />
          </div>
        </div>

        <div class="usuarios-card">
          <div class="card-header">
            <h3 class="section-title">Usuários Cadastrados</h3>
            <div class="resultados-info">
              <span class="total-usuarios">{{ usuariosFiltrados.length }} usuários</span>
              <span class="usuarios-ativos">{{ usuariosAtivos }} ativos</span>
            </div>
          </div>

          <div class="scrollview">
            <div v-if="carregando" class="carregando">
              <q-icon name="refresh" class="carregando-icon" />
              <p>Carregando usuários...</p>
            </div>

            <div v-else-if="usuarios.length === 0" class="sem-usuarios">
              <q-icon name="people_outline" class="sem-usuarios-icon" />
              <p>Nenhum usuário cadastrado</p>
              <span>Não há usuários registrados no sistema</span>
            </div>

            <div v-else-if="usuariosFiltrados.length === 0" class="sem-resultados">
              <q-icon name="search_off" class="sem-resultados-icon" />
              <p>Nenhum usuário encontrado</p>
              <span>Tente ajustar os termos da pesquisa</span>
            </div>

            <div v-else class="usuarios-list">
              <div v-for="usuario in usuariosFiltrados" :key="usuario.codigo_barras" class="usuario-item">
                <div class="usuario-content">
                  <div class="usuario-info">
                    <div class="info-main">
                      <h4 class="usuario-nome">{{ usuario.nome_completo }}</h4>
                      <span class="usuario-email">{{ usuario.email }}</span>
                    </div>

                    <div class="info-detalhes">
                      <div class="detalhe-item">
                        <span class="detalhe-label">Telefone:</span>
                        <span class="detalhe-valor contato">{{ usuario.telefone }}</span>
                      </div>
                      <div class="detalhe-item">
                        <span class="detalhe-label">Tipo:</span>
                        <span class="detalhe-valor tipo">{{ formatarTipoUsuario(usuario.tipo) }}</span>
                      </div>
                      <div class="detalhe-item">
                        <span class="detalhe-label">Status:</span>
                        <span :class="['status-badge', usuario.ativo === 1 ? 'ativo' : 'inativo']">
                          {{ Ativo(usuario) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="usuario-actions">
                    <div class="status-indicator" :class="usuario.ativo === 1 ? 'ativo' : 'inativo'"></div>
                    <button class="btn-gerenciar" @click="GerenciarPermissoes(usuario)">
                      <q-icon name="admin_panel_settings" class="btn-icon" />
                      Gerenciar Permissões
                    </button>
                  </div>
                </div>

                <div class="usuario-indicator">
                  <div class="indicator-bar">
                    <div
                      class="indicator-fill"
                      :class="usuario.ativo === 1 ? 'ativo' : 'inativo'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção informativa -->
      <div class="info-section">
        <div class="info-card">
          <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

          <div class="info-content">
            <h3 class="section-title">Gestão de Usuários</h3>

            <div class="info-grid">
              <div class="info-item">
                <q-icon name="manage_accounts" class="info-icon" />
                <div class="info-text">
                  <strong>Controle de Acesso</strong>
                  <span>Gerencie permissões e níveis de acesso</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="security" class="info-icon" />
                <div class="info-text">
                  <strong>Permissões Granulares</strong>
                  <span>Defina acesso por funcionalidade</span>
                </div>
              </div>

              <div class="info-item">
                <q-icon name="toggle_on" class="info-icon" />
                <div class="info-text">
                  <strong>Ativação/Desativação</strong>
                  <span>Controle o acesso dos usuários</span>
                </div>
              </div>
            </div>

            <div class="status-guide">
              <h4 class="guide-title">Status dos Usuários</h4>
              <div class="guide-items">
                <div class="guide-item">
                  <div class="guide-color ativo"></div>
                  <span>Usuário Ativo</span>
                </div>
                <div class="guide-item">
                  <div class="guide-color inativo"></div>
                  <span>Usuário Inativo</span>
                </div>
              </div>
            </div>

            <div class="tipos-usuario">
              <h4 class="info-title">Tipos de Usuário</h4>
              <div class="tipos-content">
                <q-icon name="groups" class="tipos-icon" />
                <div class="tipos-text">
                  <strong>{{ usuariosFiltrados.length }} usuários</strong>
                  <span>{{ usuariosAtivos }} ativos no sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { emailDono } from '../stores/registroDono.js'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'

const filtro = ref('')
const usuarios = ref([])
const carregando = ref(true)

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter((usuario) =>
    usuario.nome_completo.toLowerCase().includes(filtro.value.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.value.toLowerCase()) ||
    usuario.telefone.includes(filtro.value)
  )
})

const usuariosAtivos = computed(() => {
  return usuarios.value.filter(usuario => usuario.ativo === 1).length
})

const router = useRouter()
const goHome = () => router.push('/home')

const Ativo = (usuario) => {
  return usuario.ativo === 1 ? 'Ativo' : 'Desativado'
}

const formatarTipoUsuario = (tipo) => {
  const tipos = {
    'admin': 'Administrador',
    'gerente': 'Gerente',
    'funcionario': 'Funcionário',
    'vendedor': 'Vendedor'
  }
  return tipos[tipo] || tipo
}

const GerenciarPermissoes = (usuario) => {
  emailDono.value.dadosDono.email = usuario.email
  router.push('/GerenciarPermissoes')
}

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/user/LU/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )
    usuarios.value = response.data.message
  } catch (error) {
    console.error('Erro ao buscar os usuários:', error)
  } finally {
    carregando.value = false
  }
})

</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.usuarios-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
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

/* ===== LAYOUT DO CONTEÚDO ===== */
.content-wrapper {
  display: flex;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  min-height: 600px;
}

/* ===== SEÇÃO DA LISTA ===== */
.lista-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.input-com-icone {
  position: relative;
  width: 100%;
}

.icone-pesquisa {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  color: #888;
  pointer-events: none;
  transition: color 0.3s ease;
}

.search-input {
  width: 100%;
  height: 60px;
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1.1rem;
  padding: 0 20px 0 55px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-weight: 500;
}

.search-input:focus {
  outline: none;
  border-color: #ff7f26;
  background-color: #222;
  box-shadow: 0 0 0 2px rgba(255, 127, 38, 0.1);
}

.search-input:focus + .icone-pesquisa {
  color: #ff7f26;
}

.search-input::placeholder {
  color: #888;
}

.usuarios-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 25px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.resultados-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.total-usuarios {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.usuarios-ativos {
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 600;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.scrollview {
  min-height: 100vh;
  flex: 1;
  overflow-y: auto;
  padding: 0 25px 25px;
  max-height: 60vh;
}

/* ===== LISTA DE USUÁRIOS ===== */
.usuarios-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.usuario-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.usuario-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.usuario-content {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 15px;
}

.usuario-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-main {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.usuario-nome {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
  line-height: 1.3;
}

.usuario-email {
  font-size: 0.95rem;
  color: #ccc;
  font-weight: 500;
}

.info-detalhes {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detalhe-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detalhe-label {
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
}

.detalhe-valor {
  font-size: 0.95rem;
  color: white;
  font-weight: 600;
}

.detalhe-valor.contato {
  color: #2196f3;
}

.detalhe-valor.tipo {
  color: #ff7f26;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.ativo {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.status-badge.inativo {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
  border: 1px solid #f44336;
}

.usuario-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
  align-items: flex-end;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.status-indicator.ativo {
  background: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.status-indicator.inativo {
  background: #f44336;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.5);
}

.btn-gerenciar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-gerenciar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 127, 38, 0.3);
}

.btn-icon {
  font-size: 1.1rem;
}

/* ===== INDICADOR DE USUÁRIO ===== */
.usuario-indicator {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.indicator-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
  width: 100%;
}

.indicator-fill.ativo {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.indicator-fill.inativo {
  background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
}

/* ===== ESTADOS DE CARREGAMENTO E SEM USUÁRIOS ===== */
.carregando {
  text-align: center;
  color: #888;
  padding: 60px 20px;
}

.carregando-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.carregando p {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.sem-usuarios,
.sem-resultados {
  text-align: center;
  color: #888;
  padding: 60px 20px;
}

.sem-usuarios-icon,
.sem-resultados-icon {
  font-size: 4rem;
  color: #666;
  margin-bottom: 20px;
}

.sem-usuarios p,
.sem-resultados p {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.sem-usuarios span,
.sem-resultados span {
  font-size: 0.95rem;
  color: #777;
}

/* ===== SEÇÃO INFORMATIVA ===== */
.info-section {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.logo {
  width: 180px;
  height: auto;
  align-self: center;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid #ff7f26;
}

.info-icon {
  font-size: 1.5rem;
  color: #ff7f26;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-text strong {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.info-text span {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* ===== GUIA DE STATUS ===== */
.status-guide {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.guide-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  text-align: center;
}

.guide-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.guide-color {
  width: 20px;
  height: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.guide-color.ativo {
  background: linear-gradient(90deg, #4caf50 0%, #45a049 100%);
}

.guide-color.inativo {
  background: linear-gradient(90deg, #f44336 0%, #d32f2f 100%);
}

.guide-item span {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== TIPOS DE USUÁRIO ===== */
.tipos-usuario {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
  text-align: center;
}

.tipos-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.tipos-icon {
  font-size: 2rem;
  color: #ff7f26;
  flex-shrink: 0;
}

.tipos-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tipos-text strong {
  color: white;
  font-size: 1rem;
  font-weight: 600;
}

.tipos-text span {
  color: #ccc;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* ===== SCROLLBAR PERSONALIZADA ===== */
.scrollview::-webkit-scrollbar {
  width: 8px;
}

.scrollview::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb {
  background: #ff7f26;
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb:hover {
  background: #e67322;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 30px;
    max-width: 800px;
  }

  .info-section {
    max-width: 100%;
  }

  .usuario-content {
    flex-wrap: wrap;
  }

  .usuario-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .usuarios-container {
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

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .resultados-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .info-detalhes {
    flex-direction: column;
    gap: 8px;
  }

  .usuario-indicator {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .usuario-content {
    flex-direction: column;
    text-align: center;
  }

  .usuario-actions {
    justify-content: center;
  }

  .logo {
    width: 150px;
  }

  .guide-items {
    gap: 8px;
  }

  .guide-item span {
    font-size: 0.8rem;
  }

  .tipos-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>