<template>
  <div class="container">
    <!-- Botão de Logout -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">Caixa fechado</h1>
    <h4 class="frase">Logo mais estaremos de volta!</h4>

    <div class="botoes">
      <UiButton label="Encerrar expediente" class="btn" @click="abrirModalResumo" />
      <UiButton label="Abrir caixa" class="btn" @click="CaixaLivre" />
    </div>

    <!-- MODAL DE RESUMO DO EXPEDIENTE -->
    <q-dialog v-model="mostrarModalResumo" persistent class="modal-resumo">
      <q-card class="modal-resumo-card">
        <q-card-section class="modal-resumo-header">
          <div class="header-content">
            <q-icon name="summarize" class="modal-resumo-icon" />
            <div class="header-text">
              <h3 class="modal-resumo-title">Resumo do Expediente</h3>
              <p class="modal-resumo-subtitle">Resumo financeiro do dia</p>
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup class="btn-fechar-modal" />
        </q-card-section>

        <q-card-section class="modal-resumo-content">
          <!-- CARDS DE RESUMO PRINCIPAL -->
          <div class="resumo-principal">
            <div class="resumo-total">
              <div class="resumo-total-icon">
                <q-icon name="payments" />
              </div>
              <div class="resumo-total-info">
                <span class="resumo-total-label">Total Recebido</span>
                <h2 class="resumo-total-value">
                  R$ {{ formatarMoeda(resumoExpediente.totalRecebido) }}
                </h2>
              </div>
            </div>
          </div>

          <!-- FORMAS DE PAGAMENTO -->
          <div class="formas-pagamento-section">
            <h4 class="section-title">Formas de Pagamento</h4>
            <div class="formas-pagamento-grid">
              <div
                v-for="(forma, index) in resumoExpediente.formasPagamento"
                :key="index"
                class="forma-pagamento-card"
              >
                <div class="forma-pagamento-icon">
                  <q-icon :name="getPagamentoIcon(forma.forma_pagamento)" />
                </div>
                <div class="forma-pagamento-info">
                  <span class="forma-pagamento-label">{{
                    formatarFormaPagamento(forma.forma_pagamento)
                  }}</span>
                  <div class="forma-pagamento-valores">
                    <span class="forma-pagamento-valor"
                      >R$ {{ formatarMoeda(forma.valor_total) }}</span
                    >
                    <span class="forma-pagamento-quantidade">{{ forma.quantidade }} vendas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- RESUMO DETALHADO -->
          <div class="resumo-detalhado">
            <div class="resumo-item">
              <span class="resumo-item-label">Total de Vendas</span>
              <span class="resumo-item-value">{{ resumoExpediente.totalVendas }}</span>
            </div>
            <div class="resumo-item">
              <span class="resumo-item-label">Ticket Médio</span>
              <span class="resumo-item-value"
                >R$ {{ formatarMoeda(resumoExpediente.ticketMedio) }}</span
              >
            </div>
            <div class="resumo-item">
              <span class="resumo-item-label">Vendas Pendentes</span>
              <span class="resumo-item-value">{{ resumoExpediente.vendasPendentes }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="modal-resumo-actions">
          <q-btn
            label="Fechar Expediente"
            color="orange"
            unelevated
            class="btn-fechar-expediente"
            @click="fecharExpediente"
            :loading="fechandoExpediente"
          />
          <q-btn label="Cancelar" flat class="btn-cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton } from '../components/index.js'
import axios from 'axios'

const router = useRouter()

// Estados do modal
const mostrarModalResumo = ref(false)
const fechandoExpediente = ref(false)

// Dados do resumo do expediente
const resumoExpediente = ref({
  totalRecebido: 0,
  totalVendas: 0,
  ticketMedio: 0,
  vendasPendentes: 0,
  formasPagamento: [],
})

// Função para abrir o modal e carregar os dados
const abrirModalResumo = async () => {
  mostrarModalResumo.value = true
  await carregarResumoExpediente()
}

// Carregar dados do resumo do expediente
const carregarResumoExpediente = async () => {
  try {
    const empresaId = cadastroFuncionario.value.dadosLogin.codEmpresa

    // Carregar formas de pagamento do dia
    const responsePagamento = await axios.get(
      `http://localhost:3333/relatorio?tipo=FormasPagamento&periodo=Hoje&empresaId=${empresaId}`,
    )

    // Carregar resumo do dashboard do dia
    const responseResumo = await axios.get(
      `http://localhost:3333/relatorio?tipo=ResumoDashboard&periodo=Hoje&empresaId=${empresaId}`,
    )

    const formasPagamento = responsePagamento.data?.dadosExtras || []
    const resumo = responseResumo.data || {}

    // Calcular total recebido
    const totalRecebido = formasPagamento.reduce((total, forma) => {
      return total + (Number(forma.valor_total) || 0)
    }, 0)

    resumoExpediente.value = {
      totalRecebido,
      totalVendas: resumo.totalVendas || 0,
      ticketMedio: resumo.ticketMedio || 0,
      vendasPendentes: resumo.vendasPendentes || 0,
      formasPagamento: formasPagamento,
    }
  } catch (error) {
    console.error('Erro ao carregar resumo do expediente:', error)

    // Fallback em caso de erro
    resumoExpediente.value = {
      totalRecebido: 0,
      totalVendas: 0,
      ticketMedio: 0,
      vendasPendentes: 0,
      formasPagamento: [],
    }
  }
}

// Função para fechar o expediente
const fecharExpediente = async () => {
  fechandoExpediente.value = true

  try {
    // Aqui você pode adicionar lógica adicional se necessário
    // como registrar o fechamento do expediente no banco

    // Simulando um processamento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Fechar modal e redirecionar para home
    mostrarModalResumo.value = false
    router.push('/loginPage')
  } catch (error) {
    console.error('Erro ao fechar expediente:', error)
  } finally {
    fechandoExpediente.value = false
  }
}

// Funções auxiliares
const formatarMoeda = (valor) => {
  if (!valor) return '0,00'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const formatarFormaPagamento = (forma) => {
  const formas = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão Crédito',
    cartao_debito: 'Cartão Débito',
    outro: 'Outro',
  }
  return formas[forma] || forma
}

const getPagamentoIcon = (forma) => {
  const icons = {
    pix: 'qr_code',
    dinheiro: 'payments',
    cartao_credito: 'credit_card',
    cartao_debito: 'credit_score',
    outro: 'payment',
  }
  return icons[forma] || 'payment'
}

// Funções existentes
const CaixaLivre = () => {
  router.push('/CaixaLivre')
}

// Você precisará importar/store do cadastroFuncionario
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
</script>

<style scoped>
/* Estilos existentes mantidos */
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  padding-top: 80px;
}

.title {
  padding-top: 10%;
  color: white;
  font-size: 200px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 5%;
}

.frase {
  color: white;
  font-size: 50px;
  font-weight: bold;
  text-align: end;
  margin-left: 20%;
}

.botoes {
  width: 20%;
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ESTILOS DO MODAL DE RESUMO */
.modal-resumo-card {
  width: 90%;
  max-width: 600px;
  background: rgba(45, 45, 45, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-resumo-header {
  padding: 30px 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.modal-resumo-icon {
  font-size: 2.5rem;
  color: #ff7f26;
}

.header-text {
  flex: 1;
}

.modal-resumo-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: white;
}

.modal-resumo-subtitle {
  color: #ccc;
  margin: 0;
  font-size: 0.9rem;
}

.btn-fechar-modal {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #ccc;
}

.modal-resumo-content {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

/* RESUMO PRINCIPAL */
.resumo-principal {
  margin-bottom: 30px;
}

.resumo-total {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px;
  background: rgba(255, 127, 38, 0.1);
  border-radius: 15px;
  border: 1px solid rgba(255, 127, 38, 0.3);
}

.resumo-total-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 127, 38, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resumo-total-icon .q-icon {
  font-size: 2rem;
  color: #ff7f26;
}

.resumo-total-info {
  flex: 1;
}

.resumo-total-label {
  display: block;
  font-size: 0.9rem;
  color: #ccc;
  margin-bottom: 5px;
}

.resumo-total-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ff7f26;
  margin: 0;
}

/* FORMAS DE PAGAMENTO */
.formas-pagamento-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 15px 0;
}

.formas-pagamento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.forma-pagamento-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.forma-pagamento-card:hover {
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
}

.forma-pagamento-icon {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forma-pagamento-icon .q-icon {
  font-size: 1.5rem;
  color: #ff7f26;
}

.forma-pagamento-info {
  flex: 1;
}

.forma-pagamento-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.forma-pagamento-valores {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forma-pagamento-valor {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ff7f26;
}

.forma-pagamento-quantidade {
  font-size: 0.8rem;
  color: #ccc;
}

/* RESUMO DETALHADO */
.resumo-detalhado {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.resumo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.resumo-item:last-child {
  border-bottom: none;
}

.resumo-item-label {
  font-size: 0.9rem;
  color: #ccc;
}

.resumo-item-value {
  font-size: 1rem;
  font-weight: 600;
  color: white;
}

/* AÇÕES DO MODAL */
.modal-resumo-actions {
  padding: 20px 30px 30px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-fechar-expediente {
  font-weight: 600;
  padding: 12px 30px;
  min-width: 160px;
}

.btn-cancelar {
  color: #ccc;
  font-weight: 600;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
  .modal-resumo-card {
    width: 95%;
    margin: 10px;
  }

  .modal-resumo-content {
    padding: 20px;
  }

  .resumo-total {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .formas-pagamento-grid {
    grid-template-columns: 1fr;
  }

  .modal-resumo-actions {
    flex-direction: column;
  }

  .btn-fechar-expediente,
  .btn-cancelar {
    width: 100%;
  }
}
</style>
