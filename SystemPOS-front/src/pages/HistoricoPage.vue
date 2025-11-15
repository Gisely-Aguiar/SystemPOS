<template>
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
        <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    </button>
    <h1 class="title">QUAL RELATÓRIO DESEJA VISUALIZAR?</h1>


      <div class="Box-laranja">
        <div class="linha-btn1">
          <button class="botao-vendas" @click="Graficos()">Vendas</button>
          <button class="botao-ganhos">Ganhos</button>
          <button class="botao-gastos">Gastos</button>
        </div>

        <div class="linha-btn2">
          <button class="botao-estoque">Estoque</button>
          <button class="botao-clientes">Clientes</button>
          <button class="botao-geral">Geral</button>
        </div>
      </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const Graficos = () => {
  router.push('/graficos')
}
</script>


<style scoped>
/* Garante que o body e html ocupem 100% da altura */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Seu título centralizado com margem */
.title {
  text-align: center;
  font-size: 50px;
  font-weight: bold;
  color: white;
  margin: 20px 0 10px 0;
}

/* Ajuste para a Box-laranja ocupar quase toda a área disponível */
.Box-laranja {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  width: 90%;       /* 90% da largura da viewport */
  height: 70vh;      /* 70% da altura da viewport */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  gap: 2em;          /* espaço entre as linhas de botões */
  margin: 0 auto;
}

/* As linhas ficam flex horizontal com espaçamento */
.linha-btn1, .linha-btn2 {
  display: flex;
  justify-content: center;
  gap: 3.5em;
  width: 100%;
}

/* Botões com tamanho mais proporcional ao espaço */
.botao-vendas,
.botao-ganhos,
.botao-gastos,
.botao-estoque,
.botao-clientes,
.botao-geral {
  width: 25%;
  height: 3em;
  font-size: 48px; /* ajustei o font-size pra não ficar exagerado */
  border-radius: 0.8em;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.botao-vendas:hover,
.botao-ganhos:hover,
.botao-gastos:hover,
.botao-estoque:hover,
.botao-clientes:hover,
.botao-geral:hover {
  background-color: #b65d05;
}


</style>
