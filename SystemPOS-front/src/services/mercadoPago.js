import api from './api'

const MERCADO_PAGO_ACCESS_TOKEN = import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN
const DEFAULT_EMAIL = import.meta.env.VITE_DEFAULT_EMAIL

export const MercadoPagoService = {
  async createPixPayment(amount, description = 'Pagamento via PIX') {
    try {
      const response = await api.post(
        'https://api.mercadopago.com/v1/payments',
        {
          transaction_amount: parseFloat(amount),
          description: description,
          payment_method_id: 'pix',
          payer: {
            email: DEFAULT_EMAIL,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: {
          id: response.data.id,
          qr_code: response.data.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: response.data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticket_url: response.data.point_of_interaction?.transaction_data?.ticket_url,
        }
      }
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao gerar pagamento PIX'
      }
    }
  },

  async createCardPayment(paymentData) {
    try {
      const response = await api.post(
        'https://api.mercadopago.com/v1/payments',
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao processar pagamento com cartão'
      }
    }
  }
}