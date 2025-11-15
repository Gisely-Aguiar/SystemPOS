<template>
  <div class="container-adress">
    <!-- Botão de voltar -->
    <button class="botao-voltar" @click="router.back()" aria-label="Voltar">
      <svg viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <h1 class="title">ENDEREÇO DA LOJA</h1>

    <div class="form-row">
      <div class="form-group">
        <label class="input-label">CEP: <text style="color: red">*</text></label>
        <input
          type="text"
          :value="form.cep"
          @input="form.cep = aplicarMascaraCep($event.target.value)"
          placeholder="Digite o CEP"
          class="text-input"
        />
      </div>

      <div class="form-group">
        <label class="input-label">Logradouro:</label>
        <input
          type="text"
          v-model="form.logradouro"
          placeholder="Digite o endereço"
          class="text-input"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="input-label">Estado: <text style="color: red">*</text></label>
        <input type="text" v-model="form.estado" placeholder="Digite o estado" class="text-input" />
      </div>

      <div class="form-group">
        <label class="input-label">Número: <text style="color: red">*</text></label>
        <input type="text" v-model="form.numero" placeholder="Digite o número" class="text-input" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label class="input-label">Cidade: <text style="color: red">*</text></label>
        <input type="text" v-model="form.cidade" placeholder="Digite a cidade" class="text-input" />
      </div>

      <div class="form-group">
        <label class="input-label">Complemento: </label>
        <input
          type="text"
          v-model="form.complemento"
          placeholder="Digite o complemento"
          class="text-input"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group full-width">
        <label class="input-label">Bairro: <text style="color: red">*</text></label>
        <input type="text" v-model="form.bairro" placeholder="Digite o bairro" class="text-input" />
      </div>
    </div>

    <UiButton class="next" label="Criar" @click="handleSubmit" />

    <!-- Alerta fixo -->
    <div v-if="mensagem" class="mensagem-alerta">
      <p>{{ mensagem }}</p>
      <button @click="mensagem = ''" class="botao-fechar">Fechar</button>
    </div>
  </div>
</template>

<script setup>
import { UiButton } from '../components/index.js'
import { useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import axios from 'axios'
import { cadastroLoja } from '../stores/registroLoja.js'
import { cadastroFuncionario } from '../stores/registroFuncionario.js'
import { cadastroDono, emailDono } from '../stores/registroDono.js'

const router = useRouter()
const mensagem = ref('')

function aplicarMascaraCep(valor) {
  const somenteNumeros = valor.replace(/\D/g, '').slice(0, 8)
  return somenteNumeros.length <= 5
    ? somenteNumeros
    : `${somenteNumeros.slice(0, 5)}-${somenteNumeros.slice(5)}`
}

const form = ref({
  cep: '',
  estado: '',
  cidade: '',
  bairro: '',
  logradouro: '',
  numero: '',
  complemento: '',
})

async function handleSubmit() {
  if (
    !form.value.cep ||
    !form.value.estado ||
    !form.value.cidade ||
    !form.value.bairro ||
    !form.value.logradouro
  ) {
    mensagem.value = 'Preencha todos os campos obrigatórios marcados com *'
    return
  }

  cadastroLoja.value.enderecoLoja = { ...form.value }

  try {
    await axios.post('http://localhost:3333/dono', {
      cpf: cadastroDono.value.dadosDono.cpf,
      data_nascimento: cadastroDono.value.dadosDono.dataNascimento,
      endereco_particular: cadastroDono.value.dadosDono.endereco,
      codDono: emailDono.value.dadosDono.codDono,
    })

    await axios.post('http://localhost:3333/padroes', cadastroFuncionario.value.dadosPadroes)

    const response = await axios.get('http://localhost:3333/padroes')
    const acesso = response.data[0].id

    await axios.post('http://localhost:3333/empresa', {
      endereco_cep: form.value.cep,
      endereco_estado: form.value.estado,
      endereco_cidade: form.value.cidade,
      endereco_bairro: form.value.bairro,
      endereco_logradouro: form.value.logradouro,
      endereco_numero: form.value.numero,
      endereco_complemento: form.value.complemento,
      razao_social: cadastroLoja.value.dadosLoja.razaoSocial,
      nome_fantasia: cadastroLoja.value.dadosLoja.nomeFantasia,
      codEmpresa: cadastroLoja.value.dadosLoja.codEmpresa,
      telefone: cadastroLoja.value.dadosLoja.telefone,
      whatsapp: cadastroLoja.value.dadosLoja.whatsapp,
      cnpj: cadastroLoja.value.dadosLoja.cnpj,
      dono_id: emailDono.value.dadosDono.codDono,
    })

    await axios.post('http://localhost:3333/user', {
      nome: cadastroFuncionario.value.dadosFuncionario.nome,
      telefone: cadastroFuncionario.value.dadosFuncionario.telefone,
      whatsapp: cadastroFuncionario.value.dadosFuncionario.whatsapp,
      genero: cadastroFuncionario.value.dadosFuncionario.genero,
      email: cadastroFuncionario.value.dadosLogin.email,
      nomeUsuario: cadastroFuncionario.value.dadosLogin.nomeUsuario,
      senha: cadastroFuncionario.value.dadosLogin.senha,
      tipo: cadastroFuncionario.value.dadosLogin.tipo,
      codDono: emailDono.value.dadosDono.codDono,
      codEmpresa: cadastroLoja.value.dadosLoja.codEmpresa,
      acesso: acesso,
    })
    cadastroFuncionario.value.dadosLogin.codEmpresa = cadastroLoja.value.dadosLoja.codEmpresa

    mensagem.value = 'Cadastro do dono e empresa concluído com sucesso!'
    setTimeout(() => {
      mensagem.value = ''
      router.push('/')
    }, 1500)
  } catch (error) {
    console.error('Erro no envio:', error)
    mensagem.value = 'Erro ao enviar o cadastro. Tente novamente.'
  }
}

watch(
  () => form.value.cep,
  async (novoCEP) => {
    const cepLimpo = novoCEP.replace(/\D/g, '')

    if (cepLimpo.length <= 7) {
      form.value.estado = ''
      form.value.cidade = ''
      form.value.bairro = ''
      form.value.logradouro = ''
      form.value.complemento = ''
      return
    }

    if (cepLimpo.length === 8) {
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)

        if (data.erro) {
          mensagem.value = 'CEP não encontrado.'
          return
        }

        form.value.estado = data.uf
        form.value.cidade = data.localidade
        form.value.bairro = data.bairro
        form.value.logradouro = data.logradouro
        form.value.complemento = data.complemento || ''
      } catch (err) {
        mensagem.value = 'Erro ao buscar CEP.'
        console.error('Erro ao consultar o ViaCEP:', err)
      }
    }
  },
)
</script>

<style scoped>
.container-adress {
  max-width: 900px;
  width: 90%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
  color: white;
}

.title {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.form-group {
  flex: 1 1 400px;
  min-width: 350px;
  display: flex;
  flex-direction: column;
}

.full-width {
  flex-basis: 100%;
  min-width: 0;
}

.input-label {
  font-size: 18px;
  margin-bottom: 8px;
}

.next {
  width: 100%;
}

.voltar {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #ff7f26;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 35px;
  width: 80px;
  font-size: 32px;
}

.voltar:hover {
  background-color: #b14a01;
}

.voltar:active {
  background-color: #ff7f26;
}

@media (max-width: 800px) {
  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100% !important;
  }
}

/* ✅ Estilo do alerta fixo */
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
</style>
