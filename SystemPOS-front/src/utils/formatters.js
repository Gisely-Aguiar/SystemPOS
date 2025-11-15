export const Formatters = {
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '')
    const matches = cleaned.match(/\d{4,16}/g)
    const match = matches ? matches[0] : ''
    const parts = []
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    return parts.length ? parts.join(' ') : ''
  },

  formatExpiry(value) {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  },

  formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  removeFormatting(value) {
    return value.replace(/\D/g, '')
  }
}