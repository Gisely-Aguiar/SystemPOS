<template>
  <div class="container-registro-produto">
    <!-- Botão de voltar personalizado -->
    <button class="botao-voltar" @click="goHome" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">CADASTRO DE PRODUTOS</h1>

    <div class="form-grid">
      <div class="form-group">
        <label for="nome" class="input-label"
          >Nome do produto: <text style="color: red">*</text></label
        >
        <input
          type="text"
          v-model="form.nome"
          id="nome"
          :placeholder="nomePlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.nome && validado }"
        />
      </div>

      <div class="form-group">
        <label for="marca" class="input-label"
          >Marca do produto: <text style="color: red">*</text></label
        >
        <input
          type="text"
          v-model="form.marca"
          id="marca"
          :placeholder="marcaPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.marca && validado }"
        />
      </div>

      <div class="form-group">
        <label for="tipo" class="input-label"
          >Unidade de medida do produto: <text style="color: red">*</text></label
        >
        <input
          type="text"
          v-model="form.tipo"
          id="tipo"
          :placeholder="tipoPlaceholder"
          class="text-input"
          :class="{ 'campo-incorreto': !form.tipo && validado }"
        />
      </div>

      <div class="form-group">
        <label for="modelo" class="input-label">Modelo do produto: </label>
        <input
          type="text"
          v-model="form.modelo"
          id="modelo"
          :placeholder="modeloPlaceholder"
          class="text-input"
        />
      </div>

      <div class="form-group">
        <label for="categoria" class="input-label"
          >Categoria do produto: <text style="color: red">*</text></label
        >
        <select
          v-model="form.categoria"
          id="categoria"
          class="text-input"
          :class="{ 'campo-incorreto': !form.categoria && validado }"
        >
          <option value="" disabled selected>{{ categoriaPlaceholder }}</option>
          <option>Frios</option>
          <option>Laticínios</option>
          <option>Bebidas</option>
          <option>Carnes</option>
          <option>Frutas e Verduras</option>
          <option>Padaria</option>
          <option>Mercearia</option>
          <option>Higiene e Limpeza</option>
          <option>Congelados</option>
          <option>Snacks e Doces</option>
          <option>Molhos e Temperos</option>
          <option>Cereais e Grãos</option>
          <option>Óleos e Condimentos</option>
        </select>
      </div>

      <!-- Linhas menores -->
      <div class="linha-menor-inputs">
        <div class="form-group pequeno">
          <label for="codBarras" class="input-label">Código de barras: </label>
          <input
            type="text"
            v-model="form.codBarras"
            id="codBarras"
            :placeholder="codBarrasPlaceholder"
            class="text-input"
          />
        </div>

        <div class="form-group pequeno">
          <label for="quantidade" class="input-label"
            >Quantidade: <text style="color: red">*</text></label
          >
          <input
            type="text"
            v-model="form.quantidade"
            id="quantidade"
            :placeholder="quantidadePlaceholder"
            class="text-input"
            :class="{ 'campo-incorreto': !form.quantidade && validado }"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="codProduto" class="input-label"
          >Código do produto: <text style="color: red">*</text></label
        >
        <input
          type="text"
          v-model="form.codProduto"
          id="codProduto"
          :placeholder="codProdutoPlaceholder"
          maxlength="10"
          class="text-input"
          :class="{ 'campo-incorreto': !form.codProduto && validado }"
        />
      </div>

      <!-- Linhas menores -->
      <div class="linha-menor-inputs">
        <div class="form-group pequeno">
          <label for="estMin" class="input-label"
            >Estoque mínimo: <text style="color: red">*</text></label
          >
          <input
            type="text"
            v-model="form.estMin"
            id="estMin"
            :placeholder="estMinPlaceholder"
            class="text-input"
            :class="{ 'campo-incorreto': !form.estMin && validado }"
          />
        </div>

        <div class="form-group pequeno">
          <label for="estMax" class="input-label"
            >Estoque máximo: <text style="color: red">*</text></label
          >
          <input
            type="text"
            v-model="form.estMax"
            id="estMax"
            :placeholder="estMaxPlaceholder"
            class="text-input"
            :class="{ 'campo-incorreto': !form.estMax && validado }"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="img" class="input-label">Imagem: <text style="color: red">*</text></label>
        <input
          type="file"
          id="img"
          @change="handleFileChange"
          class="text-input file-input-estilizado"
          :class="{ 'campo-incorreto': !form.img && validado }"
          accept="image/jpeg, image/png"
        />
      </div>

      <!-- Linhas menores -->
      <div class="linha-menor-inputs">
        <div class="form-group pequeno">
          <label for="dataValidade" class="input-label"
            >Data de validade: <text style="color: red">*</text></label
          >
          <input
            type="date"
            v-model="form.dataValidade"
            id="dataValidade"
            class="text-input"
            :class="{ 'campo-incorreto': !form.dataValidade && validado }"
          />
        </div>

        <div class="form-group pequeno">
          <label for="preco" class="input-label"
            >Preço(R$): <text style="color: red">*</text></label
          >
          <input
            type="text"
            v-model="form.preco"
            id="preco"
            :placeholder="precoPlaceholder"
            class="text-input"
            :class="{ 'campo-incorreto': !form.preco && validado }"
          />
        </div>
      </div>
    </div>

    <div class="botao-container">
      <UiButton class="next" label="Próximo" @click="handleNext" />
    </div>

    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Stores
import { cadastroFuncionario } from 'src/stores/registroFuncionario.js'
import { reporEstoque } from 'src/stores/registroProduto.js'
import { registroProdutoCadastro } from 'src/stores/registroProdutoCadastro.js'

// Componentes
import { UiButton } from '../components/index.js'

const router = useRouter()

const mensagem = ref('')
const produtos = ref([])
const isLoading = ref(false)

// ✅ Formulário inicial preenchido com o store
const form = ref({
  nome: registroProdutoCadastro.value.dados.nome || '',
  tipo: registroProdutoCadastro.value.dados.tipo || '',
  marca: registroProdutoCadastro.value.dados.marca || '',
  modelo: registroProdutoCadastro.value.dados.modelo || '',
  codBarras: registroProdutoCadastro.value.dados.codBarras || '',
  codEmpresa: cadastroFuncionario.value.dadosLogin.codEmpresa,
  categoria: registroProdutoCadastro.value.dados.categoria || '',
  codProduto: registroProdutoCadastro.value.dados.codProduto || '',
  dataValidade: registroProdutoCadastro.value.dados.dataValidade || '',
  preco: registroProdutoCadastro.value.dados.preco || '',
  quantidade: registroProdutoCadastro.value.dados.quantidade || '',
  estMin: registroProdutoCadastro.value.dados.estMin || '',
  estMax: registroProdutoCadastro.value.dados.estMax || '',
  img: registroProdutoCadastro.value.dados.img || null,
})

// Placeholders e validações
const validado = ref(false)
const nomePlaceholder = ref('ex. Leite')
const tipoPlaceholder = ref('ex. 1 Litro ou 1 unidade')
const marcaPlaceholder = ref('ex. Italac')
const modeloPlaceholder = ref('ex. Caixa')
const codBarrasPlaceholder = ref('ex. 7898080640611')
const categoriaPlaceholder = ref('Selecione a categoria do produto')
const quantidadePlaceholder = ref('ex. 12')
const codProdutoPlaceholder = ref('ex. 011')
const estMinPlaceholder = ref('ex. 10')
const estMaxPlaceholder = ref('ex. 100')
const precoPlaceholder = ref('ex. 5.99')
const goHome = () => router.push('/home')

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) form.value.img = file
}

async function handleNext() {
  if (isLoading.value) return
  isLoading.value = true

  validado.value = true
  let valid = true

  // ✅ Validações obrigatórias
  if (!form.value.nome) {
    nomePlaceholder.value = 'Obrigatório'
    valid = false
  }
  if (!form.value.tipo) {
    tipoPlaceholder.value = 'Obrigatório'
    valid = false
  }
  if (!form.value.marca) {
    marcaPlaceholder.value = 'Obrigatório'
    valid = false
  }
  if (!form.value.categoria) valid = false
  if (!form.value.codProduto) valid = false
  if (!form.value.estMin) valid = false
  if (!form.value.estMax) valid = false
  if (!form.value.preco) valid = false
  if (!form.value.dataValidade) valid = false
  if (!form.value.quantidade) valid = false

  if (!valid) {
    isLoading.value = false
    return
  }

  // ✅ Buscar produtos existentes para validação de duplicidade
  try {
    const response = await axios.get(`http://localhost:3333/produto/CP/${form.value.codEmpresa}`)
    produtos.value = response.data.message || []

    const codProdutoExistente = produtos.value.some(
      (p) => String(p.codProduto) === String(form.value.codProduto),
    )

    const codBarrasExistente = produtos.value.some(
      (p) => String(p.codBarras).trim() === String(form.value.codBarras).trim(),
    )

    // ✅ Caso: código de produto + código de barras duplicados
    if (codProdutoExistente && codBarrasExistente) {
      reporEstoque.value.mensagem.descricao = 'Código do produto e código de barras já cadastrados.'
      registroProdutoCadastro.value.setDados(form.value)
      router.push('/ProdutoNaoSucesso')
      return
    }

    // ✅ Código de produto já existe
    if (codProdutoExistente) {
      reporEstoque.value.mensagem.descricao = 'Código do produto já cadastrado.'
      registroProdutoCadastro.value.setDados(form.value)
      router.push('/ProdutoNaoSucesso')
      return
    }

    // ✅ Código de barras já existe
    if (codBarrasExistente) {
      reporEstoque.value.mensagem.descricao = 'Código de barras já cadastrado.'
      registroProdutoCadastro.value.setDados(form.value)
      router.push('/ProdutoNaoSucesso')
      return
    }
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    mensagem.value = 'Erro ao buscar produtos existentes.'
    return
  }

  // ✅ Cadastrar produto (req 1)
  const formData = new FormData()
  formData.append('nome', form.value.nome)
  formData.append('tipo', form.value.tipo)
  formData.append('marca', form.value.marca)
  formData.append('modelo', form.value.modelo)
  formData.append('codBarras', form.value.codBarras)
  formData.append('codEmpresa', form.value.codEmpresa)
  formData.append('codProduto', form.value.codProduto)
  formData.append('categoria', form.value.categoria)
  formData.append('preco', form.value.preco)
  formData.append('estMin', form.value.estMin)
  formData.append('estMax', form.value.estMax)
  formData.append('img', form.value.img)

  let produtoId = null

  try {
    const respProd = await axios.post('http://localhost:3333/produto', formData)
    produtoId = respProd.data.id
    if (!produtoId) throw new Error('Backend não retornou ID!')
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error)
    mensagem.value = 'Erro ao cadastrar produto.'
    isLoading.value = false
    return
  }

  // ✅ Cadastrar lote (req 2)
  const loteData = {
    produtoId,
    numeroLote: Date.now(),
    dataValidade: form.value.dataValidade,
    quantidade: form.value.quantidade,
  }

  try {
    await axios.post('http://localhost:3333/produto/lote', loteData)

    // ✅ Agora podemos limpar o store com segurança
    registroProdutoCadastro.value.limpar()

    router.push('/ProdutoSucesso')
  } catch (error) {
    console.error('Erro ao cadastrar lote:', error)
    mensagem.value = 'Produto criado, mas erro ao registrar lote.'
  }

  isLoading.value = false
}
</script>

<style scoped>
html,
body {
  overflow: hidden; /* Impede o scroll na tela */
  height: 100vh; /* Garante que o conteúdo ocupe toda a altura da tela */
}

.container-registro-produto {
  margin: 0 auto;
  width: 75%;
  margin-top: 50px;
}

.title {
  text-align: center;
  font-size: 50px;
  font-weight: bold;
  color: white;
  margin-top: 10px;
}

.input-label {
  font-size: 18px;
  color: #ffffff;
  margin-bottom: 5px;
  display: block;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.botao-container {
  margin-top: 30px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.linha-menor-inputs {
  display: flex;
  gap: 20px;
}

.form-group.pequeno {
  flex: 1;
}

.file-input-estilizado {
  color: white;
  background-color: transparent;
  border: 2px solid transparent;
  /* border-radius: 24px; */
  padding: 10px;
  height: 50px;
  font-size: 16px;
  cursor: pointer;
}

/* Estilização botão do input file */
.file-input-estilizado::file-selector-button {
  background-color: #ff7f26;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: text;
  transition: background-color 0.3s;
  margin-right: 10px;
}

.file-input-estilizado::file-selector-button:hover {
  background-color: #b14a01;
}

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

.campo-incorreto {
  border: 2px solid red !important;
}
.campo-incorreto::placeholder {
  color: red;
}
</style>
