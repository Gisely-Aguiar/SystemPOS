import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const MERCADO_PAGO_TOKEN = "APP_USR-6856688009264980-110223-edc980904280a44e3906f9de64af5f9e-271293830";

export const criarPagamentoPix = async (req, res) => {
  try {
    const { valor, email, transaction_id } = req.body;

    if (!valor) return res.status(400).json({ error: "O valor é obrigatório" });
    if (!email) return res.status(400).json({ error: "O email do pagador é obrigatório" });

    console.log("➡️ Valor recebido:", valor);
    console.log("➡️ Email do pagador:", email);
    console.log("➡️ Transaction ID:", transaction_id);

    // Gera um transaction_id se não foi enviado
    const finalTransactionId = transaction_id || 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const paymentData = {
      transaction_amount: parseFloat(valor),
      description: "Pagamento via Pix - SystemPOS",
      payment_method_id: "pix",
      payer: { 
        email 
      },
      metadata: {
        transaction_id: finalTransactionId,
        internal_reference: `systempos_${finalTransactionId}`
      }
      // REMOVA A notification_url para testes locais
    };

    console.log("📦 Dados enviados para Mercado Pago:", paymentData);

    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": uuidv4(),
        },
      }
    );

    const { qr_code, qr_code_base64, transaction_url } =
      response.data.point_of_interaction.transaction_data;

    console.log("✅ Resposta do Mercado Pago:", {
      payment_id: response.data.id,
      status: response.data.status,
      transaction_id: finalTransactionId
    });

    return res.json({ 
      qr_code, 
      qr_code_base64, 
      transaction_url,
      transaction_id: finalTransactionId,
      payment_id: response.data.id
    });
    
  } catch (error) {
    console.error("❌ Erro ao gerar pagamento Pix:");
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      error: error.response?.data || "Erro ao gerar pagamento Pix",
    });
  }
};

// Nova função para verificar status do pagamento
export const verificarStatusPagamento = async (req, res) => {
  try {
    const { payment_id } = req.params;

    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${payment_id}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`,
        },
      }
    );

    const payment = response.data;
    
    return res.json({
      payment_id: payment.id,
      status: payment.status,
      transaction_id: payment.metadata?.transaction_id,
      date_approved: payment.date_approved
    });
    
  } catch (error) {
    console.error("❌ Erro ao verificar status:", error);
    return res.status(500).json({
      error: "Erro ao verificar status do pagamento",
    });
  }
};

export default criarPagamentoPix;