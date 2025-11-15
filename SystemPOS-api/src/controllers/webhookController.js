// src/controllers/webhookController.js
import axios from "axios";
import { MERCADO_PAGO_TOKEN } from "../config.js";
import { connections } from "../websocket.js"; // Importe suas conexões WebSocket

export async function mpWebhook(req, res) {
  const { id, topic } = req.body || req.query;
  if (!id) return res.status(400).send("Faltando ID do pagamento");

  try {
    // Busca os detalhes do pagamento na API oficial
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`,
        },
      }
    );

    const payment = response.data;
    console.log("🔔 Webhook recebido! Status:", payment.status);
    console.log("📦 Metadata:", payment.metadata);

    // SE O PAGAMENTO FOI APROVADO
    if (payment.status === "approved") {
      console.log("✅ Pagamento aprovado via Mercado Pago!");
      
      // Extrair transaction_id do metadata
      const transactionId = payment.metadata?.transaction_id;
      
      if (transactionId) {
        console.log("🎯 Transaction ID encontrado:", transactionId);
        
        // 1. Notificar frontend via WebSocket
        notificarFrontend(transactionId);
      } else {
        console.log("⚠️ Transaction ID não encontrado no metadata");
      }
    }

    return res.status(200).send("ok");
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error.response?.data || error.message);
    return res.status(500).send("erro");
  }
}

// Função para notificar o frontend
function notificarFrontend(transactionId) {
  const connection = connections.get(transactionId);
  if (connection) {
    connection.send(JSON.stringify({
      type: 'payment_approved',
      transactionId: transactionId,
      message: 'Pagamento confirmado via Mercado Pago',
      timestamp: new Date().toISOString()
    }));
    console.log(`📢 Notificação enviada para transaction: ${transactionId}`);
  } else {
    console.log(`⚠️ Nenhum frontend conectado para transaction: ${transactionId}`);
  }
}

export default mpWebhook;