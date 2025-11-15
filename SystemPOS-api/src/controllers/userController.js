import express from "express";
import service from "../services/userService.js";

const route = express.Router();

// Lista usuários comuns
route.get("/LU/:codEmpresa", async (request, response) => {
    const { codEmpresa } = request.params;
    const users = await service.listUser(codEmpresa);

    if (users.length < 1) {
        return response.status(204).end();
    }

    return response.status(200).json({ message: users });
});

// Lista usuários superiores (admin / dono / gerente)
route.get("/SU/:codEmpresa", async (request, response) => {
    const { codEmpresa } = request.params;
    const users = await service.listUserSU(codEmpresa);

    if (users.length < 1) {
        return response.status(204).end();
    }

    return response.status(200).json({ message: users });
});

// Busca por email
route.get("/:Email", async (request, response) => {
    const { Email } = request.params;
    const users = await service.listUserByType(Email);

    if (users.length < 1) {
        return response.status(404).json({ erro: "Usuário não encontrado" });
    }

    return response.status(200).json({ message: users });
});

// Busca por nome de usuário (login)
route.get("/nameUser/:loginUser", async (request, response) => {
    const { loginUser } = request.params;
    const users = await service.listUserByTypeLU(loginUser);

    if (users.length < 1) {
        return response.status(404).json({ erro: "Usuário não encontrado" });
    }

    return response.status(200).json({ message: users });
});

// Criar usuário
route.post("/", async (request, response) => {
    const {
        nome,
        acesso,
        email,
        nomeUsuario,
        senha,
        telefone,
        whatsapp,
        tipo,
        genero,
        codEmpresa,
        codDono
    } = request.body;

    await service.createUser(
        nome,
        acesso,
        email,
        nomeUsuario,
        senha,
        telefone,
        whatsapp,
        tipo,
        genero,
        codEmpresa,
        codDono
    );

    return response.status(201).json({ message: "Usuário cadastrado com sucesso!" });
});

// Atualizar usuario (empresa do dono)
route.put("/:codDono", async (request, response) => {
    const { codEmpresa } = request.body;
    const { codDono } = request.params;

    await service.updateUser(codEmpresa, codDono);

    return response.status(200).json({
        message: "Dados atualizados com sucesso"
    });
});

// Deletar usuário (desativar)
route.delete("/:id", async (request, response) => {
    const { id } = request.params;

    await service.deleteUser(id);

    return response.status(200).json({
        message: "Usuário excluído com sucesso"
    });
});

export default route;
