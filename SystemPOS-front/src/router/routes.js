const page = (name) => () => import(`src/pages/${name}.vue`)

const routes = [
  {
    path: '/',
    //MainLayout
    component: page('MainLayout'),
    children: [{ path: '', component: page('IndexPage') }],
  },

  // Páginas principais
  { path: '/home', component: page('HomePageTeste') },

  // Autenticação
  { path: '/login', component: page('LoginorRegister') },
  { path: '/register', component: page('RegistroUsuario') },
  { path: '/registerProp', component: page('RegistroProp') },
  { path: '/loginPage', component: page('PaginaLogin') },
  { path: '/redefinirSenha', component: page('RedefinirSenha') },
  { path: '/verifiqueEmail', component: page('VerifiqueEmail') },
  { path: '/redefinirSenhaNova', component: page('RedefinirSenhaNova') },

  // Dados da loja
  { path: '/dataStore', component: page('DadosLoja') },
  { path: '/dataStoreB', component: page('DadosLojaB') },
  { path: '/adressStore', component: page('EnderecoLoja') },
  { path: '/adressStoreB', component: page('EnderecoLojaB') },

  // Produtos
  { path: '/cadastroProduto', component: page('CadastroProduto') },
  { path: '/ProdutoSucesso', component: page('ProdutoSucesso') },
  { path: '/ProdutoNaoSucesso', component: page('ProdutoNaoSucesso') },
  { path: '/reporEstoque', component: page('ReporEstoque') },
  { path: '/posReporEstoque', component: page('PosReporEstoque') },
  { path: '/reporEstoqueParticular', component: page('ReporEstoqueParticular') },
  { path: '/alterarPreco', component: page('AlterarPreco') },
  { path: '/posAlterarPreco', component: page('PosAlterarPreco') },
  { path: '/alterarPrecoParticular', component: page('AlterarPrecoParticular') },
  { path: '/descricaoDetalhada', component: page('DescricaoDetalhada') },
  { path: '/prestesAVencer', component: page('PrestesAVencer') },
  { path: '/VerLotes', component: page('VerLotes') },

  // Funcionários e usuários
  { path: '/cadastroFuncionario', component: page('CadastroFuncionario') },
  { path: '/listarUsuarios', component: page('ListarUsuarios') },
  { path: '/atribuicaoSucesso', component: page('AtribuicaoSucesso') },
  { path: '/GerenciarPermissoes', component: page('GerenciarPermissoes') },

  // Vendas e Caixa
  { path: '/TelaVenda', component: page('TelaVenda') },
  { path: '/FecharCaixa', component: page('CaixaFechado') },
  { path: '/CaixaLivre', component: page('CaixaLivre') },
  { path: '/TelaPagamento', component: page('TelaPagamento') },

  // Histórico e outros
  { path: '/historicoPage', component: page('HistoricoPage') },
  { path: '/escolherEmpresa', component: page('EscolherEmpresa') },
  { path: '/listarVendas', component: page('ListarVendas') },
  { path: '/graficos', component: page('RelatorioGrafico') },

  //Clientes
  { path: '/listarClientes', component: page('ListagemClientes') },
  { path: '/CadastrarCliente', component: page('CadastroCliente') },
  { path: '/DetalhesCliente', component: page('DetalhesCliente') },
  { path: '/EditarCliente', component: page('EditarCliente') },

  {
    path: '/detalhes-venda/:vendaId/:empresaId',
    component: page('DetalhesVenda'), // ✅ CORRETO - sem "pages/"
  },

  // Pagina inicial
  { path: '/mainLayout', component: page('MainLayout') },

  // Rota de erro
  { path: '/:catchAll(.*)*', component: page('ErrorNotFound') },
]

export default routes
