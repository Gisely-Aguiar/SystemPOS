<template>
  <div class="container">
    <button class="botao-voltar" @click="goHome" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    
    <h1 class="title">Caixa livre</h1>
    <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS">

    
  </div>

  <div class="botoes">
    
    <UiButton
      label="Fechar caixa"
      class="btn"
      @click="fecharCaixa"
    />
    <UiButton
      label="Nova compra"
      class="btn"
      @click="novaCompra"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { UiButton } from '../components/index.js'

const router = useRouter()


function novaCompra() {
  router.push('/TelaVenda')
}

function fecharCaixa() {
  router.push('/FecharCaixa')
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
html, body {
  overflow: hidden;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #000;
}
.container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  padding-top: 20px;
}

.title {
  color: white;
  font-size: 200px;
  font-weight: bold;
  text-align: center;
}

.uilogo-main {
  
  width: 150px;
  height: auto;
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

.logo{
  width: 30%;
  height: 30%;
  object-fit: cover;
}
</style>
