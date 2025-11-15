import express from "express";
import service from "../services/empresaService.js";

const route = express.Router();

// Listar todas as empresas
route.get("/", async (request, response) => {
  try {
    const empresas = await service.listEmpresa();

    if (!empresas || empresas.length < 1) {
      return response.status(204).end();
    }

    return response.status(200).json({ message: empresas });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao listar empresas" });
  }
});

// Buscar empresa por CNPJ
route.get("/:cnpj", async (request, response) => {
  try {
    const { cnpj } = request.params;
    const empresa = await service.listEmpresaByType(cnpj);

    if (!empresa || empresa.length < 1) {
      return response.status(404).json({ error: "Empresa não encontrada" });
    }

    return response.status(200).json({ message: empresa });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao buscar empresa" });
  }
});

// Criar empresa
route.post("/", async (request, response) => {
  try {
    const {
      dono_id,
      razao_social,
      nome_fantasia,
      cnpj,
      codEmpresa,
      telefone,
      whatsapp,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep
    } = request.body;

    await service.createEmpresa(
      dono_id,
      razao_social,
      nome_fantasia,
      cnpj,
      codEmpresa,
      telefone,
      whatsapp,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep
    );

    return response.status(201).json({ message: "Empresa cadastrada com sucesso!" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao cadastrar empresa" });
  }
});

// Atualizar empresa
route.put("/:idEmpresa", async (request, response) => {
  try {
    const {
      dono_id,
      razao_social,
      nome_fantasia,
      cnpj,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
      data_inatividade,
      ativo
    } = request.body;

    const { idEmpresa } = request.params;

    await service.updateEmpresa(
      dono_id,
      razao_social,
      nome_fantasia,
      cnpj,
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado?.toUpperCase(),
      endereco_cep,
      data_inatividade,
      ativo,
      idEmpresa
    );

    return response.status(200).json({ message: "Dados atualizados com sucesso" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao atualizar empresa" });
  }
});

// Deletar empresa
route.delete("/:idEmpresa", async (request, response) => {
  try {
    const { idEmpresa } = request.params;

    await service.deleteEmpresa(idEmpresa);

    return response.status(200).json({ message: "Empresa excluída com sucesso" });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Erro ao excluir empresa" });
  }
});

export default route;
