<template>
  <div class="container">
    <button class="botao-voltar" @click="back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="content-wrapper">
      <!-- ÁREA DOS 3 ELEMENTOS LADO A LADO -->
      <div class="content-top">
        <!-- LISTA DO CARRINHO -->
        <div class="scrollview">
          <div
            v-for="item in carrinho"
            :key="item.codigo_barras"
            class="produto-item"
            @click="abrirModal(item)"
          >
            <div class="produto-info">
              <div class="produto-nome">{{ item.nome }}</div>
              <div class="produto-detalhes">
                <span class="produto-quantidade">{{ formatarQuantidade(item.quantidade) }}</span>
                <span class="produto-preco"
                  >R$ {{ (Number(item.preco) * Number(item.quantidade)).toFixed(2) }}</span
                >
              </div>
              <div class="produto-unitario">R$ {{ Number(item.preco).toFixed(2) }} cada</div>
            </div>
            <q-icon name="edit" class="edit-icon" />
          </div>
        </div>

        <!-- IMAGEM DO PRODUTO -->
        <div class="imagem-produto">
          <p v-if="produtoSelecionado">
            <img
              :src="produtoSelecionado.imagem"
              alt="Produto"
              style="max-width: 100%; max-height: 100%"
            />
          </p>
          <p v-else>Imagem do produto</p>
        </div>

        <!-- FORMULÁRIO -->
        <div class="form">
          <div class="login">
            <label class="input-label">Quantidade:</label>
            <input
              type="number"
              step="0.01"
              v-model.number="quantidade"
              placeholder="Digite a quantidade"
              class="text-input"
              min="0.01"
            />
          </div>

          <div class="login">
            <label class="input-label">Código de barras:</label>
            <input
              ref="codigoBarrasInput"
              type="text"
              v-model="codigoBarras"
              @keyup.enter="buscarProduto"
              placeholder="Leia o código"
              class="text-input"
            />
          </div>

          <div class="login">
            <label class="input-label">Código do produto:</label>
            <input
              type="text"
              v-model="codProduto"
              @keyup.enter="buscarProdutoPorId"
              placeholder="Digite o código do produto"
              class="text-input"
            />
          </div>

          <div class="login">
            <label class="input-label">Total da Compra:</label>
            <input type="text" :value="totalCompra.toFixed(2)" class="text-input" readonly />
          </div>
        </div>
      </div>

      <!-- BOTÃO ABAIXO DOS 3 ELEMENTOS -->
      <div class="btn-full-width">
        <UiButton class="next" label="Finalizar Compra" @click="finalizarCompra" />
      </div>
    </div>

    <!-- Resto do código permanece igual -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>

    <!-- MODAIS -->
    <div v-if="modalAberto" class="modal-overlay">
      <div class="modal">
        <h2>Liberar acesso</h2>
        <label>Senha:</label>
        <input
          :key="modalAberto"
          type="password"
          v-model="senha"
          class="text-input"
          @keyup.enter="validarSenha"
        />
        <div class="modal-buttons">
          <button @click="validarSenha">Ok</button>
          <button @click="fecharModal">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="editarAberto" class="modal-overlay">
      <div class="modal">
        <h2>Editar produto</h2>
        <label>Quantidade:</label>
        <input
          type="number"
          v-model.number="quantidadeEdicao"
          min="0.01"
          step="0.01"
          @keyup.enter="salvarEdicao"
        />
        <div class="modal-buttons">
          <button @click="salvarEdicao">Salvar</button>
          <button @click="removerItem">Remover</button>
          <button @click="fecharEdicao">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton } from 'src/components'
import axios from 'axios'
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'
import { cadastroVenda } from 'src/stores/registroVenda.js'

const router = useRouter()

// Estados
const carrinho = ref([])
const produtoSelecionado = ref(null)
const codigoBarras = ref('')
const codProduto = ref('') // ✅ novo input
const quantidade = ref(1.0) // ✅ aceita decimal
const mensagem = ref('')

// Modais e edição
const modalAberto = ref(false)
const editarAberto = ref(false)
const senha = ref('')
const usuarios = ref([])
const itemSelecionado = ref(null)
const voltarAposSenha = ref(false)
const quantidadeEdicao = ref(1.0) // ✅ decimal

// Ref para scanner
const codigoBarrasInput = ref(null)

// Carregar usuários autorizados
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:3333/user/SU/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )
    usuarios.value = response.data.message
    focarInput()
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
  }
})

// ✅ Função auxiliar
function focarInput() {
  nextTick(() => codigoBarrasInput.value?.focus())
}

// ✅ Buscar Produto por código de barras
async function buscarProduto() {
  if (!codigoBarras.value) return

  try {
    const response = await axios.get(
      `http://localhost:3333/produto/DD/${codigoBarras.value}/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    const produto = response.data.message[0]
    if (!produto) {
      mensagem.value = 'Produto não encontrado!'
      return focarInput()
    }

    const estoque = produto.estoque_total ?? 0
    const existente = carrinho.value.find((p) => p.codigo_barras === produto.codigo_barras)

    const solicitada = parseFloat(quantidade.value)
    const noCarrinho = existente ? existente.quantidade : 0

    if (solicitada <= 0) {
      mensagem.value = 'Informe uma quantidade válida.'
      return
    }

    if (solicitada + noCarrinho > estoque) {
      mensagem.value = 'Quantidade superior ao estoque disponível.'
      return
    }

    produtoSelecionado.value = produto

    const item = {
      id_produto: produto.id,
      codigo_barras: produto.codigo_barras,
      nome: produto.nome,
      preco: Number(produto.preco),
      imagem: produto.imagem,
      quantidade: solicitada,
    }

    if (existente) {
      existente.quantidade += solicitada
    } else {
      carrinho.value.push(item)
    }

    codigoBarras.value = ''
    quantidade.value = 1.0
    focarInput()
  } catch (error) {
    console.error('Erro:', error)
    mensagem.value = 'Erro ao buscar produto.'
    focarInput()
  }
}

// ✅ Buscar Produto por ID (novo input)
async function buscarProdutoPorId() {
  if (!codProduto.value) return

  try {
    const response = await axios.get(
      `http://localhost:3333/produto/COD/${codProduto.value}/${cadastroFuncionario.value.dadosLogin.codEmpresa}`,
    )

    const produto = response.data.message[0]
    if (!produto) {
      mensagem.value = 'Produto não encontrado!'
      return
    }

    const estoque = produto.estoque_total ?? 0
    const existente = carrinho.value.find((p) => p.id_produto === produto.id)

    const solicitada = parseFloat(quantidade.value)
    const noCarrinho = existente ? existente.quantidade : 0

    if (solicitada <= 0) {
      mensagem.value = 'Informe uma quantidade válida.'
      return
    }

    if (solicitada + noCarrinho > estoque) {
      mensagem.value = 'Quantidade superior ao estoque disponível.'
      return
    }

    produtoSelecionado.value = produto

    const item = {
      id_produto: produto.id,
      codigo_barras: produto.codigo_barras,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: solicitada,
    }

    if (existente) {
      existente.quantidade += solicitada
    } else {
      carrinho.value.push(item)
    }

    codProduto.value = ''
    quantidade.value = 1.0
    focarInput()
  } catch (error) {
    console.error('Erro:', error)
    mensagem.value = 'Erro ao buscar produto.'
  }
}

// ✅ Total da Compra
const totalCompra = computed(() =>
  carrinho.value.reduce((acc, item) => acc + item.preco * item.quantidade, 0),
)

// ✅ Finalizar Compra
function finalizarCompra() {
  if (!carrinho.value.length) {
    mensagem.value = 'Carrinho vazio!'
    return
  }

  cadastroVenda.value.totalVenda.total = totalCompra.value
  cadastroVenda.value.totalVenda.carrinho = carrinho.value.map((item) => ({
    codigo_produto: item.id_produto,
    codigo_barras: item.codigo_barras,
    nome: item.nome,
    preco: item.preco,
    quantidade: item.quantidade,
    imagem: item.imagem,
  }))

  router.push('/TelaPagamento')
}

// ✅ Voltar
function back() {
  if (carrinho.value.length) {
    senha.value = ''
    voltarAposSenha.value = true
    modalAberto.value = true
  } else router.back()
}

// ✅ Abrir modal para editar item
function abrirModal(item) {
  itemSelecionado.value = item
  quantidadeEdicao.value = item.quantidade
  senha.value = ''
  modalAberto.value = true
}

// ✅ Validar Senha
function validarSenha() {
  if (!senha.value) {
    mensagem.value = 'Digite a senha de administrador'
    return
  }

  const ok = usuarios.value.some((u) => u.senha_hash === senha.value)

  if (ok) {
    modalAberto.value = false
    senha.value = ''

    if (voltarAposSenha.value) {
      voltarAposSenha.value = false
      return router.back()
    } else {
      editarAberto.value = true
    }
  } else {
    mensagem.value = 'Senha incorreta!'
    modalAberto.value = false
  }

  focarInput()
}

// ✅ Fechar modal de senha
function fecharModal() {
  modalAberto.value = false
  senha.value = ''
  focarInput()
}

// ✅ Fechar edição
function fecharEdicao() {
  editarAberto.value = false
  itemSelecionado.value = null
  focarInput()
}

// ✅ Salvar edição
async function salvarEdicao() {
  try {
    const response = await axios.get(
      `http://localhost:3333/produto/DD/${itemSelecionado.value.codigo_barras}`,
      { params: { codEmpresa: cadastroFuncionario.value.dadosLogin.codEmpresa } },
    )

    const produto = response.data.message[0]
    if (!produto) {
      mensagem.value = 'Produto não encontrado'
      return
    }

    if (parseFloat(quantidadeEdicao.value) > produto.estoque_total) {
      mensagem.value = 'Quantidade superior ao estoque disponível'
      return
    }

    const index = carrinho.value.findIndex(
      (p) => p.codigo_barras === itemSelecionado.value.codigo_barras,
    )

    if (index !== -1) {
      carrinho.value[index].quantidade = parseFloat(quantidadeEdicao.value)
    }

    editarAberto.value = false
    itemSelecionado.value = null
    focarInput()
  } catch (e) {
    console.error(e)
    mensagem.value = 'Erro ao validar estoque'
  }
}

// ✅ Remover item
function removerItem() {
  carrinho.value = carrinho.value.filter(
    (i) => i.codigo_barras !== itemSelecionado.value.codigo_barras,
  )

  produtoSelecionado.value = null
  editarAberto.value = false
  itemSelecionado.value = null
  focarInput()
}

// ✅ Formatar quantidade (nova função)
function formatarQuantidade(qtd) {
  return qtd % 1 === 0 ? `${qtd}x` : `${qtd.toFixed(2)}x`
}
</script>

<style scoped>
.container {
  margin-top: 5%;
  padding: 20px;
}

/* ===== WRAPPER PRINCIPAL ===== */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== ÁREA DOS 3 ELEMENTOS LADO A LADO ===== */
.content-top {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 30px;
  align-items: start;
}

/* ===== BOTÃO QUE OCUPA 100% DA LARGURA ===== */
.btn-full-width {
  grid-column: 1 / -1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.next {
  width: 100%;
}

.next:disabled {
  background-color: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ===== CARRINHO ===== */
.scrollview {
  background-color: #70707042;
  height: 400px;
  overflow-y: auto;
  border-radius: 12px;
  padding: 15px;
}

.scrollview::-webkit-scrollbar {
  width: 8px;
}

.scrollview::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb {
  background-color: #ff7f26;
  border-radius: 4px;
}

.scrollview::-webkit-scrollbar-thumb:hover {
  background-color: #e67322;
}

/* ===== ITENS DO CARRINHO ===== */
.produto-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 4px solid transparent;
}

.produto-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff7f26;
  border-left-color: #ff7f26;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.produto-info {
  flex: 1;
  min-width: 0;
}

.produto-nome {
  font-weight: 600;
  color: white;
  font-size: 16px;
  margin-bottom: 8px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.produto-detalhes {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.produto-quantidade {
  color: #ff7f26;
  font-weight: 700;
  font-size: 14px;
  background: rgba(255, 127, 38, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.produto-preco {
  color: #4caf50;
  font-weight: 700;
  font-size: 16px;
}

.produto-unitario {
  color: #ccc;
  font-size: 12px;
  font-style: italic;
}

.edit-icon {
  color: #ff7f26;
  font-size: 20px;
  margin-left: 15px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.produto-item:hover .edit-icon {
  transform: scale(1.1);
}

/* ===== IMAGEM DO PRODUTO ===== */
.imagem-produto {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  text-align: center;
}

/* ===== FORMULÁRIO ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.text-input {
  width: 100%;
}

/* ===== MODAIS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.modal {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 30px;
  color: white;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal h2 {
  text-align: center;
  margin-bottom: 20px;
  color: white;
  font-size: 1.5rem;
}

.modal label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: white;
}

.modal input {
  width: 100%;
  padding: 12px;
  border: 1px solid #444;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 80px;
}

.modal-buttons button:first-child {
  background: #ff7f26;
  color: white;
}

.modal-buttons button:first-child:hover {
  background: #e67322;
}

.modal-buttons button:not(:first-child) {
  background: #666;
  color: white;
}

.modal-buttons button:not(:first-child):hover {
  background: #555;
}

/* ===== MENSAGEM DE ALERTA ===== */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e64219;
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  max-width: 90%;
}

.botao-fechar {
  background: white;
  color: #e64219;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.botao-fechar:hover {
  background: #f0f0f0;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1200px) {
  .content-top {
    grid-template-columns: 1fr 1fr;
  }

  .imagem-produto {
    grid-column: 1 / -1;
    order: 3;
  }
}

@media (max-width: 768px) {
  .content-top {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .container {
    padding: 15px;
    margin-top: 15%;
  }

  .botao-voltar {
    width: 60px;
    height: 60px;
    top: 15px;
    left: 15px;
  }

  .botao-voltar svg {
    width: 25px;
    height: 25px;
  }

  .scrollview,
  .imagem-produto {
    height: 300px;
  }

  .next {
    height: 60px;
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .produto-item {
    padding: 15px;
  }

  .produto-nome {
    font-size: 14px;
  }

  .modal {
    padding: 20px;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .modal-buttons button {
    width: 100%;
  }

  .container {
    margin-top: 20%;
  }
}
</style>
