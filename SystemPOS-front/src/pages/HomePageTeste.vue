<template>
  <div class="home-container">
    <!-- HEADER -->
    <header class="home-header">
      <div class="welcome-section">
        <h1 class="welcome-title">Bem vindo, {{ usuario }}!</h1>
        <p class="welcome-subtitle">Gerencie seu negócio de forma inteligente</p>
      </div>
      <div class="header-actions"></div>
    </header>

    <!-- LAYOUT PRINCIPAL -->
    <div class="home-layout">
      <!-- SIDEBAR ESQUERDA - MENU PRINCIPAL -->
      <nav class="sidebar left-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Menu Principal</h3>
        </div>

        <ul class="sidebar-menu">
          <li v-if="form.cadastrarEmpresa" @click="addEmpresa" class="menu-item">
            <q-icon name="business" class="menu-icon" />
            <span class="menu-text">Adicionar empresa</span>
          </li>
          <li v-if="form.adicionarProduto" @click="CadastroProdutos" class="menu-item">
            <q-icon name="inventory_2" class="menu-icon" />
            <span class="menu-text">Adicionar produto</span>
          </li>
          <li v-if="form.adicionarUsuario" @click="AdicionarUsuario" class="menu-item">
            <q-icon name="person_add" class="menu-icon" />
            <span class="menu-text">Adicionar Usuário</span>
          </li>
          <li v-if="form.cadastrarEmpresa" @click="AlterarEmpresa" class="menu-item">
            <q-icon name="business_center" class="menu-icon" />
            <span class="menu-text">Alterar empresa</span>
          </li>
          <li v-if="form.adicionarPromocao" @click="AdicionarPromocao" class="menu-item">
            <q-icon name="local_offer" class="menu-icon" />
            <span class="menu-text">Alterar preço</span>
          </li>
          <li v-if="form.adicionarCliente" @click="cadastrarCliente" class="menu-item">
            <q-icon name="groups" class="menu-icon" />
            <span class="menu-text">Lista de Cliente</span>
          </li>
          <li v-if="form.prestesAVencer" @click="PrestesAVencer" class="menu-item">
            <q-icon name="warning" class="menu-icon" />
            <span class="menu-text">Prestes a vencer</span>
          </li>
          <li v-if="form.reporEstoque" @click="ReporEstoque" class="menu-item">
            <q-icon name="refresh" class="menu-icon" />
            <span class="menu-text">Repor estoque</span>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="btn-sair" @click="mostrarConfirmLogout = true">
            <q-icon name="exit_to_app" class="btn-icon" />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      <!-- CONTEÚDO PRINCIPAL -->
      <main class="main-content">
        <!-- CARDS DE RESUMO -->
        <section v-if="form.relatorios" class="resumo-section">
          <h2 class="section-title">Resumo do Período</h2>
          <div class="resumo-grid">
            <!-- Card Total de Vendas -->
            <div class="resumo-card vendas">
              <div class="resumo-icon">
                <q-icon name="shopping_cart" />
              </div>
              <div class="resumo-content">
                <h3 class="resumo-value">{{ resumo.totalVendas || '0' }}</h3>
                <p class="resumo-label">Total de Vendas</p>
                <span class="resumo-periodo">{{ periodo }}</span>
              </div>
            </div>

            <!-- Card Valor Total -->
            <div class="resumo-card valor">
              <div class="resumo-icon">
                <q-icon name="payments" />
              </div>
              <div class="resumo-content">
                <h3 class="resumo-value">R$ {{ formatarMoeda(resumo.valorTotal) }}</h3>
                <p class="resumo-label">Valor Total</p>
                <span class="resumo-periodo">{{ periodo }}</span>
              </div>
            </div>

            <!-- Card Ticket Médio -->
            <div class="resumo-card ticket">
              <div class="resumo-icon">
                <q-icon name="trending_up" />
              </div>
              <div class="resumo-content">
                <h3 class="resumo-value">R$ {{ formatarMoeda(resumo.ticketMedio) }}</h3>
                <p class="resumo-label">Ticket Médio</p>
                <span class="resumo-periodo">{{ periodo }}</span>
              </div>
            </div>

            <!-- Card Vendas Pendentes -->
            <div class="resumo-card pendentes">
              <div class="resumo-icon">
                <q-icon name="schedule" />
              </div>
              <div class="resumo-content">
                <h3 class="resumo-value">{{ resumo.vendasPendentes || '0' }}</h3>
                <p class="resumo-label">Pendentes</p>
                <span class="resumo-periodo">Aguardando pagamento</span>
              </div>
            </div>
          </div>
        </section>

        <!-- PRODUTOS PRESTES A VENCER -->
        <section v-if="form.prestesAVencer" class="vencimento-section">
          <div class="section-header">
            <h2 class="section-title">
              <q-icon name="warning" class="section-title-icon" />
              Produtos Prestes a Vencer
            </h2>

            <q-btn
              label="Ver Todos"
              @click="PrestesAVencer"
              color="orange"
              flat
              class="btn-ver-todos"
            />
          </div>

          <div class="carrossel-container">
            <div v-if="gruposImagens.length > 0" class="carrossel-vencimento">
              <q-carousel
                v-model="slide"
                transition-prev="slide-right"
                transition-next="slide-left"
                swipeable
                animated
                arrows
                control-color="orange"
                navigation
                infinite
                height="160px"
                autoplay="3000"
                class="custom-carrossel"
              >
                <q-carousel-slide
                  v-for="(grupo, index) in gruposImagens"
                  :name="index"
                  :key="index"
                  class="carrossel-slide"
                >
                  <div class="produtos-grid" :class="{ centered: grupo.length < 7 }">
                    <div v-for="(img, i) in grupo" :key="i" class="produto-item">
                      <img :src="img" alt="Produto" class="produto-imagem" />
                      <div class="produto-overlay">
                        <q-icon name="visibility" class="overlay-icon" />
                      </div>
                    </div>
                  </div>
                </q-carousel-slide>
              </q-carousel>
            </div>

            <div v-else class="empty-vencimento">
              <q-icon name="inventory_2" class="empty-icon" />
              <h3>Nenhum produto prestes a vencer</h3>
              <p>Todos os produtos estão com validade em dia</p>
            </div>
          </div>
        </section>

        <!-- DASHBOARD ANALÍTICO -->
        <section v-if="form.relatorios" class="dashboard-section">
          <div class="section-header">
            <h2 class="section-title">
              <q-icon name="analytics" class="section-title-icon" />
              Dashboard Analítico
            </h2>
            <div class="dashboard-actions">
              <q-select
                v-model="periodo"
                :options="opcoesPeriodo"
                outlined
                dense
                class="periodo-select"
                @update:model-value="carregarTodosDados"
              />
              <q-btn
                label="Histórico"
                @click="verHistorico"
                color="orange"
                flat
                class="btn-action"
              />
              <q-btn label="Baixar PDF" color="orange" flat class="btn-action" @click="baixarPDF" />
            </div>
          </div>

          <!-- Grid de Gráficos -->
          <div class="graficos-grid">
            <!-- Gráfico 1: Vendas (Barras) -->
            <div class="grafico-card">
              <div class="grafico-header">
                <h3 class="grafico-title">Vendas por Categoria</h3>
                <q-icon name="bar_chart" class="grafico-icon" />
              </div>
              <div v-if="semDadosVendas" class="grafico-empty">
                <q-icon name="show_chart" class="empty-icon" />
                <p>Não há dados de vendas</p>
              </div>
              <ApexCharts
                v-else
                type="bar"
                height="180"
                :options="chartOptionsBar"
                :series="seriesBar"
                class="grafico-content"
              />
            </div>

            <!-- Gráfico 2: Formas de Pagamento (Pizza) -->
            <div class="grafico-card">
              <div class="grafico-header">
                <h3 class="grafico-title">Formas de Pagamento</h3>
                <q-icon name="pie_chart" class="grafico-icon" />
              </div>
              <div v-if="semDadosPagamento" class="grafico-empty">
                <q-icon name="pie_chart" class="empty-icon" />
                <p>Não há dados de pagamento</p>
              </div>
              <ApexCharts
                v-else
                type="pie"
                height="180"
                :options="chartOptionsPie"
                :series="seriesPie"
                class="grafico-content"
              />
            </div>

            <!-- Gráfico 3: Evolução (Linha) -->
            <div class="grafico-card">
              <div class="grafico-header">
                <h3 class="grafico-title">Evolução de Vendas</h3>
                <q-icon name="trending_up" class="grafico-icon" />
              </div>
              <div v-if="semDadosEvolucao" class="grafico-empty">
                <q-icon name="timeline" class="empty-icon" />
                <p>Não há dados de evolução</p>
              </div>
              <ApexCharts
                v-else
                type="line"
                height="180"
                :options="chartOptionsLine"
                :series="seriesLine"
                class="grafico-content"
              />
            </div>

            <!-- Gráfico 4: Status (Donut) -->
            <div class="grafico-card">
              <div class="grafico-header">
                <h3 class="grafico-title">Status das Vendas</h3>
                <q-icon name="donut_large" class="grafico-icon" />
              </div>
              <div v-if="semDadosStatus" class="grafico-empty">
                <q-icon name="donut_large" class="empty-icon" />
                <p>Não há dados de status</p>
              </div>
              <ApexCharts
                v-else
                type="donut"
                height="180"
                :options="chartOptionsDonut"
                :series="seriesDonut"
                class="grafico-content"
              />
            </div>
          </div>

          <!-- Botão de Atualização -->
          <div class="dashboard-footer">
            <q-btn
              label="Atualizar Dados"
              color="orange"
              icon="refresh"
              class="btn-atualizar"
              @click="carregarTodosDados"
              :loading="carregando"
            />
          </div>
        </section>
      </main>

      <!-- SIDEBAR DIREITA - GERENCIAR PERMISSÕES -->
      <aside v-if="form.gerenciarPermissoes" class="sidebar right-sidebar">
        <div class="sidebar-header">
          <q-icon name="admin_panel_settings" class="sidebar-icon" />
          <h3 class="sidebar-title">Gerenciar Usuários</h3>
        </div>

        <div class="usuarios-list">
          <div
            class="usuario-card"
            v-for="(usuario, index) in usuariosHome"
            :key="index"
            @click="GerenciarPermissoes(usuario)"
          >
            <div class="usuario-avatar">
              <q-icon name="person" class="avatar-icon" />
            </div>
            <div class="usuario-info">
              <h4 class="usuario-nome">{{ usuario.nome_completo }}</h4>
              <p class="usuario-email">{{ usuario.email }}</p>
            </div>
            <q-icon name="chevron_right" class="usuario-arrow" />
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="btn-ver-todos-users" @click="$router.push('/listarUsuarios')">
            <span>Ver Todos os Usuários</span>
            <q-icon name="keyboard_arrow_down" class="btn-icon" />
          </button>
          <!-- BOTÃO INICIAR EXPEDIENTE -->
          <button v-if="form.iniciarExpediente" class="btn-sair" @click="iniciarExpediente">
            <q-icon name="point_of_sale" class="expediente-icon" />
            <span>Iniciar Expediente</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- MODAL DE CONFIRMAÇÃO DE SAÍDA -->
    <q-dialog v-model="mostrarConfirmLogout">
      <q-card class="modal-card">
        <q-card-section class="modal-header">
          <q-icon name="logout" class="modal-icon" />
          <h3 class="modal-title">Deseja realmente sair?</h3>
        </q-card-section>

        <q-card-section class="modal-content">
          <p>Você será desconectado do sistema</p>
        </q-card-section>

        <q-card-actions class="modal-actions">
          <q-btn
            label="Sair"
            color="orange"
            unelevated
            class="btn-modal btn-sair"
            @click="logout"
          />
          <q-btn
            label="Cancelar"
            color="grey"
            unelevated
            class="btn-modal btn-cancelar"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODAL CONTA DESATIVADA -->
    <q-dialog v-model="mostrarContaDesativada">
      <q-card class="modal-card conta-desativada">
        <q-card-section class="modal-header">
          <q-icon name="block" class="modal-icon error" />
          <h3 class="modal-title">Conta Desativada</h3>
        </q-card-section>

        <q-card-section class="modal-content">
          <p>Sua conta foi desativada. Você será desconectado automaticamente.</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import { emailDono } from '../stores/registroDono.js'
import ApexCharts from 'vue3-apexcharts'
import axios from 'axios'

// Carrossel Prestes a Vencer
const slide = ref(0)
const imagensPorSlide = 7
const imagensPrestesAVencer = ref([])
const fallbackImg = '../assets/fallback.PNG'

const gruposImagens = computed(() => {
  if (!imagensPrestesAVencer.value || imagensPrestesAVencer.value.length === 0) {
    return []
  }
  const grupos = []
  for (let i = 0; i < imagensPrestesAVencer.value.length; i += imagensPorSlide) {
    grupos.push(imagensPrestesAVencer.value.slice(i, i + imagensPorSlide))
  }
  return grupos
})

// Variáveis principais
const usuariosHome = ref([])
const usuario = ref('')
const mostrarTrocarEmpresa = ref(false)
const mostrarConfirmLogout = ref(false)
const mostrarContaDesativada = ref(false)

// Form de permissões
const form = ref({
  adicionarUsuario: 1,
  adicionarCliente: 1,
  adicionarPromocao: 1,
  adicionarProduto: 1,
  cadastrarEmpresa: 1,
  relatorios: 1,
  prestesAVencer: 1,
  reporEstoque: 1,
  iniciarExpediente: 1,
  gerenciarPermissoes: 1,
  desativarConta: 0,
})

const router = useRouter()

// ==================== DADOS DO RESUMO ====================
const resumo = ref({
  totalVendas: 0,
  valorTotal: 0,
  ticketMedio: 0,
  vendasPendentes: 0,
})

// ==================== GRÁFICOS ====================
const periodo = ref('Mês')
const carregando = ref(false)

const opcoesPeriodo = ['Hoje', 'Semana', 'Mês', 'Ano']

// Estados para controle de dados
const semDadosVendas = ref(false)
const semDadosPagamento = ref(false)
const semDadosEvolucao = ref(false)
const semDadosStatus = ref(false)

// Gráfico de Barras (Vendas) - Compacto
const seriesBar = ref([{ name: 'Vendas (R$)', data: [] }])
const chartOptionsBar = ref({
  chart: {
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  xaxis: {
    categories: [],
    labels: {
      style: {
        colors: '#666',
        fontSize: '10px',
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      endingShape: 'rounded',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['transparent'],
  },
  colors: ['#ff7f26'],
  grid: {
    borderColor: '#f0f0f0',
    strokeDashArray: 3,
  },
  yaxis: {
    labels: {
      formatter: function (value) {
        return 'R$ ' + value.toFixed(0)
      },
      style: {
        fontSize: '10px',
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (value) {
        return 'R$ ' + value.toFixed(2)
      },
    },
  },
})

// Gráfico de Pizza (Pagamento) - Compacto
const seriesPie = ref([])
const chartOptionsPie = ref({
  chart: {
    toolbar: { show: false },
  },
  labels: [],
  colors: ['#ff7f26', '#ffa726', '#ffcc80', '#ffe0b2', '#ffebcd', '#fff3e0'],
  legend: {
    position: 'bottom',
    fontSize: '10px',
    labels: {
      colors: '#666',
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '10px',
    },
  },
  tooltip: {
    y: {
      formatter: function (value) {
        return value + ' vendas'
      },
    },
  },
})

// Gráfico de Linha (Evolução) - Compacto
const seriesLine = ref([{ name: 'Vendas (R$)', data: [] }])
// Gráfico de Linha (Evolução) - Configuração Inicial para Duas Linhas
const chartOptionsLine = ref({
  chart: {
    type: 'line',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: {
      enabled: true
    }
  },
  xaxis: {
    categories: [],
    labels: {
      style: {
        colors: '#666',
        fontSize: '10px',
      },
    },
  },
  stroke: {
    curve: 'smooth',
    width: [3, 2],
  },
  colors: ['#ff7f26', '#3498db'],
  grid: {
    borderColor: '#f0f0f0',
    strokeDashArray: 3,
  },
  yaxis: [
    {
      seriesName: 'Valor (R$)',
      axisTicks: { show: true },
      axisBorder: { show: true, color: '#ff7f26' },
      labels: {
        style: { colors: '#ff7f26', fontSize: '10px' },
        formatter: function(value) {
          return 'R$ ' + value.toFixed(0);
        }
      },
      title: {
        text: 'Valor (R$)',
        style: { color: '#ff7f26', fontSize: '11px' }
      }
    },
    {
      seriesName: 'Quantidade',
      opposite: true,
      axisTicks: { show: true },
      axisBorder: { show: true, color: '#3498db' },
      labels: {
        style: { colors: '#3498db', fontSize: '10px' },
        formatter: function(value) {
          return value.toFixed(0);
        }
      },
      title: {
        text: 'Quantidade',
        style: { color: '#3498db', fontSize: '11px' }
      }
    }
  ],
  tooltip: {
    shared: true,
    intersect: false
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
});

// Gráfico de Donut (Status) - Compacto
const seriesDonut = ref([])
const chartOptionsDonut = ref({
  chart: {
    toolbar: { show: false },
  },
  labels: [],
  colors: ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0'],
  legend: {
    position: 'bottom',
    fontSize: '10px',
    labels: {
      colors: '#666',
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '45%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '12px',
            color: '#666',
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#ff7f26',
          },
          total: {
            show: true,
            fontSize: '12px',
            label: 'Total',
            color: '#ff7f26',
          },
        },
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (value) {
        return value + ' vendas'
      },
    },
  },
})

const usuarioId = ref(null)
const empresaId = ref(null)
const carregado = ref(false)

// ==================== FUNÇÕES UTILITÁRIAS ====================

function formatarMoeda(valor) {
  if (!valor) return '0,00'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ==================== FUNÇÕES DE CARREGAMENTO ====================

// Função para carregar todos os dados (resumo + gráficos)
async function carregarTodosDados() {
  if (!carregado.value) return

  carregando.value = true
  try {
    await Promise.all([carregarDadosResumo(), carregarTodosGraficos()])
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  } finally {
    carregando.value = false
  }
}

// Carregar dados do resumo
async function carregarDadosResumo() {
  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=ResumoDashboard&periodo=${periodo.value}&empresaId=${empresaId.value}`,
    )

    const dados = response?.data

    if (dados) {
      resumo.value = {
        totalVendas: dados.totalVendas || 0,
        valorTotal: dados.valorTotal || 0,
        ticketMedio: dados.ticketMedio || 0,
        vendasPendentes: dados.vendasPendentes || 0,
      }
    } else {
      // Fallback caso não tenha dados
      resumo.value = {
        totalVendas: 0,
        valorTotal: 0,
        ticketMedio: 0,
        vendasPendentes: 0,
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do resumo:', error)
    // Fallback em caso de erro
    resumo.value = {
      totalVendas: 0,
      valorTotal: 0,
      ticketMedio: 0,
      vendasPendentes: 0,
    }
  }
}

// Função para carregar todos os gráficos
async function carregarTodosGraficos() {
  try {
    await Promise.all([
      carregarGraficoVendas(),
      carregarGraficoPagamento(),
      carregarGraficoEvolucao(),
      carregarGraficoStatus(),
    ])
  } catch (error) {
    console.error('Erro ao carregar gráficos:', error)
  }
}

// Gráfico 1: Vendas
// Gráfico 1: Vendas por Categoria (Barras)
async function carregarGraficoVendas() {
  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=VendasPorCategoria&periodo=${periodo.value}&empresaId=${empresaId.value}`,
    );

    const valores = response?.data?.valores ?? [];
    const categorias = response?.data?.categorias ?? [];
    //const dadosExtras = response?.data?.dadosExtras ?? {};

    semDadosVendas.value = valores.length === 0;

    // Atualiza o gráfico de barras
    seriesBar.value = [{
      name: 'Valor Total (R$)',
      data: valores,
    }];
    
    chartOptionsBar.value = {
      ...chartOptionsBar.value,
      chart: {
        ...chartOptionsBar.value.chart,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
      },
      xaxis: {
        categories: categorias,
        labels: {
          style: {
            colors: '#666',
            fontSize: '9px',
          },
          rotate: -45,
          rotateAlways: true,
          maxHeight: 80,
          formatter: function(value) {
            // Abrevia categorias muito longas
            if (value.length > 12) {
              return value.substring(0, 10) + '...';
            }
            return value;
          }
        },
        title: {
          text: 'Categorias',
          style: {
            fontSize: '11px',
            color: '#666',
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          endingShape: 'rounded',
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        },
      },
      colors: ['#ff7f26'],
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '10px',
          colors: ['#fff']
        },
        formatter: function(val) {
          return 'R$ ' + Number(val).toLocaleString('pt-BR', {minimumFractionDigits: 0});
        }
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return 'R$ ' + value.toFixed(0);
          },
          style: {
            fontSize: '10px',
          },
        },
        title: {
          text: 'Valor Total (R$)',
          style: {
            fontSize: '11px',
            color: '#666',
          },
        },
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return 'R$ ' + value.toFixed(2);
          },
        },
      },
    };

  } catch (error) {
    console.error('Erro ao carregar gráfico de vendas por categoria:', error);
    semDadosVendas.value = true;
  }
}

// Gráfico 2: Formas de Pagamento
async function carregarGraficoPagamento() {
  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=FormasPagamento&periodo=${periodo.value}&empresaId=${empresaId.value}`,
    );

    const valores = response?.data?.valores ?? [];
    const categorias = response?.data?.categorias ?? [];

    semDadosPagamento.value = valores.length === 0;

    // CORREÇÃO: Atualiza tanto series quanto labels
    seriesPie.value = valores;
    chartOptionsPie.value = {
      ...chartOptionsPie.value,
      labels: categorias
    };

    console.log('Dados Pagamento:', { categorias, valores }); // Debug

  } catch (error) {
    console.error('Erro ao carregar gráfico de pagamento:', error);
    semDadosPagamento.value = true;
  }
}

// Gráfico 3: Evolução
// Gráfico 3: Evolução (Duas Linhas) - VALOR + QUANTIDADE
async function carregarGraficoEvolucao() {
  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=EvolucaoVendas&periodo=${periodo.value}&empresaId=${empresaId.value}`,
    );

    const valores = response?.data?.valores ?? [];
    const categorias = response?.data?.categorias ?? [];
    const quantidades = response?.data?.dadosExtras?.quantidades ?? [];

    semDadosEvolucao.value = valores.length === 0;

    // CONFIGURAÇÃO COM DUAS LINHAS
    seriesLine.value = [
      {
        name: 'Valor (R$)',
        data: valores,
        type: 'line'
      },
      {
        name: 'Quantidade',
        data: quantidades,
        type: 'line'
      }
    ];

    chartOptionsLine.value = {
      ...chartOptionsLine.value,
      chart: {
        ...chartOptionsLine.value.chart,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        ...chartOptionsLine.value.xaxis,
        categories: categorias
      },
      stroke: {
        curve: 'smooth',
        width: [3, 2], // Linha mais grossa para valor, mais fina para quantidade
        dashArray: [0, 5] // Sólido para valor, tracejado para quantidade (opcional)
      },
      colors: ['#ff7f26', '#3498db'], // Laranja para valor, Azul para quantidade
      yaxis: [
        {
          seriesName: 'Valor (R$)',
          axisTicks: { show: true },
          axisBorder: { show: true, color: '#ff7f26' },
          labels: {
            style: { colors: '#ff7f26', fontSize: '10px' },
            formatter: function(value) {
              return 'R$ ' + value.toFixed(0);
            }
          },
          title: {
            text: 'Valor (R$)',
            style: { color: '#ff7f26', fontSize: '11px' }
          }
        },
        {
          seriesName: 'Quantidade',
          opposite: true, // Eixo do lado direito
          axisTicks: { show: true },
          axisBorder: { show: true, color: '#3498db' },
          labels: {
            style: { colors: '#3498db', fontSize: '10px' },
            formatter: function(value) {
              return value.toFixed(0);
            }
          },
          title: {
            text: 'Quantidade',
            style: { color: '#3498db', fontSize: '11px' }
          }
        }
      ],
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function(value, { seriesIndex }) {
            if (seriesIndex === 0) {
              return 'R$ ' + value.toFixed(2);
            } else {
              return value + ' vendas';
            }
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '11px'
      }
    };

    console.log('📈 Evolução - Dados:', { 
      categorias, 
      valores, 
      quantidades 
    });

  } catch (error) {
    console.error('Erro ao carregar gráfico de evolução:', error);
    semDadosEvolucao.value = true;
  }
}

// Gráfico 4: Status
async function carregarGraficoStatus() {
  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=StatusVendas&periodo=${periodo.value}&empresaId=${empresaId.value}`,
    );

    const valores = response?.data?.valores ?? [];
    const categorias = response?.data?.categorias ?? [];

    semDadosStatus.value = valores.length === 0;

    // CORREÇÃO: Atualiza tanto series quanto labels
    seriesDonut.value = valores;
    chartOptionsDonut.value = {
      ...chartOptionsDonut.value,
      labels: categorias
    };

    console.log('Dados Status:', { categorias, valores }); // Debug

  } catch (error) {
    console.error('Erro ao carregar gráfico de status:', error);
    semDadosStatus.value = true;
  }
}

// Baixar PDF
async function baixarPDF() {
  if (!carregado.value) return

  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio/pdf?tipo=Vendas&periodo=${periodo.value}&empresaId=${empresaId.value}&usuarioId=${usuarioId.value}`,
      { responseType: 'blob' },
    )

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_vendas_${periodo.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
  }
}

// ==================== FUNÇÕES ORIGINAIS ====================

// Função de permissões
const GerenciarPermissoes = (usuario) => {
  emailDono.value.dadosDono.email = usuario.email
  router.push('/GerenciarPermissoes')
}

// Carregar usuários da home
async function carregarUsuariosHome() {
  try {
    const resp = await axios.get(
      `http://localhost:3333/user/LU/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )
    usuariosHome.value = resp.data.message.slice(0, 2)
  } catch (err) {
    console.error('Erro ao carregar usuários da Home:', err)
  }
}

// Carregar dados de login
async function carregarDadosLogin() {
  try {
    const emailUser = cadastroFuncionario.value.dadosFuncionario.emailV
    const respUser = await axios.get(`http://localhost:3333/user/${emailUser}`)
    usuarioId.value = respUser.data.message[0].id
    empresaId.value = cadastroFuncionario.value.dadosLogin.codEmpresa
    carregado.value = true
    await carregarPrestesAVencer()
  } catch (err) {
    console.error('Erro ao carregar dados do login:', err)
  }
}

// Carregar produtos prestes a vencer
async function carregarPrestesAVencer() {
  if (!empresaId.value) return

  try {
    const resp = await axios.get(`http://localhost:3333/produto/${empresaId.value}`)

    const hoje = new Date()
    const imagens = []

    for (const item of resp.data.message) {
      if (!item.validade_proxima) continue

      const validade = new Date(item.validade_proxima)
      const dias = (validade - hoje) / (1000 * 60 * 60 * 24)

      // Apenas produtos com validade dentro de 30 dias
      if (dias >= 0 && dias <= 30) {
        imagens.push(item.imagem || fallbackImg)
      }
    }

    imagensPrestesAVencer.value = imagens
  } catch (err) {
    console.error('Erro ao carregar prestes a vencer:', err)
  }
}

// Funções de navegação
const logout = () => {
  mostrarConfirmLogout.value = false
  router.push('/loginPage')
}

function iniciarExpediente() {
  router.push('/caixaLivre')
}

const CadastroProdutos = () => router.push('/cadastroProduto')
const PrestesAVencer = () => router.push('/prestesAVencer')
const addEmpresa = () => router.push('/dataStoreB')
const ReporEstoque = () => router.push('/reporEstoque')
const AlterarEmpresa = () => router.push('/escolherEmpresa')
const verHistorico = () => router.push('/listarVendas')
const AdicionarUsuario = () => router.push('/register')
const cadastrarCliente = () => router.push('/listarClientes')
const AdicionarPromocao = () => router.push('/alterarPreco')

// Buscar nome do usuário
async function pegaNome() {
  try {
    const response = await axios.get(
      `http://localhost:3333/user/${cadastroFuncionario.value.dadosFuncionario.emailV}`,
    )
    let nomeCompleto = response.data.message[0].nome_completo
    usuario.value = nomeCompleto.split(' ')[0]
  } catch (error) {
    console.error('Erro ao buscar nome:', error)
  }
}

// Buscar permissões
async function pegaPadroes() {
  try {
    const response = await axios.get(
      `http://localhost:3333/padroes/email/${cadastroFuncionario.value.dadosFuncionario.emailV}`,
    )
    const dados = response.data.message

    form.value = {
      adicionarUsuario: dados.adicionarUsuario,
      adicionarCliente: dados.adicionarCliente,
      adicionarPromocao: dados.adicionarPromocao,
      adicionarProduto: dados.adicionarProduto,
      cadastrarEmpresa: dados.cadastrarEmpresa,
      relatorios: dados.relatorios,
      prestesAVencer: dados.prestesAVencer,
      reporEstoque: dados.reporEstoque,
      iniciarExpediente: dados.iniciarExpediente,
      gerenciarPermissoes: dados.gerenciarPermissoes,
      desativarConta: dados.ativo ? 0 : 1,
    }

    if (form.value.desativarConta) {
      mostrarContaDesativada.value = true
      setTimeout(() => {
        mostrarContaDesativada.value = false
        router.push('/loginPage')
      }, 3000)
    }
  } catch (error) {
    console.error('Erro ao buscar padrões:', error)
  }
}

// Verificar troca de empresa
async function verificarTrocaEmpresa() {
  try {
    const respEmpresas = await axios.get(
      `http://localhost:3333/dono/${emailDono.value.dadosDono.codDono}`,
    )
    if (respEmpresas.data.message.length > 1) {
      mostrarTrocarEmpresa.value = true
    }
  } catch (err) {
    console.error('Erro ao verificar troca de empresa:', err)
  }
}

// ==================== WATCHERS E MOUNTED ====================

// Watch para período
watch([periodo], () => {
  carregarTodosDados()
})

// Carregar tudo ao iniciar
onMounted(async () => {
  await carregarDadosLogin()
  await carregarUsuariosHome()
  pegaPadroes()
  pegaNome()
  verificarTrocaEmpresa()
  await carregarTodosDados() // Carrega resumo + gráficos automaticamente
})
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.home-container {
  min-height: 100vh;
  color: white;
  position: relative;
}

/* ===== HEADER ===== */
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 40px 20px;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ff7f26 0%, #ffa726 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  color: #ccc;
  font-size: 1.1rem;
  margin: 5px 0 0 0;
}

/* ===== LAYOUT PRINCIPAL ===== */
.home-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 0;
  min-height: calc(100vh - 160px);
}

/* ===== SIDEBARS ===== */
.sidebar {
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.right-sidebar {
  border-right: none;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  padding: 10px 20px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-icon {
  font-size: 1.5rem;
  color: #ff7f26;
  margin-bottom: 10px;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

/* ===== MENU PRINCIPAL ===== */
.sidebar-menu {
  flex: 1;
  list-style: none;
  padding: 10px 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255, 127, 38, 0.1);
  border-left-color: #ff7f26;
  transform: translateX(5px);
}

.menu-icon {
  font-size: 1.3rem;
  color: #ff7f26;
  margin-right: 15px;
  width: 24px;
}

.menu-text {
  font-size: 1rem;
  font-weight: 500;
  color: white;
}

/* ===== BOTÃO SAIR ===== */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-sair {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 15px 20px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 12px;
  color: #f44336;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sair:hover {
  background: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

/* ===== CONTEÚDO PRINCIPAL ===== */
.main-content {
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100vh - 160px);
}

/* ===== SEÇÕES ===== */
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 25px 0;
}

.section-title-icon {
  font-size: 1.8rem;
  color: #ff7f26;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

/* ===== CARDS DE RESUMO (MAIS COMPACTOS E PRÓXIMOS) ===== */
.resumo-grid {
  display: flex;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  margin-bottom: 25px;
}

.resumo-card {
  width: 15vw;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 70px;
}

.resumo-icon {
  width: 28px;
  height: 28px;
  background: rgba(255, 127, 38, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resumo-icon .q-icon {
  font-size: 1.1rem;
  color: #ff7f26;
}

.resumo-value {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: white;
  line-height: 1.2;
}

.resumo-label {
  font-size: 0.75rem;
  color: #ccc;
  margin: 0 0 2px 0;
  font-weight: 500;
}

.resumo-periodo {
  font-size: 0.65rem;
  color: #888;
  display: block;
}

/* Cores específicas para cada card */
.resumo-card.vendas .resumo-icon {
  background: rgba(76, 175, 80, 0.1);
}
.resumo-card.vendas .resumo-icon .q-icon {
  color: #4caf50;
  font-size: 1.2rem;
}

.resumo-card.valor .resumo-icon {
  background: rgba(33, 150, 243, 0.1);
}
.resumo-card.valor .resumo-icon .q-icon {
  color: #2196f3;
  font-size: 1.2rem;
}

.resumo-card.ticket .resumo-icon {
  background: rgba(255, 152, 0, 0.1);
}
.resumo-card.ticket .resumo-icon .q-icon {
  color: #ff9800;
  font-size: 1.2rem;
}

.resumo-card.pendentes .resumo-icon {
  background: rgba(156, 39, 176, 0.1);
}
.resumo-card.pendentes .resumo-icon .q-icon {
  color: #9c27b0;
  font-size: 1.2rem;
}

/* ===== CARROSSEL VENCIMENTO ===== */
.carrossel-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-carrossel {
  border-radius: 10px;
  overflow: hidden;
  height: 160px !important;
}

.carrossel-slide {
  background-color: #5e5e5e;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  justify-items: center;
  align-items: center;
  height: 100%;
  padding: 0 5px;
  width: 100%;
}

/* Quando não tem 7 itens, centraliza */
.produtos-grid.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.produto-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.produto-item:hover {
  transform: scale(1.08);
  background: rgba(255, 255, 255, 0.1);
}

.produto-imagem {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.9);
}

.produto-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.produto-item:hover .produto-overlay {
  opacity: 1;
}

.overlay-icon {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.empty-vencimento {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-vencimento .empty-icon {
  font-size: 3rem;
  color: #777;
  margin-bottom: 15px;
}

.empty-vencimento h3 {
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  color: #bbb;
}

.empty-vencimento p {
  margin: 0;
  color: #888;
}

/* ===== DASHBOARD ===== */
.dashboard-section {
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Versão alternativa mais simples */
.periodo-select :deep(*) {
  color: white !important;
}

.periodo-select :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

.periodo-select :deep(.q-field__native) {
  color: white !important;
}

.btn-action {
  font-weight: 600;
}

/* ===== GRÁFICOS ===== */
.graficos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.grafico-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  max-width: 22vw;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.grafico-card:hover {
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
}

.grafico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.grafico-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.grafico-icon {
  font-size: 1.1rem;
  color: #ff7f26;
}

.grafico-empty {
  text-align: center;
  padding: 20px 12px;
  color: #888;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.grafico-empty .empty-icon {
  font-size: 2rem;
  color: #666;
  margin-bottom: 8px;
}

.grafico-empty p {
  margin: 0;
  font-size: 0.8rem;
}

.grafico-content {
  border-radius: 6px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

/* Ajuste específico para os gráficos ApexCharts */
.grafico-content .apexcharts-canvas {
  height: 100% !important;
}

.dashboard-footer {
  text-align: center;
}

.btn-atualizar {
  font-weight: 600;
  padding: 12px 30px;
}

/* ===== LISTA DE USUÁRIOS ===== */
.usuarios-list {
  flex: 1;
  padding: 20px 0;
}

.usuario-card {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.usuario-card:hover {
  background: rgba(255, 127, 38, 0.1);
}

.usuario-card:last-child {
  border-bottom: none;
}

.usuario-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 127, 38, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.avatar-icon {
  font-size: 1.2rem;
  color: #ff7f26;
}

.usuario-info {
  flex: 1;
}

.usuario-nome {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: white;
}

.usuario-email {
  font-size: 0.8rem;
  color: #ccc;
  margin: 0;
}

.usuario-arrow {
  font-size: 1.2rem;
  color: #666;
}

.btn-ver-todos-users {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 15px 20px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-todos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 35%;
  padding: 15px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-todos:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 127, 38, 0.3);
}

/* ===== BOTÃO EXPEDIENTE ===== */
.btn-expediente {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  border: none;
  border-radius: 50px;
  padding: 18px 30px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 127, 38, 0.3);
  z-index: 100;
}

.btn-expediente:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 127, 38, 0.4);
}

.expediente-icon {
  font-size: 1.5rem;
}

/* ===== MODAIS ===== */
.modal-card {
  background: rgba(45, 45, 45, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-header {
  text-align: center;
  padding: 30px 30px 20px;
}

.modal-icon {
  font-size: 3rem;
  color: #ff7f26;
  margin-bottom: 15px;
}

.modal-icon.error {
  color: #f44336;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.modal-content {
  text-align: center;
  padding: 0 30px 20px;
  color: #ccc;
}

.modal-actions {
  padding: 20px 30px 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-modal {
  min-width: 120px;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
}

.btn-cancelar {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-cancelar:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-sair {
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
}

.btn-sair:hover {
  background: linear-gradient(135deg, #e67322 0%, #cc5500 100%);
}

.conta-desativada {
  text-align: center;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1200px) {
  .home-layout {
    grid-template-columns: 250px 1fr;
  }

  .right-sidebar {
    display: none;
  }
}

@media (max-width: 1024px) {
  .graficos-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .grafico-card {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .home-header {
    padding: 70px 20px 20px;
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .main-content {
    padding: 20px;
  }

  .resumo-grid {
    grid-template-columns: 1fr;
  }

  .graficos-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .grafico-card {
    height: 180px;
    padding: 10px;
  }

  .grafico-title {
    font-size: 0.85rem;
  }

  .grafico-icon {
    font-size: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .dashboard-actions {
    justify-content: center;
  }

  .btn-expediente {
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .home-header {
    padding: 60px 15px 15px;
  }

  .main-content {
    padding: 15px;
  }

  .resumo-card {
    padding: 20px;
  }

  .resumo-value {
    font-size: 1.5rem;
  }

  .grafico-card {
    padding: 15px;
  }

  .btn-expediente {
    bottom: 15px;
    right: 15px;
    padding: 12px 20px;
    font-size: 0.9rem;
  }
}
</style>
