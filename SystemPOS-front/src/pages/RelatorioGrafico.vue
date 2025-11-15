<template>
  <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
    <svg viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </button>

  <h1 class="title">DASHBOARD</h1>

  <div class="Box">
    <div class="conteudo">
      <!-- Lado Esquerdo -->
      <div class="lado-esquerdo">
        <div class="text-input-container">
          <label for="tipo" class="input-label">
            Tipo de Relatório: <text style="color: red">*</text>
          </label>
          <select id="tipo" v-model="tipoRelatorio" class="text-input">
            <option v-for="opt in opcoesRelatorio" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <div class="text-input-container">
          <label for="periodo" class="input-label">
            Período: <text style="color: red">*</text>
          </label>
          <select id="periodo" v-model="periodo" class="text-input">
            <option v-for="opt in opcoesPeriodo" :key="opt" :value="opt">
              {{ opt }}
            </option>
          </select>
        </div>

        <button class="next" @click="gerarRelatorio">Gerar Relatório</button>
        <button class="next botao-pdf" @click="baixarPDF">Baixar PDF</button>
      </div>

      <!-- Lado Direito (Gráfico) -->
      <div class="lado-direito">
        <template v-if="semDados">
          <p style="text-align: center; margin-top: 150px; font-size: 18px; color: #999;">
            Não há dados disponíveis para este relatório.
          </p>
        </template>
        <template v-else>
          <apexchart
            type="line"
            height="350"
            :options="chartOptions"
            :series="series"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch  } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ApexCharts from "vue3-apexcharts";

// 🔹 importa as stores
import { cadastroFuncionario } from "../stores/registroFuncionario.js";
import { emailDono } from "../stores/registroDono.js";

const router = useRouter();

// Registro do componente ApexCharts
const apexchart = ApexCharts;

// Relatórios
const tipoRelatorio = ref("Vendas");
const periodo = ref("Hoje");

const opcoesRelatorio = ["Vendas", "Ganhos", "Gastos", "Estoque", "Clientes", "Geral"];
const opcoesPeriodo = ["Hoje", "Semana", "Mês", "Ano"];

// Dados do gráfico
const series = ref([{ name: "Valor", data: [] }]);
const chartOptions = ref({
  chart: { toolbar: { show: false } },
  xaxis: { categories: [] },
  stroke: { curve: "smooth", width: 3 },
  colors: ["#000000"],
  grid: { borderColor: "#ccc" },
});

// IDs globais
const usuarioId = ref(null);
const empresaId = ref(null);
const carregado = ref(false);

// Flag para quando não há dados
const semDados = ref(false);

// 🔹 Carrega IDs do usuário e da empresa
async function carregarDadosLogin() {
  try {
    const emailUser = cadastroFuncionario.value.dadosFuncionario.emailV;
    console.log("emailUser:", emailUser);

    const respUser = await axios.get(`http://localhost:3333/user/${emailUser}`);
    usuarioId.value = respUser.data.message[0].id;
    console.log("usuarioId:", usuarioId.value);

    const codDono = emailDono.value.dadosDono.codDono;
    console.log("codDono:", codDono);

    const respEmpresa = await axios.get(`http://localhost:3333/dono/${codDono}`);
    empresaId.value = respEmpresa.data.message[0].e_id || respEmpresa.data.message[0].id;
    console.log("empresaId:", empresaId.value);

    carregado.value = true; // IDs carregados
  } catch (err) {
    console.error("Erro ao carregar dados do login:", err);
  }
}

function formatarLabelPorPeriodo(data, periodo) {
  const date = new Date(data);

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const mesesAno = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  switch (periodo) {
    case "Semana":
      return diasSemana[date.getDay()];
    case "Mês":
      return date.getDate().toString().padStart(2, "0");
    case "Ano":
      return mesesAno[date.getMonth()];
    default:
      return date.toLocaleDateString("pt-BR");
  }
}


// 🔹 Gerar relatório
async function gerarRelatorio() {
  if (!carregado.value) {
    console.warn("IDs ainda não carregados!");
    return;
  }

  console.log("Clicou em gerar relatório");

  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio?tipo=${tipoRelatorio.value}&periodo=${periodo.value}&empresaId=${empresaId.value}`
    );
    console.log("Resposta do backend:", response.data);

    series.value[0].data = response.data.valores;
chartOptions.value.xaxis.categories = response.data.categorias.map(cat =>
  formatarLabelPorPeriodo(cat, periodo.value)
);


    // Verifica se não há dados
    semDados.value = response.data.valores.length === 0;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    semDados.value = true;
  }
}

// 🔹 Baixar PDF
async function baixarPDF() {
  if (!carregado.value) {
    console.warn("IDs ainda não carregados!");
    return;
  }

  console.log("Clicou em baixar PDF");

  try {
    const response = await axios.get(
      `http://localhost:3333/relatorio/pdf?tipo=${tipoRelatorio.value}&periodo=${periodo.value}&empresaId=${empresaId.value}&usuarioId=${usuarioId.value}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_${tipoRelatorio.value}_${periodo.value}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Erro ao baixar PDF:", error);
  }
}
watch([tipoRelatorio, periodo], () => {
  gerarRelatorio();
});

onMounted(carregarDadosLogin);
</script>

<style scoped>
.conteudo {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 2em;
  box-sizing: border-box;
}

.lado-esquerdo {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  width: 35%;
}

.lado-direito {
  margin-bottom: 20%;
  width: 60%;
  background: white;
  border-radius: 12px;
  padding: 1em;
  height: 400px; /* altura mínima para o gráfico aparecer */
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

.text-input {
  width: 100%;
  height: 50px;
  font-size: 16px;
  padding: 10px;
  border: 2px solid transparent;
  border-radius: 24px;
  cursor: pointer;
  transition: border-color 0.3s ease-in-out;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: #ff7f26;
  outline: none;
}

.next {
  display: block;
  width: 80%;
  max-width: 300px;
  height: 60px;
  margin-top: 80px;
  background-color: #ff7f26;
  border-radius: 24px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  text-align: center;
}

.botao-pdf {
  margin-top: 10px;
}

.next:hover {
  background-color: #b14a01;
}

.next:active {
  background-color: #ff7f26;
}
 
</style>
