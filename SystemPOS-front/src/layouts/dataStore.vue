<template>
  <div>
    <background />
    <h1 class="title">DADOS DA EMPRESA</h1>
    <div class="razao">
      <Input v-model="form.razao_social" :name="'Razão Social:*'" placeholder="Digite a razão social" />
    </div>
    <div class="fantasia">
      <Input v-model="form.nome_fantasia" :name="'Nome Fantasia:*'" placeholder="Digite o nome fantasia" />
    </div>
    <div class="cnpj">
      <Input v-model="form.cnpj" :name="'CNPJ:*'" placeholder="Digite o CNPJ" />
    </div>
    <div class="logradouro">
      <Input v-model="form.endereco_logradouro" :name="'Logradouro:*'" placeholder="Ex: Rua João Pessoa" />
    </div>
    <div class="numero">
      <Input v-model="form.endereco_numero" :name="'Número:*'" placeholder="Ex: 123" />
    </div>
    <div class="complemento">
      <Input v-model="form.endereco_complemento" :name="'Complemento:'" placeholder="Ex: Sala 1 (opcional)" />
    </div>
    <div class="bairro">
      <Input v-model="form.endereco_bairro" :name="'Bairro:*'" placeholder="Ex: Centro" />
    </div>
    <div class="cidade">
      <Input v-model="form.endereco_cidade" :name="'Cidade:*'" placeholder="Ex: São Paulo" />
    </div>
    <div class="estado">
      <Input v-model="form.endereco_estado" :name="'Estado:*'" placeholder="Ex: SP" />
    </div>
    <div class="cep">
      <Input v-model="form.endereco_cep" :name="'CEP:*'" placeholder="Ex: 01001000" />
    </div>

    <UiButton class="next" :label="'Próximo'" @click="handleNext" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { background, Input, UiButton } from '../components/index.js'

const router = useRouter()

const form = ref({
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  endereco_logradouro: '',
  endereco_numero: '',
  endereco_complemento: '',
  endereco_bairro: '',
  endereco_cidade: '',
  endereco_estado: '',
  endereco_cep: ''
})

onMounted(() => {
  const proprietario = JSON.parse(localStorage.getItem('proprietario'))
  if (!proprietario) {
    alert('Dados do proprietário não encontrados! Redirecionando...')
    router.push('/registerProp')
  }
})

function handleNext() {
  if (
    !form.value.razao_social ||
    !form.value.nome_fantasia ||
    !form.value.cnpj ||
    !form.value.endereco_logradouro ||
    !form.value.endereco_numero ||
    !form.value.endereco_bairro ||
    !form.value.endereco_cidade ||
    !form.value.endereco_estado ||
    !form.value.endereco_cep
  ) {
    alert('Preencha todos os campos obrigatórios!')
    return
  }

  localStorage.setItem('empresa', JSON.stringify(form.value))
  router.push('/adressStore')
}
</script>

<style>
.title {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  font-weight: bold;
  color: white;
}
.razao { top: 150px; }
.fantasia { top: 230px; }
.cnpj { top: 310px; }
.logradouro { top: 390px; }
.numero { top: 470px; width: 500px; left: 170px; position: absolute; }
.complemento { top: 470px; width: 500px; left: 700px; position: absolute; }
.bairro { top: 550px; }
.cidade { top: 630px; width: 500px; left: 170px; position: absolute; }
.estado { top: 630px; width: 250px; left: 700px; position: absolute; }
.cep { top: 710px; }

.razao, .fantasia, .cnpj, .logradouro, .bairro, .cep {
  position: absolute;
  left: 170px;
  width: 1030px;
}

.next {
  position: absolute;
  width: 250px;
  height: 72px;
  left: 1055px;
  top: 800px;
  background-color: #FF7F26;
}
.next:hover {
  background-color: #b14a01;
}
.next:active {
  background-color: #FF7F26;
}
</style>
