// src/stores/registerData.js
import { ref } from 'vue'

export const reporEstoque = ref({
  dadosEstoque: {
    quantidade: '',
    estoqueMin: '',
    estoqueMax: '',
    nome: '',
    marca: '',
    imagem: '',
    id: '',
    quantidadeNova: '',
  },
  dadosPromocao: {
    preco: '',
    nome: '',
    marca: '',
    imagem: '',
    id: '',
    precoNovo: '',
  },
  dadosDescricao: {},
  mensagem: {
    descricao: '',
  },
})
