import express from "express";
import service from "../services/donoService.js";

const route = express.Router();

// Listar todos os donos
route.get("/", async (request, response) => {
  try {
    const donos = await service.listDono();

    if (!donos || donos.length < 1) {
      return response.status(204).end();
    }

    const formatarData = (data) => {
      if (!data) return null;  // evita "Invalid Date"
      return new Date(data).toLocaleDateString("pt-BR");
    };

    const donosFormatados = donos.map((item) => ({
      ...item,
      data_nascimento: formatarData(item.data_nascimento),
    }));

    return response.status(200).json({ message: donosFormatados });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao listar donos" });
  }
});

// Buscar dono por ID
route.get("/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const dono = await service.listDonoByType(id);

    if (!dono || dono.length < 1) {
      return response.status(404).json({ error: "Dono não encontrado" });
    }

    return response.status(200).json({ message: dono });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao buscar dono" });
  }
});

// Criar dono
route.post("/", async (request, response) => {
  try {
    const { cpf, data_nascimento, endereco_particular, codDono } = request.body;

    await service.createDono(
      cpf,
      data_nascimento,
      endereco_particular,
      codDono
    );

    return response.status(201).json({ message: "Dono cadastrado com sucesso!" });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao cadastrar dono" });
  }
});

// Atualizar dono (empresa vinculada)
route.put("/", async (request, response) => {
  try {
    const { codEmpresa, codDono } = request.body;

    await service.updateUserDono(codEmpresa, codDono);

    return response.status(200).json({ message: "Dados atualizados com sucesso" });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao atualizar dados" });
  }
});

// Deletar dono
route.delete("/:id", async (request, response) => {
  try {
    const { id } = request.params;

    await service.deleteDono(id);

    return response.status(200).json({ message: "Dono excluído com sucesso" });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao excluir dono" });
  }
});

export default route;
