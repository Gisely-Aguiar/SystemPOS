// src/stores/registerData.js
import { ref } from 'vue'

export const cadastroFuncionario = ref({
  dadosLogin: {
    email: '',
    nomeUsuario: '',
    senha: '',
    tipo: '',
    emailToken: '',
    codEmpresa: '',
  },
  dadosFuncionario: {
    nome: '',
    telefone: '',
    whatsapp: false,
    genero: '',
    codEmpresa: '',
    emailV: '',
  },
  dadosPadroes: {
    adicionarUsuario: 1,
    adicionarProduto: 1,
    relatorios: 1,
    reporEstoque: 1,
    gerenciarPermissoes: 1,
    adicionarPromocao: 1,
    cadastrarEmpresa: 1,
    prestesAVencer: 1,
    iniciarExpediente: 1,
    adicionarCliente: 1,
  },
})
