<template>
  <div class="container-clientes">
    <button class="botao-voltar" @click="goHome()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <!-- Cabeçalho com título e botão -->
    <div class="cabecalho">
      <h1 class="title">CLIENTES</h1>
      <button class="botao-cadastrar" @click="irParaCadastro">
        <svg viewBox="0 0 24 24" class="icone-adicionar">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" />
        </svg>
        Cadastrar Cliente
      </button>
    </div>

    <div class="lista-clientes">
      <div class="cliente-card" v-for="c in clientes" :key="c.id" @click="abrirDetalhes(c.id)">
        <p class="cliente-nome">{{ c.nome_completo }}</p>
        <p class="cliente-cpf">CPF: {{ c.cpf }}</p>
        <p class="cliente-telefone">Telefone: {{ c.telefone }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>
    <div v-if="erro" class="erro">{{ erro }}</div>

    <!-- Mensagem quando não há clientes -->
    <div v-if="!loading && clientes.length === 0" class="sem-clientes">
      <p>Nenhum cliente cadastrado ainda.</p>
      <button class="botao-cadastrar-vazio" @click="irParaCadastro">
        Cadastrar Primeiro Cliente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'
import { cliente } from 'src/stores/registroCliente.js'

const router = useRouter()
const clientes = ref([])
const loading = ref(true)
const erro = ref('')

async function carregarClientes() {
  try {
    const empresa_id = cadastroFuncionario.value.dadosLogin.codEmpresa
    const { data } = await axios.get(`http://localhost:3333/clientes/empresa/${empresa_id}`)
    clientes.value = data
  } catch {
    erro.value = 'Não foi possível carregar clientes.'
  } finally {
    loading.value = false
  }
}

function abrirDetalhes(id) {
  cliente.value.dados.id = id
  router.push(`/DetalhesCliente`)
}

function irParaCadastro() {
  router.push('/CadastrarCliente')
}

onMounted(carregarClientes)

const goHome = () => router.push('/home')
</script>

<style scoped>
.container-clientes {
  padding: 40px 20px;
  color: white;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.botao-cadastrar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #ff7f26, #ff6b00);
  border: none;
  border-radius: 16px;
  padding: 16px 24px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 127, 38, 0.3);
}

.botao-cadastrar:hover {
  background: linear-gradient(135deg, #ff6b00, #ff5500);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

.botao-cadastrar:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(255, 127, 38, 0.3);
}

.icone-adicionar {
  width: 20px;
  height: 20px;
}

.lista-clientes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.cliente-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.cliente-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 127, 38, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cliente-nome {
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
}

.cliente-cpf,
.cliente-telefone {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.loading,
.erro {
  text-align: center;
  font-size: 1.2rem;
  padding: 40px;
  color: white;
}

.erro {
  color: #ff6b6b;
}

.sem-clientes {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.sem-clientes p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.botao-cadastrar-vazio {
  background: linear-gradient(135deg, #ff7f26, #ff6b00);
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 127, 38, 0.3);
}

.botao-cadastrar-vazio:hover {
  background: linear-gradient(135deg, #ff6b00, #ff5500);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

/* Responsividade */
@media (max-width: 768px) {
  .container-clientes {
    padding: 20px 15px;
  }

  .cabecalho {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .title {
    font-size: 2rem;
    text-align: center;
  }

  .botao-cadastrar {
    justify-content: center;
    padding: 14px 20px;
  }

  .lista-clientes {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .cliente-card {
    padding: 20px;
  }

  .cliente-nome {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.8rem;
  }

  .botao-cadastrar {
    font-size: 1rem;
    padding: 12px 18px;
  }

  .cliente-card {
    padding: 16px;
  }
}
</style>
