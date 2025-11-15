// Validações de cartão de crédito
export const CardValidator = {
  validateCardNumber(number) {
    const cleaned = number.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleaned)
  },

  validateExpiry(expiry) {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return false
    
    const [month, year] = expiry.split('/')
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1
    
    const expiryYear = parseInt(year)
    const expiryMonth = parseInt(month)
    
    if (expiryYear < currentYear) return false
    if (expiryYear === currentYear && expiryMonth < currentMonth) return false
    
    return true
  },

  validateCVV(cvv) {
    return /^\d{3,4}$/.test(cvv)
  },

  validateCardName(name) {
    return name.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(name)
  },

  detectCardType(number) {
    const cleaned = number.replace(/\s/g, '')
    
    if (/^4/.test(cleaned)) return 'visa'
    if (/^5[1-5]/.test(cleaned)) return 'mastercard'
    if (/^3[47]/.test(cleaned)) return 'amex'
    if (/^6(?:011|5)/.test(cleaned)) return 'discover'
    
    return 'unknown'
  }
}

// Validações gerais
export const GeneralValidator = {
  validateMoney(value) {
    const num = parseFloat(value)
    return !isNaN(num) && num >= 0
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  validatePassword(password) {
    return password.length >= 4
  }
}