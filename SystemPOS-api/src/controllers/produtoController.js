import express from "express";
import service from "../services/produtoService.js";
import multer from "multer";
import cloudinary from "../helpers/cloudinary.js";
import fs from "fs";

const route = express.Router();
const upload = multer({ dest: "./src/upload/" });

// --------------------- LISTAGENS ---------------------

route.get("/RE/:codEmpresa", async (req, res) => {
  try {
    const produtos = await service.listProdRE(req.params.codEmpresa);
    if (!produtos.length) return res.status(204).end();
    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

route.get("/AP/:codEmpresa", async (req, res) => {
  try {
    const produtos = await service.listProdAP(req.params.codEmpresa);
    if (!produtos.length) return res.status(204).end();
    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

route.get("/lotes/:idProduto", async (req, res) => {
  try {
    const { idProduto } = req.params;

    const lotes = await service.listLotesByProduto(idProduto);

    if (!lotes.length) {
      return res.status(200).json({ message: [] }); // evita 204
    }

    return res.status(200).json({ message: lotes });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao buscar lotes do produto." });
  }
});

route.get("/PV/:codEmpresa/:dias", async (req, res) => {
  try {
    const { codEmpresa, dias } = req.params;

    const produtos = await service.listProdPrestesVencer(codEmpresa, dias);

    if (!produtos.length) return res.status(204).end();

    return res.status(200).json({ message: produtos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno ao listar produtos prestes a vencer." });
  }
});


route.get("/CP/:codEmpresa", async (req, res) => {
  try {
    const produtos = await service.listProdCP(req.params.codEmpresa);
    if (!produtos.length) return res.status(204).end();
    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

// Buscar por código de barras
route.get("/DD/:codBarras/:codEmpresa", async (req, res) => {
  try {
    const { codBarras, codEmpresa } = req.params;

    const produtos = await service.listProdByType(codBarras, codEmpresa);

    if (!produtos.length) return res.status(204).end();

    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Buscar por código de barras
route.get("/COD/:codProduto/:codEmpresa", async (req, res) => {
  try {
    const { codProduto, codEmpresa } = req.params;

    const produtos = await service.listProdByTypeCOD(codProduto, codEmpresa);

    if (!produtos.length) return res.status(204).end();

    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Produtos prestes a vencer
route.get("/:codEmpresa", async (req, res) => {
  try {
    const produtos = await service.listProdVali(req.params.codEmpresa);
    if (!produtos.length) return res.status(204).end();
    return res.status(200).json({ message: produtos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// --------------------- CADASTRAR PRODUTO ---------------------

route.post("/", upload.single("img"), async (req, res) => {
  try {
    const {
      nome, marca, codBarras, codEmpresa, codProduto,
      tipo, modelo, categoria, preco, estMin, estMax
    } = req.body;

    if (!req.file)
      return res.status(400).json({ erro: "Nenhuma imagem enviada" });

    const uploadResult = await cloudinary.uploader.upload(req.file.path);

    const novoProduto = await service.createProd(
    nome, marca, codBarras, codEmpresa, codProduto,
    tipo, modelo, categoria, preco, estMin, estMax,
    uploadResult.secure_url
  );

  return res.status(201).json({
    message: "Produto cadastrado com sucesso!",
    id: novoProduto.id_produto,     // ✅ AGORA FUNCIONA
    url: uploadResult.secure_url
  });



  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "Produto já existe" });

    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// --------------------- CADASTRAR LOTE ---------------------

route.post("/lote", async (req, res) => {
  try {
    const { produtoId, numeroLote, dataValidade, quantidade } = req.body;

    await service.createLote(produtoId, numeroLote, dataValidade, quantidade);

    return res.status(201).json({ message: "Lote cadastrado com sucesso!" });

  } catch (error) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ erro: "Esse lote já foi cadastrado para este produto." });

    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

// --------------------- ATUALIZAR PRODUTO ---------------------

route.put("/:id", async (req, res) => {
  try {
    await service.updateProd(
      req.body.nome, req.body.marca, req.body.codBarras,
      req.body.tipo, req.body.modelo, req.body.categoria,
      req.body.preco, req.body.estMin, req.body.estMax,
      req.body.urlUpload, req.body.dataExclusao,
      req.body.ativo, req.params.id
    );

    return res.status(200).json({ message: "Dados atualizados com sucesso" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao atualizar" });
  }
});

// Alterar preço
route.put("/AP/:id", async (req, res) => {
  try {
    await service.updateProdAP(req.body.preco, req.params.id);
    return res.status(200).json({ message: "Atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno" });
  }
});

// Baixar estoque de um lote
route.put("/VE/:id", async (req, res) => {
  try {
    await service.updateProdVE(req.body.quantidadeNova, req.params.id);
    return res.status(200).json({ message: "Estoque atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno" });
  }
});

// --------------------- EXCLUIR LOTE ---------------------
route.delete("/lote/:idLote", async (req, res) => {
  try {
    const { idLote } = req.params;
    await service.excluirLote(idLote);
    return res.status(200).json({ message: "Lote excluído com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao excluir lote." });
  }
});

// --------------------- EXCLUIR PRODUTO ---------------------
route.delete("/:codigoProd/:codEmpresa", async (req, res) => {
  try {
    const { codigoProd, codEmpresa } = req.params;
    await service.excluirProduto(codigoProd, codEmpresa);
    return res.status(200).json({ message: "Produto e seus lotes foram excluídos." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao excluir produto." });
  }
});

export default route;
