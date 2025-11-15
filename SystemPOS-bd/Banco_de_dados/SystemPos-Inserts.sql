-- Inserindo dono 1
INSERT INTO dono (id, cpf, data_nascimento, endereco_particular)
VALUES (1, '12345678901', '1980-05-15', 'Rua A, nº 100, Bairro Central');

-- Inserindo dono 2
INSERT INTO dono (id, cpf, data_nascimento, endereco_particular)
VALUES (2, '98765432100', '1990-03-20', 'Rua B, nº 200, Bairro Norte');

-- Inserindo padrão de acessos completos para dono 1
INSERT INTO padroes (
    adicionarUsuario, adicionarProduto, relatorios, reporEstoque, 
    gerenciarPermissoes, adicionarPromocao, cadastrarEmpresa, 
    prestesAVencer, iniciarExpediente, adicionarCliente
) VALUES (
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
);

-- Inserindo padrão de acessos completos para dono 2
INSERT INTO padroes (
    adicionarUsuario, adicionarProduto, relatorios, reporEstoque, 
    gerenciarPermissoes, adicionarPromocao, cadastrarEmpresa, 
    prestesAVencer, iniciarExpediente, adicionarCliente
) VALUES (
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
);

-- Inserindo usuário tipo dono (dono 1)
INSERT INTO usuarios (
    dono_id, acesso, empresa_id, tipo, email, userlogin, senha_hash,
    nome_completo, telefone, whatsapp, genero
) VALUES (
    1, 1, NULL, 'dono', 'dono1@email.com', 'dono1login', 'hashsenha1',
    'Rodrigo Dono Um', '11999990000', 1, 'Masculino'
);

-- Inserindo usuário tipo dono (dono 2)
INSERT INTO usuarios (
    dono_id, acesso, empresa_id, tipo, email, userlogin, senha_hash,
    nome_completo, telefone, whatsapp, genero
) VALUES (
    2, 2, NULL, 'dono', 'dono2@email.com', 'dono2login', 'hashsenha2',
    'Gisely Dono Dois', '11988880000', 0, 'Feminino'
);

-- Inserindo empresa 1º para dono 1
INSERT INTO empresa (
    id, dono_id, telefone, whatsapp, razao_social, nome_fantasia, cnpj,
    endereco_logradouro, endereco_numero, endereco_complemento,
    endereco_bairro, endereco_cidade, endereco_estado, endereco_cep
) VALUES (
    1, 1, '1133334444', 1, 'Empresa Alpha Ltda', 'Alpha Market', '11222433000100',
    'Av. Principal', '1000', 'Sala 2', 'Centro', 'Recife', 'BH', '01040-000'
);

-- Inserindo empresa 2º para dono 1
INSERT INTO empresa (
    id, dono_id, telefone, whatsapp, razao_social, nome_fantasia, cnpj,
    endereco_logradouro, endereco_numero, endereco_complemento,
    endereco_bairro, endereco_cidade, endereco_estado, endereco_cep
) VALUES (
    2, 1, '1133334444', 1, 'Empresa Beta Ltda', 'Beta Market', '11222323000100',
    'Av. Terciaria', '2200', 'Sala 1', 'Centro', 'São Paulo', 'SP', '01000-000'
);

-- Inserindo empresa 2 para dono 1
INSERT INTO empresa (
    id, dono_id, telefone, whatsapp, razao_social, nome_fantasia, cnpj,
    endereco_logradouro, endereco_numero, endereco_complemento,
    endereco_bairro, endereco_cidade, endereco_estado, endereco_cep
) VALUES (
    3, 2, '1144445555', 0, 'Empresa Gama Ltda', 'Gama Store', '22334455000111',
    'Rua Secundária', '200', 'Loja B', 'Bairro Novo', 'Campinas', 'SP', '13000-000'
);

-- Inserindo padrão de acessos completos para gerente
INSERT INTO padroes (
    adicionarUsuario, adicionarProduto, relatorios, reporEstoque, 
    gerenciarPermissoes, adicionarPromocao, cadastrarEmpresa, 
    prestesAVencer, iniciarExpediente, adicionarCliente
) VALUES (
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE
);

-- Inserindo usuário tipo gerente para dono 1 (empresa 1)
INSERT INTO usuarios (
    dono_id, acesso, empresa_id, tipo, email, userlogin, senha_hash,
    nome_completo, telefone, whatsapp, genero
) VALUES (
    NULL, 3, 1, 'gerente', 'gerente1@email.com', 'gerente1login', 'hashgerente1',
    'Marcos Gerente', '11997778888', 1, 'Masculino'
);

-- Inserindo padrão de acessos completos para caixa
INSERT INTO padroes (
    adicionarUsuario, adicionarProduto, relatorios, reporEstoque, 
    gerenciarPermissoes, adicionarPromocao, cadastrarEmpresa, 
    prestesAVencer, iniciarExpediente, adicionarCliente
) VALUES (
    FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE
);

-- Inserindo usuário tipo caixa para dono 1 (empresa 2)
INSERT INTO usuarios (
    dono_id, acesso, empresa_id, tipo, email, userlogin, senha_hash,
    nome_completo, telefone, whatsapp, genero
) VALUES (
    NULL, 4, 1, 'caixa', 'caixa1@email.com', 'caixa1login', 'hashcaixa1',
    'Paula Caixa', '11996667777', 0, 'Feminino'
);

-- Inserindo padrão de acessos completos para estoque
INSERT INTO padroes (
    adicionarUsuario, adicionarProduto, relatorios, reporEstoque, 
    gerenciarPermissoes, adicionarPromocao, cadastrarEmpresa, 
    prestesAVencer, iniciarExpediente, adicionarCliente
) VALUES (
    FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE
);

-- Inserindo usuário tipo estoque para dono 1 (empresa 1)
INSERT INTO usuarios (
    dono_id, acesso, empresa_id, tipo, email, userlogin, senha_hash,
    nome_completo, telefone, whatsapp, genero
) VALUES (
    NULL, 5, 1, 'estoque', 'estoque1@email.com', 'estoque1login', 'hashestoque1',
    'Luiz Estoquista', '11995556666', 1, 'Masculino'
);



-- Inserindo produtos de teste
/*INSERT INTO cadastro_produto 
(empresa_id, codigo_produto, nome, marca, codigo_barras, tipo_produto, modelo, categoria, data_validade, estoque_min, estoque_max, preco, imagem, quantidade)
VALUES
(1, 1001, 'Arroz Branco Tipo 1 5kg', 'Camil', '7891095000018', 'Alimento', '5kg', 'Grãos', '2026-06-30', 5, 50, 35.90, 'arroz_camil_5kg.png', 20),
(1, 1002, 'Feijão Carioca 1kg', 'Tio João', '7891117000019', 'Alimento', '1kg', 'Grãos', '2025-12-31', 3, 40, 12.50, 'feijao_tiojoao_1kg.png', 15),
(1, 1003, 'Leite UHT Integral 1L', 'Italac', '7896030100017', 'Bebida', '1L', 'Laticínios', '2025-10-15', 10, 100, 5.20, 'leite_italac_1l.png', 50),
(1, 1004, 'Açúcar Refinado 1kg', 'União', '7891095000025', 'Alimento', '1kg', 'Açúcares', '2026-01-31', 5, 50, 6.30, 'acucar_uniao_1kg.png', 25),
(1, 1005, 'Óleo de Soja 900ml', 'Liza', '7891991000010', 'Alimento', '900ml', 'Óleos', '2025-11-30', 5, 40, 7.80, 'oleo_liza_900ml.png', 30),
(1, 1006, 'Macarrão Espaguete 500g', 'Barilla', '8000500031106', 'Alimento', '500g', 'Massas', '2026-02-28', 5, 40, 8.90, 'macarrao_barilla_500g.png', 20),
(1, 1007, 'Refrigerante Coca-Cola 2L', 'Coca-Cola', '7894900010018', 'Bebida', '2L', 'Refrigerantes', '2025-09-30', 10, 60, 12.50, 'cocacola_2l.png', 40),
(1, 1008, 'Cerveja Heineken Lata 350ml', 'Heineken', '7891990000139', 'Bebida', '350ml', 'Cervejas', '2026-01-31', 5, 50, 5.50, 'heineken_350ml.png', 30),
(1, 1009, 'Sabão em Pó OMO 2kg', 'OMO', '7891000090010', 'Limpeza', '2kg', 'Produtos de Limpeza', '2027-06-30', 2, 30, 28.90, 'sabao_omo_2kg.png', 15),
(1, 1010, 'Detergente Líquido Ypê 500ml', 'Ypê', '7896001000012', 'Limpeza', '500ml', 'Produtos de Limpeza', '2026-05-31', 3, 40, 3.50, 'detergente_ype_500ml.png', 25);






-- Inserindo vendas de teste
INSERT INTO venda (empresa_id, usuario_id, data_venda, valor_total, forma_pagamento, status)
VALUES 
(1, 1, NOW() - INTERVAL 6 DAY, 150.00, 'Dinheiro', 'pago'),
(1, 1, NOW() - INTERVAL 5 DAY, 220.50, 'Cartão', 'pago'),
(1, 1, NOW() - INTERVAL 4 DAY, 80.00, 'PIX', 'pago'),
(1, 1, NOW() - INTERVAL 3 DAY, 300.75, 'Cartão', 'pendente'),
(1, 1, NOW() - INTERVAL 2 DAY, 120.00, 'Dinheiro', 'pago'),
(1, 1, NOW() - INTERVAL 1 DAY, 200.00, 'PIX', 'pago');



-- Inserindo itens correspondentes para cada venda (exemplo de produtos)
INSERT INTO item_venda (venda_id, codigo_produto, quantidade, preco_unitario)
VALUES 
(1, 1, 2, 50.00),
(1, 2, 1, 50.00),
(2, 1, 3, 50.00),
(2, 3, 2, 60.25),
(3, 2, 1, 80.00),
(4, 1, 5, 60.15),
(5, 3, 2, 60.00),
(6, 1, 4, 50.00);

INSERT INTO cliente (empresa_id, nome_completo, cpf, telefone) 
VALUES (1, 'João Silva', '12345678900', '11999999999');

INSERT INTO cliente (empresa_id, nome_completo, cpf, telefone, email, endereco)
VALUES
(1, 'Cliente 4', '44444444444', '11955555555', 'cliente4@test.com', 'Rua D, 400'),
(1, 'Cliente 5', '55555555555', '11944444444', 'cliente5@test.com', 'Rua E, 500');
INSERT INTO cadastro_produto (empresa_id, codigo_produto, nome, marca, codigo_barras, tipo_produto, modelo, categoria, data_validade, estoque_min, estoque_max, preco, imagem, quantidade)
VALUES
(1, 1001, 'Produto A', 'Marca X', '1234567890123', 'Alimento', 'Modelo A', 'Categoria 1', '2025-12-31', 1, 50, 20.00, 'imagem1.png', 10),
(1, 1002, 'Produto B', 'Marca Y', '1234567890124', 'Alimento', 'Modelo B', 'Categoria 2', '2025-11-30', 2, 40, 35.00, 'imagem2.png', 15),
(1, 1003, 'Produto C', 'Marca Z', '1234567890125', 'Bebida', 'Modelo C', 'Categoria 3', '2025-10-31', 1, 30, 50.00, 'imagem3.png', 5);

INSERT INTO historico_estoque (codigo_produto, tipo_movimentacao, quantidade, usuario_id, data_movimentacao)
VALUES
(1, 'entrada', 5, 1, '2025-08-26 09:00:00'),
(2, 'entrada', 3, 1, '2025-08-27 10:00:00'),
(3, 'saida', 2, 1, '2025-08-28 11:00:00');
INSERT INTO gastos (empresa_id, descricao, valor, data_gasto, categoria)
VALUES
(1, 'Compra de embalagens', 50.00, '2025-08-28 08:00:00', 'Materiais'),
(1, 'Manutenção equipamentos', 120.00, '2025-08-29 09:00:00', 'Despesas');
*/



-- Produtos reais para empresa 1
/*INSERT INTO cadastro_produto 
(empresa_id, codigo_produto, nome, marca, codigo_barras, tipo_produto, modelo, categoria, data_validade, estoque_min, estoque_max, preco, imagem, quantidade)
VALUES
(1, 1001, 'Arroz Branco Tipo 1 5kg', 'Camil', '7891095000018', 'Alimento', '5kg', 'Grãos', '2026-06-30', 5, 50, 35.90, 'arroz_camil_5kg.png', 20),
(1, 1002, 'Feijão Carioca 1kg', 'Tio João', '7891117000019', 'Alimento', '1kg', 'Grãos', '2025-12-31', 3, 40, 12.50, 'feijao_tiojoao_1kg.png', 15),
(1, 1003, 'Leite UHT Integral 1L', 'Italac', '7896030100017', 'Bebida', '1L', 'Laticínios', '2025-10-15', 10, 100, 5.20, 'leite_italac_1l.png', 50),
(1, 1004, 'Açúcar Refinado 1kg', 'União', '7891095000025', 'Alimento', '1kg', 'Açúcares', '2026-01-31', 5, 50, 6.30, 'acucar_uniao_1kg.png', 25),
(1, 1005, 'Óleo de Soja 900ml', 'Liza', '7891991000010', 'Alimento', '900ml', 'Óleos', '2025-11-30', 5, 40, 7.80, 'oleo_liza_900ml.png', 30),
(1, 1006, 'Macarrão Espaguete 500g', 'Barilla', '8000500031106', 'Alimento', '500g', 'Massas', '2026-02-28', 5, 40, 8.90, 'macarrao_barilla_500g.png', 20),
(1, 1007, 'Refrigerante Coca-Cola 2L', 'Coca-Cola', '7894900010018', 'Bebida', '2L', 'Refrigerantes', '2025-09-30', 10, 60, 12.50, 'cocacola_2l.png', 40),
(1, 1008, 'Cerveja Heineken Lata 350ml', 'Heineken', '7891990000139', 'Bebida', '350ml', 'Cervejas', '2026-01-31', 5, 50, 5.50, 'heineken_350ml.png', 30),
(1, 1009, 'Sabão em Pó OMO 2kg', 'OMO', '7891000090010', 'Limpeza', '2kg', 'Produtos de Limpeza', '2027-06-30', 2, 30, 28.90, 'sabao_omo_2kg.png', 15),
(1, 1010, 'Detergente Líquido Ypê 500ml', 'Ypê', '7896001000012', 'Limpeza', '500ml', 'Produtos de Limpeza', '2026-05-31', 3, 40, 3.50, 'detergente_ype_500ml.png', 25);*/
