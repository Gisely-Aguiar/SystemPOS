<template>
  <div class="criar-lote-container">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="page-title">CRIAR NOVO LOTE</h1>

    <div class="content-wrapper">
      <!-- Seção do produto -->
      <div class="produto-section">
        <div class="produto-card">
          <h2 class="section-title">{{ dadosEstoque.nome }}</h2>

          <div class="produto-imagem-container">
            <img :src="dadosEstoque.imagem" :alt="dadosEstoque.nome" class="produto-imagem" />
          </div>

          <div class="produto-info">
            <div class="info-item">
              <span class="info-label">Marca:</span>
              <span class="info-value">{{ dadosEstoque.marca }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estoque Atual:</span>
              <span class="info-value estoque">{{ dadosEstoque.quantidade }} unidades</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção do formulário -->
      <div class="form-section">
        <div class="form-card">
          <img class="logo" src="../assets/logo.png" alt="Logo SystemPOS" />

          <h3 class="form-title">Cadastrar Novo Lote</h3>

          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Quantidade:</label>
              <input
                type="number"
                v-model="quantidade"
                class="text-input"
                placeholder="Ex: 20"
                min="1"
                @keyup.enter="criarLote"
              />
              <span class="input-hint">Quantidade de unidades no lote</span>
            </div>

            <div class="input-group">
              <label class="input-label">Data de Validade:</label>
              <input type="date" v-model="validade" class="text-input" :min="minDate" />
              <span class="input-hint">Data de vencimento do lote</span>
            </div>
          </div>

          <div class="lote-preview" v-if="quantidade && validade">
            <h4 class="preview-title">Resumo do Lote</h4>
            <div class="preview-content">
              <div class="preview-item">
                <span>Quantidade:</span>
                <strong>{{ produto.estoque_total }} unidades</strong>
              </div>
              <div class="preview-item">
                <span>Validade:</span>
                <strong>{{ formatarData(validade) }}</strong>
              </div>
              <div class="preview-item">
                <span>Novo estoque:</span>
                <strong class="novo-estoque"
                  >{{ totalEstoque + Number(quantidade) }} unidades</strong
                >
              </div>
            </div>
          </div>

          <div class="btn-container">
            <button @click="criarLote" class="confirmar-btn">
              <span v-if="!quantidade || !validade">Preencha os campos</span>
              <span v-else>Registrar Lote</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem de Alerta -->
    <div v-if="mensagem" class="mensagem-alerta">
      <div class="mensagem-content">
        <q-icon name="info" class="mensagem-icon" />
        <p>{{ mensagem }}</p>
      </div>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { reporEstoque } from '../stores/registroProduto.js'

const router = useRouter()

// ✅ Estados
const mensagem = ref('')
const dadosEstoque = reporEstoque.value.dadosEstoque
const totalEstoque = dadosEstoque.total_estoque ?? 0
const quantidade = ref('')
const validade = ref('')

// Data mínima (hoje)
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// Formatar data para exibição
const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

async function criarLote() {
  if (!quantidade.value || quantidade.value <= 0) {
    mensagem.value = 'Digite uma quantidade válida maior que zero.'
    return
  }

  if (!validade.value) {
    mensagem.value = 'Selecione a validade do lote.'
    return
  }

  // Validar se a data é futura
  const dataValidade = new Date(validade.value)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  if (dataValidade < hoje) {
    mensagem.value = 'A data de validade deve ser futura.'
    return
  }

  try {
    await axios.post('http://localhost:3333/produto/lote', {
      produtoId: dadosEstoque.id,
      numeroLote: `LOTE_${Date.now()}`,
      dataValidade: validade.value,
      quantidade: Number(quantidade.value),
    })

    mensagem.value = 'Lote registrado com sucesso!'

    // Aguarda 1.5s e volta
    setTimeout(() => router.push('/reporEstoque'), 1500)
  } catch (err) {
    console.error(err)
    mensagem.value = 'Erro ao criar lote. Tente novamente.'
  }
}
</script>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.criar-lote-container {
  min-height: 100vh;
  padding: 20px;
  position: relative;
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
  display: flex;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: stretch;
  justify-content: center;
  min-height: 600px;
}

/* ===== SEÇÃO DO PRODUTO ===== */
.produto-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.produto-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
}

.produto-imagem-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.produto-imagem {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.produto-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  font-weight: 600;
  color: #ccc;
  font-size: 1rem;
}

.info-value {
  color: white;
  font-weight: 500;
}

.info-value.estoque {
  color: #ff7f26;
  font-weight: 700;
  font-size: 1.1rem;
}

/* ===== SEÇÃO DO FORMULÁRIO ===== */
.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.form-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.logo {
  width: 180px;
  height: auto;
  align-self: center;
  margin-bottom: 10px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin: 0;
  border-bottom: 2px solid #ff7f26;
  padding-bottom: 10px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
}

.input-hint {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

/* ===== INPUTS ESTILIZADOS ===== */
.text-input {
  width: 100%;
  height: 55px;
  background-color: #1a1a1a;
  border: 2px solid #333;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1.1rem;
  padding: 0 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-weight: 600;
}

.text-input:focus {
  outline: none;
  border-color: #ff7f26;
  background-color: #222;
  box-shadow: 0 0 0 2px rgba(255, 127, 38, 0.1);
  transform: translateY(-1px);
}

.text-input::placeholder {
  color: #666;
  font-weight: normal;
}

/* Estilo específico para input date */
.text-input[type='date'] {
  color-scheme: dark;
}

.text-input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

/* ===== PREVIEW DO LOTE ===== */
.lote-preview {
  background: rgba(255, 127, 38, 0.1);
  border: 1px solid #ff7f26;
  border-radius: 12px;
  padding: 20px;
  margin-top: 10px;
}

.preview-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ff7f26;
  margin: 0 0 15px 0;
  text-align: center;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 127, 38, 0.2);
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item span {
  color: #ccc;
  font-weight: 500;
}

.preview-item strong {
  color: white;
  font-weight: 600;
}

.preview-item .novo-estoque {
  color: #4caf50;
  font-weight: 700;
}

/* ===== BOTÃO CONFIRMAR ===== */
.btn-container {
  width: 100%;
  margin-top: auto;
}

.confirmar-btn {
  width: 100%;
  background: linear-gradient(135deg, #ff7f26 0%, #e67322 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 65px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(255, 127, 38, 0.3);
}

.confirmar-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 127, 38, 0.4);
}

.confirmar-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.confirmar-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

/* ===== MENSAGEM DE ALERTA ===== */
.mensagem-alerta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 9999;
  max-width: 90%;
}

.mensagem-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.mensagem-icon {
  font-size: 1.5rem;
}

.mensagem-alerta p {
  margin: 0;
  font-weight: 600;
}

.botao-fechar {
  background: white;
  color: #4caf50;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.botao-fechar:hover {
  background: #f0f0f0;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
    gap: 30px;
    max-width: 600px;
    align-items: center;
  }

  .produto-card,
  .form-card {
    width: 100%;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .criar-lote-container {
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

  .produto-card,
  .form-card {
    padding: 25px 20px;
  }

  .produto-imagem-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .produto-card,
  .form-card {
    padding: 20px 15px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .produto-imagem-container {
    height: 200px;
  }

  .confirmar-btn {
    height: 60px;
    font-size: 1.1rem;
    padding: 15px 20px;
  }

  .logo {
    width: 150px;
  }

  .mensagem-alerta {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}
</style>
