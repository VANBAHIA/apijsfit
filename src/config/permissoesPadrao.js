
export const MODULOS_SISTEMA = {
  // ========== PESSOAS ==========
  ALUNOS: 'alunos',
  FUNCIONARIOS: 'funcionarios',

  VISITANTES: 'visitantes',
  INSTRUTORES: 'instrutores',

  // ========== OPERACIONAL ==========
  MATRICULAS: 'matriculas',
  TURMAS: 'turmas',
  FREQUENCIA: 'frequencia',
  EQUIPAMENTOS: 'equipamentos',
  EXERCICIOS_EQUIPAMENTOS: 'exercicioEquipamentos',
  // ========== CADASTROS ==========
  PLANOS: 'planos',
  GRUPOS_EXERCICIOS: 'gruposexercicio',
  EXERCICIOS: 'exercicios',
  DESCONTOS: 'descontos',
  LOCAIS: 'locais',
  FUNCOES: 'funcoes',





  // ========== FINANCEIRO ==========
  MENSALIDADES: 'mensalidades',
  CONTAS_PAGAR: 'contasPagar',
  CONTAS_RECEBER: 'contasReceber',
  CAIXA: 'caixa',

  // ========== RELATÓRIOS ==========
  RELATORIO_FREQUENCIA: 'relatorioFrequencia',
  RELATORIO_FINANCEIRO: 'relatorioFinanceiro',

  // ========== CONFIGURAÇÕES ==========
  DADOS_ACADEMIA: 'dadosAcademia',
  USUARIOS: 'usuarios',
  LICENCAS: 'licencas',
  SISTEMA: 'sistema'
};

export const ACOES_PADRAO = {
  ACESSAR: 'acessar',
  CRIAR: 'criar',
  EDITAR: 'editar',
  EXCLUIR: 'excluir',
  EXPORTAR: 'exportar',
  IMPRIMIR: 'imprimir',
  VISUALIZAR: 'visualizar'
};

export const ACOES_ESPECIAIS = {
  // Financeiro
  APLICAR_DESCONTO_MAIOR_30: 'APLICAR_DESCONTO_MAIOR_30',
  APLICAR_DESCONTO_MAIOR_50: 'APLICAR_DESCONTO_MAIOR_50',
  APLICAR_DESCONTO_ILIMITADO: 'APLICAR_DESCONTO_ILIMITADO',
  CANCELAR_MATRICULA: 'CANCELAR_MATRICULA',
  CANCELAR_QUALQUER_MATRICULA: 'CANCELAR_QUALQUER_MATRICULA',
  ESTORNAR_PAGAMENTO: 'ESTORNAR_PAGAMENTO',
  EDITAR_VALOR_MATRICULA: 'EDITAR_VALOR_MATRICULA',

  // Caixa
  ABRIR_CAIXA: 'ABRIR_CAIXA',
  FECHAR_CAIXA: 'FECHAR_CAIXA',
  REABRIR_CAIXA: 'REABRIR_CAIXA',
  EDITAR_MOVIMENTO_CAIXA: 'EDITAR_MOVIMENTO_CAIXA',
  EXCLUIR_MOVIMENTO_CAIXA: 'EXCLUIR_MOVIMENTO_CAIXA',

  // RH e Salários
  VISUALIZAR_SALARIOS: 'VISUALIZAR_SALARIOS',
  EDITAR_SALARIOS: 'EDITAR_SALARIOS',
  PROCESSAR_FOLHA: 'PROCESSAR_FOLHA',

  // Relatórios
  GERAR_RELATORIOS_AVANCADOS: 'GERAR_RELATORIOS_AVANCADOS',
  EXPORTAR_DADOS_COMPLETOS: 'EXPORTAR_DADOS_COMPLETOS',
  ACESSAR_DASHBOARD_GERENCIAL: 'ACESSAR_DASHBOARD_GERENCIAL',

  // Sistema
  EDITAR_EMPRESA: 'EDITAR_EMPRESA',
  GERENCIAR_USUARIOS: 'GERENCIAR_USUARIOS',
  GERENCIAR_LICENCAS: 'GERENCIAR_LICENCAS',
  ACESSAR_LOGS_SISTEMA: 'ACESSAR_LOGS_SISTEMA',
  CONFIGURAR_SISTEMA: 'CONFIGURAR_SISTEMA',

  // Outros
  ALTERAR_DATA_RETROATIVA: 'ALTERAR_DATA_RETROATIVA',
  EDITAR_DADOS_SENSÍVEIS: 'EDITAR_DADOS_SENSÍVEIS'
};

/**
 * Templates de Permissões por Perfil
 */
export const TEMPLATES_PERFIS = {
  SUPER_ADMIN: {
    modulos: {
      // === CONTROLE ===
      alunos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        exportar: true,
        imprimir: true
      },
      funcionarios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        demitir: true,
        reativar: true,
        exportar: true,
        visualizarSalarios: true
      },
      matriculas: {
        acessar: true,
        inativar: true,
        reativar: true,
        gerarCobr: false,
        criar: true,
        editar: true,
        excluir: true,
        cancelar: true,
        aplicarDesconto: true,
        editarValor: true,
        exportar: true
      },
      turmas: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarHorarios: true,
        gerenciarInstrutores: true
      },
      frequencia: {
        acessar: true,
        registrar: true,
        editar: true,
        excluir: true,
        validar: true,
        exportar: true
      },
      visitantes: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        exportar: true
      },
      instrutores: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarAgenda: true
      },

      // === CADASTROS AUXILIARES ===
      locais: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },


      funcoes: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      planos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        editarPrecos: true
      },
      descontos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      gruposexercicio: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      exercicios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      equipamentos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarManutencao: true
      },
      exercicioEquipamentos: {
        acessar: true,
        vincular: true,
        desvincular: true,
        editar: true,
        visualizar: true
      },
      exercicioEquipamentos: {
        acessar: false,
        vincular: false,
        desvincular: false,
        editar: false,
        visualizar: false
      },
      // === FINANCEIRO ===
      mensalidades: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        receber: true,
        estornar: true,
        exportar: true
      },
      contasPagar: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        pagar: true,
        exportar: true
      },
      contasReceber: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        receber: true,
        exportar: true
      },
      caixa: {
        acessar: true,
        abrir: true,
        fechar: true,
        reabrir: true,
        editarMovimento: true,
        excluirMovimento: true,
        exportar: true
      },

      // === RELATÓRIOS ===
      relatorioFrequencia: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true
      },
      relatorioFinanceiro: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true,
        dashboardGerencial: true
      },

      // === CONFIGURAÇÕES ===
      dadosAcademia: {
        acessar: true,
        editar: true
      },
      usuarios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarPermissoes: true,
        alterarSenhas: true
      },
      licencas: {
        acessar: true,
        criar: true,
        editar: true,
        ativar: true,
        desativar: true
      },
      sistema: {
        acessar: true,
        configurar: true,
        acessarLogs: true,
        backupRestaurar: true
      }
    },
    acoes_especiais: [
      'APLICAR_DESCONTO_ILIMITADO',
      'CANCELAR_QUALQUER_MATRICULA',
      'ESTORNAR_PAGAMENTO',
      'EDITAR_VALOR_MATRICULA',
      'FECHAR_CAIXA',
      'REABRIR_CAIXA',
      'EDITAR_MOVIMENTO_CAIXA',
      'EXCLUIR_MOVIMENTO_CAIXA',
      'VISUALIZAR_SALARIOS',
      'EDITAR_SALARIOS',
      'PROCESSAR_FOLHA',
      'GERAR_RELATORIOS_AVANCADOS',
      'EXPORTAR_DADOS_COMPLETOS',
      'ACESSAR_DASHBOARD_GERENCIAL',
      'EDITAR_EMPRESA',
      'GERENCIAR_USUARIOS',
      'GERENCIAR_LICENCAS',
      'ACESSAR_LOGS_SISTEMA',
      'CONFIGURAR_SISTEMA',
      'ALTERAR_DATA_RETROATIVA',
      'EDITAR_DADOS_SENSÍVEIS'
    ]
  },

  // ========================================
  // 👑 ADMINISTRADOR - ACESSO TOTAL
  // ========================================
  ADMIN: {
    modulos: {
      // === CONTROLE ===
      alunos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        exportar: true,
        imprimir: true
      },
      funcionarios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        demitir: true,
        reativar: true,
        exportar: true,
        visualizarSalarios: true
      },
      matriculas: {
        acessar: true,
        inativar: true,
        reativar: true,
        gerarCobr: false,
        criar: true,
        editar: true,
        excluir: true,
        cancelar: true,
        aplicarDesconto: true,
        editarValor: true,
        exportar: true
      },
      turmas: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarHorarios: true,
        gerenciarInstrutores: true
      },
      frequencia: {
        acessar: true,
        registrar: true,
        editar: true,
        excluir: true,
        validar: true,
        exportar: true
      },
      visitantes: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        exportar: true
      },
      instrutores: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarAgenda: true
      },

      // === CADASTROS AUXILIARES ===
      locais: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      funcoes: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      planos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        editarPrecos: true
      },
      descontos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      gruposexercicio: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      exercicios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      equipamentos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarManutencao: true
      },
      exercicioEquipamentos: {
        acessar: true,
        vincular: true,
        desvincular: true,
        editar: true,
        visualizar: true
      },

      // === FINANCEIRO ===
      mensalidades: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        receber: true,
        estornar: true,
        exportar: true
      },
      contasPagar: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        pagar: true,
        exportar: true
      },
      contasReceber: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        receber: true,
        exportar: true
      },
      caixa: {
        acessar: true,
        abrir: true,
        fechar: true,
        reabrir: true,
        editarMovimento: true,
        excluirMovimento: true,
        exportar: true
      },

      // === RELATÓRIOS ===
      relatorioFrequencia: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true
      },
      relatorioFinanceiro: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true,
        dashboardGerencial: true
      },

      // === CONFIGURAÇÕES ===
      dadosAcademia: {
        acessar: true,
        editar: true
      },
      usuarios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true,
        gerenciarPermissoes: true,
        alterarSenhas: true
      },
      licencas: {
        acessar: false,
        criar: true,
        editar: true,
        ativar: true,
        desativar: true
      },
      sistema: {
        acessar: true,
        configurar: true,
        acessarLogs: true,
        backupRestaurar: true
      }
    },
    acoes_especiais: [
      'APLICAR_DESCONTO_ILIMITADO',
      'CANCELAR_QUALQUER_MATRICULA',
      'ESTORNAR_PAGAMENTO',
      'EDITAR_VALOR_MATRICULA',
      'FECHAR_CAIXA',
      'REABRIR_CAIXA',
      'EDITAR_MOVIMENTO_CAIXA',
      'EXCLUIR_MOVIMENTO_CAIXA',
      'VISUALIZAR_SALARIOS',
      'EDITAR_SALARIOS',
      'PROCESSAR_FOLHA',
      'GERAR_RELATORIOS_AVANCADOS',
      'EXPORTAR_DADOS_COMPLETOS',
      'ACESSAR_DASHBOARD_GERENCIAL',
      'EDITAR_EMPRESA',
      'GERENCIAR_USUARIOS',
      'GERENCIAR_LICENCAS',
      'ACESSAR_LOGS_SISTEMA',
      'CONFIGURAR_SISTEMA',
      'ALTERAR_DATA_RETROATIVA',
      'EDITAR_DADOS_SENSÍVEIS'
    ]
  },

  // ========================================
  // 👔 GERENTE - GESTÃO OPERACIONAL
  // ========================================
  GERENTE: {
    modulos: {
      // === CONTROLE ===
      alunos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        exportar: true,
        imprimir: true
      },
      funcionarios: {
        acessar: true,
        criar: false,
        editar: true,
        excluir: false,
        demitir: true,
        reativar: true,
        exportar: false,
        visualizarSalarios: false
      },
      matriculas: {
        acessar: true,
        inativar: true,
        reativar: true,
        gerarCobr: false,
        criar: true,
        editar: true,
        excluir: false,
        cancelar: true,
        aplicarDesconto: true,
        editarValor: false,
        exportar: true
      },
      turmas: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        gerenciarHorarios: true,
        gerenciarInstrutores: true
      },
      frequencia: {
        acessar: true,
        registrar: true,
        editar: true,
        excluir: false,
        validar: true,
        exportar: true
      },
      visitantes: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        exportar: true
      },
      instrutores: {
        acessar: true,
        criar: false,
        editar: true,
        excluir: false,
        gerenciarAgenda: true
      },

      // === CADASTROS AUXILIARES ===
      locais: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false
      },
      funcoes: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false
      },
      planos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        editarPrecos: false
      },
      descontos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false
      },
      gruposexercicio: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      exercicios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      equipamentos: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        gerenciarManutencao: true
      },
      exercicioEquipamentos: {
        acessar: true,
        vincular: true,
        desvincular: true,
        editar: true,
        visualizar: true
      },

      // === FINANCEIRO ===
      mensalidades: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        receber: true,
        estornar: false,
        exportar: true
      },
      contasPagar: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        pagar: false,
        exportar: false
      },
      contasReceber: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: false,
        receber: true,
        exportar: true
      },
      caixa: {
        acessar: true,
        abrir: true,
        fechar: true,
        reabrir: false,
        editarMovimento: false,
        excluirMovimento: false,
        exportar: true
      },

      // === RELATÓRIOS ===
      relatorioFrequencia: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true
      },
      relatorioFinanceiro: {
        acessar: true,
        gerar: true,
        exportar: true,
        imprimir: true,
        dashboardGerencial: true
      },

      // === CONFIGURAÇÕES ===
      dadosAcademia: {
        acessar: true,
        editar: false
      },
      usuarios: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarPermissoes: false,
        alterarSenhas: false
      },
      licencas: {
        acessar: false,
        criar: false,
        editar: false,
        ativar: false,
        desativar: false
      },
      sistema: {
        acessar: false,
        configurar: false,
        acessarLogs: false,
        backupRestaurar: false
      }
    },
    acoes_especiais: [
      'APLICAR_DESCONTO_MAIOR_30',
      'CANCELAR_MATRICULA',
      'FECHAR_CAIXA',
      'GERAR_RELATORIOS_AVANCADOS',
      'ACESSAR_DASHBOARD_GERENCIAL'
    ]
  },

  // ========================================
  // 🏋️ INSTRUTOR - TREINOS E ALUNOS
  // ========================================
  INSTRUTOR: {
    modulos: {
      // === CONTROLE ===
      alunos: {
        acessar: true,
        criar: false,
        editar: true,
        excluir: false,
        exportar: false,
        imprimir: false
      },
      funcionarios: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        demitir: false,
        reativar: false,
        exportar: false,
        visualizarSalarios: false
      },
      matriculas: {
        acessar: true,
        inativar: true,
        reativar: true,
        gerarCobr: false,
        criar: false,
        editar: false,
        excluir: false,
        cancelar: false,
        aplicarDesconto: false,
        editarValor: false,
        exportar: false
      },
      turmas: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarHorarios: false,
        gerenciarInstrutores: false
      },
      frequencia: {
        acessar: true,
        registrar: true,
        editar: true,
        excluir: false,
        validar: false,
        exportar: false
      },
      visitantes: {
        acessar: true,
        criar: true,
        editar: false,
        excluir: false,
        exportar: false
      },
      instrutores: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarAgenda: false
      },

      // === CADASTROS AUXILIARES ===
      locais: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false
      },
      funcoes: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      planos: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        editarPrecos: false
      },
      descontos: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      gruposexercicio: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      exercicios: {
        acessar: true,
        criar: true,
        editar: true,
        excluir: true
      },
      equipamentos: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarManutencao: false
      },
      exercicioEquipamentos: {
        acessar: false,
        vincular: false,
        desvincular: false,
        editar: false,
        visualizar: false
      },

      // === FINANCEIRO ===
      mensalidades: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        receber: false,
        estornar: false,
        exportar: false
      },
      contasPagar: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        pagar: false,
        exportar: false
      },
      contasReceber: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        receber: false,
        exportar: false
      },
      caixa: {
        acessar: false,
        abrir: false,
        fechar: false,
        reabrir: false,
        editarMovimento: false,
        excluirMovimento: false,
        exportar: false
      },

      // === RELATÓRIOS ===
      relatorioFrequencia: {
        acessar: true,
        gerar: true,
        exportar: false,
        imprimir: true
      },
      relatorioFinanceiro: {
        acessar: false,
        gerar: false,
        exportar: false,
        imprimir: false,
        dashboardGerencial: false
      },

      // === CONFIGURAÇÕES ===
      dadosAcademia: {
        acessar: true,
        editar: false
      },
      usuarios: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarPermissoes: false,
        alterarSenhas: false
      },
      licencas: {
        acessar: false,
        criar: false,
        editar: false,
        ativar: false,
        desativar: false
      },
      sistema: {
        acessar: false,
        configurar: false,
        acessarLogs: false,
        backupRestaurar: false
      }
    },
    acoes_especiais: []
  },

  // ========================================
  // 👤 USUÁRIO - ACESSO BÁSICO/RECEPÇÃO
  // ========================================
  USUARIO: {
    modulos: {
      // === CONTROLE ===
      alunos: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        exportar: false,
        imprimir: false
      },
      funcionarios: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        demitir: false,
        reativar: false,
        exportar: false,
        visualizarSalarios: false
      },
      matriculas: {
        acessar: true,
        inativar: true,
        reativar: true,
        gerarCobr: false,
        criar: false,
        editar: false,
        excluir: false,
        cancelar: false,
        aplicarDesconto: false,
        editarValor: false,
        exportar: false
      },
      turmas: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarHorarios: false,
        gerenciarInstrutores: false
      },
      frequencia: {
        acessar: true,
        registrar: true,
        editar: false,
        excluir: false,
        validar: false,
        exportar: false
      },
      visitantes: {
        acessar: true,
        criar: true,
        editar: false,
        excluir: false,
        exportar: false
      },
      instrutores: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarAgenda: false
      },

      // === CADASTROS AUXILIARES ===
      locais: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false
      },
      funcoes: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      planos: {
        acessar: true,
        criar: false,
        editar: false,
        excluir: false,
        editarPrecos: false
      },
      descontos: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      gruposexercicio: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      exercicios: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false
      },
      equipamentos: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarManutencao: false
      },
      exercicioEquipamentos: {
        acessar: false,
        vincular: false,
        desvincular: false,
        editar: false,
        visualizar: false
      },

      // === FINANCEIRO ===
      mensalidades: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        receber: false,
        estornar: false,
        exportar: false
      },
      contasPagar: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        pagar: false,
        exportar: false
      },
      contasReceber: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        receber: false,
        exportar: false
      },
      caixa: {
        acessar: false,
        abrir: false,
        fechar: false,
        reabrir: false,
        editarMovimento: false,
        excluirMovimento: false,
        exportar: false
      },

      // === RELATÓRIOS ===
      relatorioFrequencia: {
        acessar: true,
        gerar: false,
        exportar: false,
        imprimir: false
      },
      relatorioFinanceiro: {
        acessar: false,
        gerar: false,
        exportar: false,
        imprimir: false,
        dashboardGerencial: false
      },

      // === CONFIGURAÇÕES ===
      dadosAcademia: {
        acessar: true,
        editar: false
      },
      usuarios: {
        acessar: false,
        criar: false,
        editar: false,
        excluir: false,
        gerenciarPermissoes: false,
        alterarSenhas: false
      },
      licencas: {
        acessar: false,
        criar: false,
        editar: false,
        ativar: false,
        desativar: false
      },
      sistema: {
        acessar: false,
        configurar: false,
        acessarLogs: false,
        backupRestaurar: false
      }
    },
    acoes_especiais: []
  }
};

/**
 * Função para aplicar template de permissões baseado no perfil
 * @param {string} perfil - Nome do perfil (ADMIN, GERENTE, INSTRUTOR, USUARIO)
 * @returns {Object} Template de permissões
 */
export const aplicarTemplatePerfil = (perfil) => {
  return TEMPLATES_PERFIS[perfil] || TEMPLATES_PERFIS.USUARIO;
};

/**
 * Função para mesclar permissões (útil ao atualizar perfil mantendo customizações)
 * @param {Object} permissoesAtuais - Permissões atuais do usuário
 * @param {Object} novoTemplate - Novo template baseado no perfil
 * @returns {Object} Permissões mescladas
 */
export const mesclarPermissoes = (permissoesAtuais, novoTemplate) => {
  return {
    modulos: {
      ...novoTemplate.modulos,
      ...permissoesAtuais.modulos
    },
    acoes_especiais: [
      ...new Set([
        ...(novoTemplate.acoes_especiais || []),
        ...(permissoesAtuais.acoes_especiais || [])
      ])
    ]
  };
};

/**
 * Função para verificar se um perfil tem uma permissão específica
 * @param {string} perfil - Nome do perfil
 * @param {string} modulo - Nome do módulo
 * @param {string} acao - Nome da ação
 * @returns {boolean}
 */
export const perfilTemPermissao = (perfil, modulo, acao) => {
  const template = TEMPLATES_PERFIS[perfil];
  if (!template) return false;

  return template.modulos?.[modulo]?.[acao] === true;
};

/**
 * Lista de todos os módulos do sistema (para UI)
 */
export const LISTA_MODULOS = [
  // Controle
  { id: 'alunos', nome: 'Alunos', categoria: 'Controle', icon: '👥' },
  { id: 'funcionarios', nome: 'Funcionários', categoria: 'Controle', icon: '👔' },
  { id: 'matriculas', nome: 'Matrículas', categoria: 'Controle', icon: '📋' },
  { id: 'turmas', nome: 'Turmas', categoria: 'Controle', icon: '🎓' },
  { id: 'frequencia', nome: 'Frequência', categoria: 'Controle', icon: '📅' },
  { id: 'visitantes', nome: 'Visitantes', categoria: 'Controle', icon: '🚶' },
  { id: 'instrutores', nome: 'Instrutores', categoria: 'Controle', icon: '💪' },

  // Cadastros Auxiliares
  { id: 'locais', nome: 'Locais', categoria: 'Cadastros', icon: '📍' },
  { id: 'funcoes', nome: 'Funções', categoria: 'Cadastros', icon: '💼' },
  { id: 'planos', nome: 'Planos', categoria: 'Cadastros', icon: '📄' },
  { id: 'descontos', nome: 'Descontos', categoria: 'Cadastros', icon: '💳' },
  { id: 'modalidades', nome: 'Modalidades', categoria: 'Cadastros', icon: '🏋️' },
  { id: 'equipamentos', nome: 'Equipamentos', categoria: 'Cadastros', icon: '🔧' },

  // Financeiro
  { id: 'mensalidades', nome: 'Mensalidades', categoria: 'Financeiro', icon: '💵' },
  { id: 'contasPagar', nome: 'Contas a Pagar', categoria: 'Financeiro', icon: '📉' },
  { id: 'contasReceber', nome: 'Contas a Receber', categoria: 'Financeiro', icon: '📈' },
  { id: 'caixa', nome: 'Caixa', categoria: 'Financeiro', icon: '💰' },

  // Relatórios
  { id: 'relatorioFrequencia', nome: 'Relatório de Frequência', categoria: 'Relatórios', icon: '📊' },
  { id: 'relatorioFinanceiro', nome: 'Relatório Financeiro', categoria: 'Relatórios', icon: '📊' },

  // Configurações
  { id: 'dadosAcademia', nome: 'Dados da Academia', categoria: 'Configurações', icon: '🏢' },
  { id: 'usuarios', nome: 'Usuários', categoria: 'Configurações', icon: '👤' },
  { id: 'licencas', nome: 'Licenças', categoria: 'Configurações', icon: '🔑' },
  { id: 'sistema', nome: 'Sistema', categoria: 'Configurações', icon: '⚙️' }
];

export default {
  MODULOS_SISTEMA,
  ACOES_PADRAO,
  ACOES_ESPECIAIS,
  TEMPLATES_PERFIS,
  aplicarTemplatePerfil,
  mesclarPermissoes,
  perfilTemPermissao,
  LISTA_MODULOS
};