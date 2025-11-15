select * from dono;
select * from empresa;
select * from usuarios;
select * from cadastro_produto;
select * from lote_produto;
select * from padroes;
select * from relatorio_exportado;
select * from estoque;
SELECT * FROM cliente;
SELECT * FROM cliente_movimentacao;
SELECT * FROM venda;

SELECT 
    u.senha_hash
FROM usuarios u
LEFT JOIN empresa e ON e.dono_id = u.dono_id
WHERE 
    (u.empresa_id = 1 OR e.id = 1)
    AND u.tipo IN ('dono', 'gerente')
    AND u.ativo = TRUE;
                 
SELECT * FROM padroes p WHERE ativo = 1 ORDER BY p.id DESC LIMIT 1;

UPDATE padroes
SET gerenciarPermissoes = 1
WHERE id = 1;

SELECT p.*
  FROM usuarios u
  JOIN padroes p ON u.acesso = p.id
  WHERE u.email = "r.o@gmail.com";
  
  SELECT
                 u.id,
                 u.nome_completo,
                 u.email,
                 u.telefone,
                 u.tipo,
                 p.ativo
                 FROM
                 usuarios u
                 JOIN
                 padroes p ON p.id = u.id;

SELECT 
    e.razao_social,
    e.cnpj,
    e.id AS e_id

FROM dono d
JOIN empresa e ON e.dono_id = d.id
JOIN usuarios u ON u.dono_id = d.id
WHERE u.ativo = 1 AND d.id = 1;

SELECT 
  u.id AS usuario_id,
  u.nome_completo,
  u.email,
  u.tipo,
  u.ativo,
  p.id AS padrao_id,
  p.adicionarUsuario,
  p.adicionarProduto,
  p.relatorios,
  p.reporEstoque,
  p.gerenciarPermissoes,
  p.adicionarPromocao,
  p.cadastrarEmpresa,
  p.prestesAVencer,
  p.iniciarExpediente
FROM usuarios u
JOIN padroes p ON u.acesso = p.id
WHERE u.email = 'rodrigo.vasconcelos@gmail.com';


#Select de vendas:
SELECT 
    v.id AS codigo_venda,
    v.data_venda,
    v.valor_total,
    v.forma_pagamento,
    v.status,
    u.nome_completo AS vendedor,
    e.nome_fantasia AS empresa
FROM venda v
JOIN usuarios u ON v.usuario_id = u.id
JOIN empresa e ON v.empresa_id = e.id;


#Ganhos:Somatória das vendas pagas por período
SELECT 
    DATE(data_venda) AS dia,
    SUM(valor_total) AS total_ganho
FROM venda
WHERE status = 'pago'
GROUP BY DATE(data_venda)
ORDER BY dia DESC;


#Por forma de pagamento:
SELECT 
    forma_pagamento,
    SUM(valor_total) AS total_ganho
FROM venda
WHERE status = 'pago'
GROUP BY forma_pagamento;


#Gastos:
SELECT 
    DATE(data_gasto) AS dia,
    SUM(valor) AS total_gasto
FROM gastos
GROUP BY DATE(data_gasto);


#Estoque:
SELECT 
    p.nome,
    p.marca,
    p.categoria,
    p.data_validade,
    e.quantidade
FROM estoque e
JOIN cadastro_produto p ON e.codigo_produto = p.codigo_produto
WHERE e.quantidade > 0
ORDER BY p.nome;


#Clientes:
SELECT 
    nome_completo,
    cpf,
    telefone,
    email,
    endereco
FROM cliente
ORDER BY nome_completo;
