<!-- ProdutoJaCadastrado.vue -->
<template>
  <div class="container">
    <!-- ✅ Botão de voltar estilo igual da outra tela -->
    <button class="botao-voltar" @click="voltarParaCadastro" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="card">
      <img src="../assets/ProdCad.PNG" alt="Ícone de visualização" />
      <p>Este produto já está cadastrado!</p>
      <button @click="verProduto">Ver produto</button>
    </div>

    <!-- ✅ Mensagem de alerta (recebe descrição do reporEstoque) -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { reporEstoque } from 'src/stores/registroProduto.js'

const router = useRouter()
const mensagem = ref(reporEstoque.value.mensagem.descricao || '')

const voltarParaCadastro = () => {
  router.push('/CadastroProduto')
}

const verProduto = () => {
  router.push('/alterarPreco')
}
</script>

<style scoped>
body {
  background-image: url('../assets/fundoTCClogin.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}


.card {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 60px;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(27, 27, 27, 0.7);
  text-align: center;
  max-width: 800px;
  width: 90%;
  color: white;
}

.card img {
  width: 120px;
  height: 120px;
  margin-bottom: 25px;
}

.card p {
  font-size: 1.6rem;
  margin-bottom: 30px;
}

.card button {
  background-color: #00c43d;
  color: white;
  border: none;
  padding: 14px 35px;
  font-size: 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.3s;
}

.card button:hover {
  background-color: #00a534;
}

/* ✅ Estilo da mensagem de alerta igual ao da outra tela */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e64219;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
}

.botao-fechar {
  background: white;
  color: #e64219;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.botao-fechar:hover {
  background: #eee;
}
</style>
