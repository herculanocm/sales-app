import { SideNavItems, SideNavSection } from "../models";

export const sideNavSections: SideNavSection[] = [
    {
        text: 'MENU',
        items: ['dashboards', 'fornecedores'],
    }
];

/*
   fluxos: {
        icon: 'fa fa-exchange',
        text: 'Fluxo de Caixa',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_FLUXOS',
        ],
        submenu: [
            {
                link: '/pages/fluxos/fluxo-cliente',
                text: 'Fluxo Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO',
                ],
            },
            {
                link: '/pages/fluxos/fluxo-tipo',
                text: 'Fluxo Tipo',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO_TIPO',
                ],
            },
            {
                link: '/pages/fluxos/fluxo-centro',
                text: 'Fluxo Centro',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO_CENTRO',
                ],
            },
        ]
    },
*/

export const sideNavItems: SideNavItems = {
    dasboards: {
        icon: 'fa fa-tachometer',
        text: 'Dashboards',
        roles: [
            'ROLE_ADMIN',
            'ROLE_ANY',
            'ROLE_SALES_MENU_DASHBOARDS',
        ],
        submenu: [
            {
                link: '/pages/dashboards/clientes',
                text: 'Dash Clientes',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_ANY',
                    'ROLE_SALES_MENU_DASHBOARDS_SUBMENU_CLIENTES',
                ],
            },
        ]
    },
 
    acessos: {
        icon: 'fa fa-lock',
        text: 'Acessos',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_ACESSOS',
        ],
        submenu: [
            {
                link: '/pages/acessos/usuarios',
                text: 'Usuários',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ACESSOS_SUBMENU_USUARIO',
                ],
            },
            {
                link: '/pages/acessos/roles',
                text: 'Roles',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ACESSOS_SUBMENU_ROLE',
                ],
            },
            {
                link: '/pages/acessos/access-report',
                text: 'Acesso de Relatório',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ACESSOS_SUBMENU_ACCESS_REPORT',
                ],
            },
        ]
    },
    configuracoes: {
        icon: 'fa fa-cogs',
        text: 'Configurações',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_CONFIGURACOES',
        ],
        submenu: [
            {
                link: '/pages/configuracoes/conf-msg',
                text: 'Mensagem de Sistema',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONFIGURACOES_SUBMENU_CONF_MSG_SISTEMA',
                ],
            },
            {
                link: '/pages/configuracoes/conf-gerais-dto',
                text: 'Configurações Gerais',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONFIGURACOES_SUBMENU_CONF_GERAIS',
                ],
            },
            {
                link: '/pages/configuracoes/condicao-pagamento',
                text: 'Condição de Pagamento',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONFIGURACOES_SUBMENU_CONDICAO_PAGAMENTO',
                ],
            },
            {
                link: '/pages/configuracoes/executor',
                text: 'Executor',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONFIGURACOES_SUBMENU_EXECUTOR',
                ],
            },
            {
                link: '/pages/configuracoes/sms',
                text: 'SMS',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONFIGURACOES_SUBMENU_SMS',
                ],
            },
        ]
    },
    fluxos: {
        icon: 'fa fa-exchange',
        text: 'Fluxo de Cliente',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_FLUXOS',
        ],
        submenu: [
            {
                link: '/pages/fluxos/fluxo-cliente',
                text: 'Fluxo Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO',
                ],
            },
            {
                link: '/pages/fluxos/fluxo-tipo',
                text: 'Tipo do Fluxo',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO_TIPO',
                ],
            },
            {
                link: '/pages/fluxos/fluxo-centro',
                text: 'Conta do Fluxo',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FLUXOS_SUBMENU_FLUXO_CENTRO',
                ],
            },
        ]
    },
    veiculos: {
        icon: 'fa fa-truck',
        text: 'Veículos',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_VEICULOS',
        ],
        submenu: [
            {
                link: '/pages/veiculos/veiculo',
                text: 'Veículo',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VEICULOS_SUBMENU_VEICULO',
                ],
            },
        ]
    },
    estoques: {
        icon: 'fa fa-cubes',
        text: 'Estoques',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_ESTOQUES',
        ],
        submenu: [
            {
                link: '/pages/estoques/estoque-almoxarifado',
                text: 'Almoxarifado',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ESTOQUES_SUBMENU_ALMOXARIFADO',
                ],
            },
        ]
    },
    itens: {
        icon: 'fa fa-th',
        text: 'Itens',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_ITENS',
        ],
        submenu: [
            {
                link: '/pages/itens/item-unidade',
                text: 'Unidade',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_UNIDADE',
                ],
            },
            {
                link: '/pages/itens/item-marca',
                text: 'Marca',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_MARCA',
                ],
            },
            {
                link: '/pages/itens/item-grupo',
                text: 'Grupo',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_GRUPO',
                ],
            },
            {
                link: '/pages/itens/item-categoria',
                text: 'Categoria',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_CATEGORIA',
                ],
            },
            {
                link: '/pages/itens/item-subcategoria',
                text: 'Sub Categoria',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_SUB_CATEGORIA',
                ],
            },
            {
                link: '/pages/itens/item-dto',
                text: 'Item',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_ITEM',
                ],
            },
            {
                link: '/pages/itens/item-preco',
                text: 'Item Precificação',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_ITEM_PRECIFICACAO',
                ],
            },
            {
                link: '/pages/itens/item-precificacao-auto',
                text: 'Precificação Automática',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_PRECIFICACAO_AUTO_ITEM',
                ],
            },
            {
                link: '/pages/itens/item-rua',
                text: 'Rua',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_RUA',
                ],
            },
            {
                link: '/pages/itens/item-predio',
                text: 'Predio',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_PREDIO',
                ],
            },
            {
                link: '/pages/itens/item-nivel',
                text: 'Nível',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_NIVEL',
                ],
            },
            {
                link: '/pages/itens/item-separador',
                text: 'Separador',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_ITENS_SUBMENU_SEPARADOR',
                ],
            },
        ]
    },
    funcionarios: {
        icon: 'fa fa-id-card',
        text: 'Funcionários',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_FUNCIONARIOS',
        ],
        submenu: [
            {
                link: '/pages/funcionarios/funcionario-grupo',
                text: 'Grupo Funcionário',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FUNCIONARIOS_SUBMENU_GRUPO',
                ],
            },
            {
                link: '/pages/funcionarios/funcionario-dto',
                text: 'Funcionário',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FUNCIONARIOS_SUBMENU_FUNCIONARIO',
                ],
            },
        ]
    },
    fornecedores: {
        icon: 'fa fa-suitcase',
        text: 'Fornecedores',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_FORNECEDORES',
        ],
        submenu: [
            {
                link: '/pages/fornecedores/fornecedor-grupo',
                text: 'Grupo Fornecedor',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FORNECEDORES_SUBMENU_GRUPO',
                ],
            },
            {
                link: '/pages/fornecedores/fornecedor-dto',
                text: 'Fornecedor',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_FORNECEDORES_SUBMENU_FORNECEDOR',
                ],
            },
        ]
    },
    clientes: {
        icon: 'fa fa-users',
        text: 'Clientes',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_CLIENTES',
        ],
        submenu: [
            {
                link: '/pages/clientes/cliente-grupo',
                text: 'Grupo Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_GRUPO',
                ],
            },
            {
                link: '/pages/clientes/cliente-categoria',
                text: 'Categoria Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_CATEGORIA',
                ],
            },
            {
                link: '/pages/clientes/cliente-setor',
                text: 'Setor Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_SETOR',
                ],
            },
            {
                link: '/pages/clientes/cliente-status-label',
                text: 'Status Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_STATUS_LABEL',
                ],
            },
            {
                link: '/pages/clientes/cliente-dto',
                text: 'Cliente',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_CLIENTE',
                ],
            },
            {
                link: '/pages/clientes/cliente-comodato',
                text: 'Comodato',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CLIENTES_SUBMENU_COMODATO',
                ],
            },
        ]
    },
    movimentos: {
        icon: 'fa fa-retweet',
        text: 'Movimentos',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_MOVIMENTOS',
        ],
        submenu: [
            {
                link: '/pages/movimentos/movimento-tipo',
                text: 'Tipo Movimento',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_TIPO',
                ],
            },
            {
                link: '/pages/movimentos/movimento-simples',
                text: 'Movimento Simples',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_MOVIMENTO_SIMPLES',
                ],
            },
            {
                link: '/pages/movimentos/movimento-transferencia',
                text: 'Mov Tranferência',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_MOVIMENTO_TRANSFERENCIA',
                ],
            },
            // {
            //     link: '/pages/movimentos/movimento-dto',
            //     text: 'Movimento',
            //     updated: false,
            //     isLoading: false,
            //     roles: [
            //         'ROLE_ADMIN',
            //         'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_MOVIMENTO',
            //     ],
            // },
            {
                link: '/pages/movimentos/movimento',
                text: 'Movimento',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_MOVIMENTO',
                ],
            },
            {
                link: '/pages/movimentos/movimento-posicao-item',
                text: 'Posição Item',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_POSICAO_ITEM',
                ],
            },
            {
                link: '/pages/movimentos/movimento-check-alxs',
                text: 'Check Alxs',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_CHECK_ALXS',
                ],
            },
            {
                link: '/pages/movimentos/movimento-auditoria',
                text: 'Auditoria Item',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_AUDITORIA_ITEM',
                ],
            },
            {
                link: '/pages/movimentos/movimento-preco-item',
                text: 'Preço Item',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_PRECO_ITEM',
                ],
            },
            {
                link: '/pages/movimentos/ajuste-medias',
                text: 'Ajuste Médias',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_MOVIMENTOS_SUBMENU_AJUSTE_MEDIAS',
                ],
            },
        ]
    },
    vendas: {
        icon: 'fa fa-shopping-cart',
        text: 'Vendas',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_VENDAS',
        ],
        submenu: [
            {
                link: '/pages/vendas/venda',
                text: 'Venda',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_VENDA',
                ],
            },
            {
                link: '/pages/vendas/romaneio',
                text: 'Romaneio',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_ROMANEIO',
                ],
            },
            {
                link: '/pages/vendas/pdv',
                text: 'PDV',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_PDV',
                ],
            },
            {
                link: '/pages/vendas/caixa',
                text: 'Caixa',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_CAIXA',
                ],
            },
            {
                link: '/pages/vendas/report-venda',
                text: 'Indicadores de Venda',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_REPORT_INDICADORES_VENDA',
                ],
            },
            {
                link: '/pages/vendas/report-representante',
                text: 'Report Representante',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_REPORT_REPRE',
                ],
            },
            {
                link: '/pages/vendas/relatorio-planilha',
                text: 'Relatório Planilha',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_REPORT_PLANILHA',
                ],
            },
            {
                link: '/pages/vendas/venda-representante',
                text: 'Vendas Representante',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_VENDA_REPRE',
                ],
            },
            {
                link: '/pages/vendas/report-itens',
                text: 'Report Itens',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_REPORT_ITENS',
                ],
            },
            {
                link: '/pages/vendas/report-grupos',
                text: 'Report Grupos',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_REPORT_GRUPOS',
                ],
            },
            {
                link: '/pages/vendas/venda-aprovar',
                text: 'Aprovar Vendas',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_VENDA_APROVAR',
                ],
            },
            {
                link: '/pages/vendas/venda-rota',
                text: 'Status Venda',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_VENDAS_SUBMENU_VENDA_ROTA',
                ],
            }
        ]
    },
    titulos: {
        icon: 'fa fa-money',
        text: 'Titulos',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_TITULOS',
        ],
        submenu: [
            {
                link: '/pages/titulos/titulo-receber',
                text: 'Titulos a Receber',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_TITULO',
                ],
            },
            {
                link: '/pages/titulos/cheque-recebido',
                text: 'Cheques Recebidos',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_CHEQUE_RECEBIDO',
                ],
            },
            {
                link: '/pages/titulos/tit-receber-lot',
                text: 'Processar Lote',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_PROCESSAR_LOTE',
                ],
            },
            {
                link: '/pages/titulos/tit-receber-totvs',
                text: 'Processar Lote Totvs',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_INOVA',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_TOTVS'
                ],
            },
            {
                link: '/pages/titulos/titulo-csv',
                text: 'Baixa por CSV',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_BAIXA_CSV'
                ],
            },
            {
                link: '/pages/titulos/grupo-titulo-despesa',
                text: 'Grupo Despesa',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_GRUPO_TITULO_DESPESA'
                ],
            },
            {
                link: '/pages/titulos/sub-titulo-despesa',
                text: 'SubGrupo Despesa',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_SUBGRUPO_TITULO_DESPESA'
                ],
            },
            {
                link: '/pages/titulos/titulo-despesa',
                text: 'Titulos Despesa',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TITULOS_SUBMENU_TITULO_DESPESA'
                ],
            },
        ],
    },
    totvs: {
        icon: 'fa fa-plug',
        text: 'TOTVS Integração',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_TOTVS',
        ],
        submenu: [
            {
                link: '/pages/totvs/integracao-clientes',
                text: 'Clientes Integração',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TOTVS_SUBMENU_CLIENTES',
                ],
            },
            {
                link: '/pages/totvs/integracao-itens',
                text: 'Itens Integração',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TOTVS_SUBMENU_ITENS',
                ],
            },
            {
                link: '/pages/totvs/integracao-condicoes',
                text: 'Condições Integração',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TOTVS_SUBMENU_CONDICOES',
                ],
            },
            {
                link: '/pages/totvs/integracao-preco',
                text: 'Precificação Integração',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TOTVS_SUBMENU_PRECO_WINTHOR',
                ],
            },
            {
                link: '/pages/totvs/integracao-vendas',
                text: 'Vendas Integração',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_TOTVS_SUBMENU_VENDAS',
                ],
            },
        ],
    },
    consultas: {
        icon: 'fa fa-file-text',
        text: 'Consultas',
        roles: [
            'ROLE_ADMIN',
            'ROLE_SALES_MENU_CONSULTAS',
        ],
        submenu: [
            {
                link: '/pages/consultas/consulta-livre',
                text: 'Consulta Livre',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONSULTAS_SUBMENU_CONSULTA_LIVRE',
                ],
            },
            {
                link: '/pages/consultas/relatorio',
                text: 'Relatório',
                updated: false,
                isLoading: false,
                roles: [
                    'ROLE_ADMIN',
                    'ROLE_SALES_MENU_CONSULTAS_SUBMENU_RELATORIO',
                ],
            },
        ],
    },
};
