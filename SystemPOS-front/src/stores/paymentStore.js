import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePaymentStore = defineStore('payment', () => {
  // Estados do pagamento
  const paymentStatus = ref('idle') // idle, processing, success, error
  const currentPaymentMethod = ref('')
  const paymentData = ref(null)
  const errorMessage = ref('')

  // Computed
  const isProcessing = computed(() => paymentStatus.value === 'processing')
  const isSuccess = computed(() => paymentStatus.value === 'success')
  const hasError = computed(() => paymentStatus.value === 'error')

  // Ações
  function setPaymentMethod(method) {
    currentPaymentMethod.value = method
    paymentStatus.value = 'idle'
    errorMessage.value = ''
  }

  function setProcessing() {
    paymentStatus.value = 'processing'
    errorMessage.value = ''
  }

  function setSuccess(data) {
    paymentStatus.value = 'success'
    paymentData.value = data
    errorMessage.value = ''
  }

  function setError(message) {
    paymentStatus.value = 'error'
    errorMessage.value = message
  }

  function reset() {
    paymentStatus.value = 'idle'
    currentPaymentMethod.value = ''
    paymentData.value = null
    errorMessage.value = ''
  }

  return {
    // Estados
    paymentStatus,
    currentPaymentMethod,
    paymentData,
    errorMessage,
    
    // Computed
    isProcessing,
    isSuccess,
    hasError,
    
    // Ações
    setPaymentMethod,
    setProcessing,
    setSuccess,
    setError,
    reset
  }
})