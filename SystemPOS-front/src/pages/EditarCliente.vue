<template>
  <div class="editar-cliente-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="voltar" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">EDITAR CLIENTE</h1>

    <div class="content-wrapper">
      <div class="editar-card">
        <div class="card-header">
          <div class="avatar-edicao">
            <q-icon name="person" class="avatar-icon" />
          </div>
          <div class="titulo-edicao">
            <h2 class="cliente-nome-titulo">{{ cliente.nome_completo || 'Cliente' }}</h2>
            <span class="subtitulo-edicao">Editando informações do cliente</span>
          </div>
        </div>

        <!-- Estados -->
        <div v-if="carregando" class="loading-state">
          <div class="loading-spinner"></div>
          <span>Carregando dados do cliente...</span>
        </div>

        <div v-else-if="erro" class="error-state">
          <q-icon name="error" class="error-icon" />
          <span>{{ erro }}</span>
          <button class="btn-tentar-novamente" @click="buscarCliente">Tentar Novamente</button>
        </div>

        <div v-else class="formulario-edicao">
          <div class="form-grid">
            <!-- Nome -->
            <div class="form-group">
              <label class="form-label">
                <q-icon name="badge" class="label-icon" />
                Nome Completo
              </label>
              <input
                type="text"
                v-model="cliente.nome_completo"
                class="text-input"
                placeholder="Digite o nome completo"
              />
            </div>

            <!-- CPF -->
            <div class="form-group">
              <label class="form-label">
                <q-icon name="fingerprint" class="label-icon" />
                CPF
              </label>
              <input
                type="text"
                maxlength="14"
                v-model="cliente.cpf"
                @input="formatarCPF"
                class="text-input"
                placeholder="000.000.000-00"
              />
            </div>

            <!-- Telefone -->
            <div class="form-group">
              <label class="form-label">
                <q-icon name="phone" class="label-icon" />
                Telefone
              </label>
              <input
                type="text"
                maxlength="15"
                v-model="cliente.telefone"
                @input="formatarTelefone"
                class="text-input"
                placeholder="(00) 00000-0000"
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label">
                <q-icon name="email" class="label-icon" />
                Email
              </label>
              <input
                type="email"
                v-model="cliente.email"
                class="text-input"
                placeholder="cliente@email.com"
              />
            </div>

            <!-- Endereço -->
            <div class="form-group full-width">
              <label class="form-label">
                <q-icon name="home" class="label-icon" />
                Endereço
              </label>
              <input
                type="text"
                v-model="cliente.endereco"
                class="text-input"
                placeholder="Rua, número, bairro, cidade - estado"
              />
            </div>
          </div>

          <!-- Botões -->
          <div class="acoes-footer">
            <button class="btn-cancelar" @click="voltar">
              <q-icon name="close" class="btn-icon" />
              Cancelar
            </button>
            <button class="btn-salvar" @click="salvarEdicao">
              <q-icon name="check" class="btn-icon" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      <!-- Card informativo -->
      <div class="info-card">
        <div class="info-header">
          <q-icon name="info" class="info-header-icon" />
          <h3 class="info-title">Dicas de Edição</h3>
        </div>

        <div class="info-content">
          <div class="info-item">
            <q-icon name="verified" class="info-icon" />
            <div class="info-text">
              <strong>Validação Automática</strong>
              <span>CPF e telefone são formatados automaticamente</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="update" class="info-icon" />
            <div class="info-text">
              <strong>Salvamento Rápido</strong>
              <span>Alterações são salvas instantaneamente</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="security" class="info-icon" />
            <div class="info-text">
              <strong>Dados Seguros</strong>
              <span>Suas informações são protegidas</span>
            </div>
          </div>
        </div>

        <div class="status-cliente">
          <div class="status-item">
            <span class="status-label">Última Atualização:</span>
            <span class="status-value">Agora</span>
          </div>
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-badge ativo">Ativo</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { cliente } from 'src/stores/registroCliente.js'

export default {
  name: 'EditarCliente',

  data() {
    return {
      carregando: true,
      erro: null,
      cliente: {
        nome_completo: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
      },
    }
  },

  mounted() {
    this.buscarCliente()
  },

  methods: {
    async buscarCliente() {
      try {
        this.carregando = true
        this.erro = null
        const id = cliente.value?.dados?.id
        if (!id) throw new Error('ID do cliente não encontrado.')

        const res = await axios.get(`http://localhost:3333/clientes/detalhe/${id}`)
        this.cliente = res.data || {}

        if (this.cliente.cpf) this.formatarCPF()
        if (this.cliente.telefone) this.formatarTelefone()
      } catch (err) {
        console.error(err)
        this.erro = '❌ Erro ao carregar dados do cliente.'
      } finally {
        this.carregando = false
      }
    },

    async salvarEdicao() {
      try {
        if (!this.cliente.nome_completo || !this.cliente.cpf || !this.cliente.telefone) {
          this.mostrarFeedback('❌ Nome, CPF e telefone são obrigatórios!', false)
          return
        }

        const id = cliente.value?.dados?.id
        if (!id) throw new Error('ID do cliente não encontrado.')

        const dadosAtualizados = {
          nome: this.cliente.nome_completo.trim(),
          cpf: this.cliente.cpf.replace(/\D/g, ''),
          telefone: this.cliente.telefone.replace(/\D/g, ''),
          email: this.cliente.email.trim(),
          endereco: this.cliente.endereco.trim(),
        }

        console.log('Enviando para o backend:', dadosAtualizados)

        await axios.put(`http://localhost:3333/clientes/${id}`, dadosAtualizados)
        this.mostrarFeedback('✅ Cliente atualizado com sucesso!', true)

        setTimeout(() => this.$router.back(), 1500)
      } catch (err) {
        console.error('Erro no PUT:', err)
        this.mostrarFeedback('❌ Erro ao atualizar cliente.', false)
      }
    },

    mostrarFeedback(msg, sucesso = true) {
      const feedback = document.createElement('div')
      feedback.textContent = msg
      feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${sucesso ? '#4caf50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: fadeInOut 3s ease forwards;
      `
      document.body.appendChild(feedback)
      setTimeout(() => feedback.remove(), 3000)
    },

    formatarCPF() {
      let v = this.cliente.cpf.replace(/\D/g, '')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d)/, '$1.$2')
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      this.cliente.cpf = v
    },

    formatarTelefone() {
      let v = this.cliente.telefone.replace(/\D/g, '')
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
      v = v.replace(/(\d{5})(\d{4})$/, '$1-$2')
      this.cliente.telefone = v
    },

    voltar() {
      this.$router.back()
    },
  },
}
</script>

<style scoped>
@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
/* ======= Mantém todo o seu CSS original ======= */
.editar-cliente-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  color: white;
}
/* ===== CONTAINER PRINCIPAL ===== */
.editar-cliente-container {
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

/* ===== LAYOUT DO CONTEÚDO ===== */
.content-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

/* ===== CARD PRINCIPAL DE EDIÇÃO ===== */
.editar-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ===== HEADER DO CARD ===== */
.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-edicao {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 2.5rem;
  color: white;
}

.titulo-edicao {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cliente-nome-titulo {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.subtitulo-edicao {
  color: #ccc;
  font-size: 1.1rem;
  font-weight: 500;
}

/* ===== ESTADOS DE CARREGAMENTO E ERRO ===== */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  gap: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #ff7f26;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-state {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  padding: 40px;
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
}

.btn-tentar-novamente {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-tentar-novamente:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ===== FORMULÁRIO ===== */
.formulario-edicao {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Campo de endereço ocupa linha inteira */
.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

.label-icon {
  font-size: 1.2rem;
  color: #ff7f26;
}

.form-input {
  width: 100%;
  height: 55px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  padding: 0 20px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #ff7f26;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 127, 38, 0.1);
}

.form-input::placeholder {
  color: #888;
}

/* Estilo específico para inputs com máscara */
.form-input[placeholder*='000.000.000-00'],
.form-input[placeholder*='(00) 00000-0000'] {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

/* ===== BOTÕES DE AÇÃO ===== */
.acoes-footer {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancelar,
.btn-salvar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  justify-content: center;
}

.btn-cancelar {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancelar:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-salvar {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.btn-salvar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-icon {
  font-size: 1.2rem;
}

/* ===== CARD INFORMATIVO ===== */
.info-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-header-icon {
  font-size: 1.8rem;
  color: #ff7f26;
}

.info-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.info-content {
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
  font-size: 1.3rem;
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

.status-cliente {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.status-label {
  color: #ccc;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-value {
  color: white;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.ativo {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* ===== ANIMAÇÕES ===== */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .info-card {
    order: -1;
  }
}

@media (max-width: 768px) {
  .editar-cliente-container {
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

  .editar-card {
    padding: 25px;
  }

  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .acoes-footer {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-salvar {
    min-width: auto;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .cliente-nome-titulo {
    font-size: 1.6rem;
  }

  .editar-card {
    padding: 20px;
  }

  .info-card {
    padding: 20px;
  }

  .info-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
