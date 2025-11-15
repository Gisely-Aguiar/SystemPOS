// src/stores/registroProdutoCadastro.js
import { ref } from 'vue'

export const registroProdutoCadastro = ref({
  dados: {
    nome: '',
    tipo: '',
    marca: '',
    modelo: '',
    codBarras: '',
    categoria: '',
    codProduto: '',
    dataValidade: '',
    preco: '',
    quantidade: '',
    estMin: '',
    estMax: '',
    img: null,
  },

  // ✅ Função para salvar os dados do formulário
  setDados(form) {
    this.dados = { ...form }
  },

  // ✅ Função para limpar tudo
  limpar() {
    this.dados = {
      nome: '',
      tipo: '',
      marca: '',
      modelo: '',
      codBarras: '',
      categoria: '',
      codProduto: '',
      dataValidade: '',
      preco: '',
      quantidade: '',
      estMin: '',
      estMax: '',
      img: null,
    }
  },
})
