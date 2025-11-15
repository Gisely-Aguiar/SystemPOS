// src/stores/registerDono.js
import { ref } from 'vue'

export const cadastroDono = ref({
  dadosDono: {
    cpf: '',
    dataNascimento: '',
    endereco: '',
  },
})
export const emailDono = ref({
  dadosDono: {
    codDono: '',
    email: '',
  },
})
