// src/services/pagamentoService.js
import axios from "axios";
import { MERCADO_PAGO_TOKEN } from "../config.js";

export async function criarPagamentoPixService({ valor, descricao = "Compra PDV" }) {
  // valor deve ser número (ex: 150.5)
  const body = {
    transaction_amount: Number(valor),
    description: descricao,
    payment_method_id: "pix",
    payer: {
      email: "comprador@example.com" // se tiver cliente real, enviar dados reais
    }
  };

  const headers = {
    Authorization: `Bearer ${MERCADO_PAGO_TOKEN}`,
    "Content-Type": "application/json"
  };

  const url = "https://api.mercadopago.com/v1/payments";
  const resp = await axios.post(url, body, { headers });
  // resp.data.point_of_interaction.transaction_data tem qr_code e qr_code_base64
  return resp.data;
}
