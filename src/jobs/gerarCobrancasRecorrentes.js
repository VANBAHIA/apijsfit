// src/jobs/gerarCobrancasRecorrentes.js

class GerarCobrancasJob {
  
  async buscarMatriculasParaGerar(dataHoje, dataLimite) {
    return await prisma.matricula.findMany({
      where: {
        situacao: 'ATIVA',
        dataFim: { gte: dataHoje },
        diaVencimento: { not: null },
        
        // ✅ FILTRAR APENAS PLANOS RECORRENTES
        plano: {
          tipoCobranca: 'RECORRENTE'
        }
      },
      include: {
        aluno: {
          include: {
            pessoa: {
              select: {
                nome1: true,
                doc1: true
              }
            }
          }
        },
        plano: true,
        desconto: true
      }
    });
  }

  async processarMatricula(matricula, dataHoje) {
    const { plano } = matricula;

    // ✅ VERIFICAR TIPO DE COBRANÇA
    if (plano.tipoCobranca === 'UNICA') {
      // Planos únicos não geram cobrança recorrente
      return {
        gerada: false,
        motivo: 'Plano com cobrança única - Não gera recorrência'
      };
    }

    // ✅ VERIFICAR SE PLANO JÁ EXPIROU
    if (this.planoExpirou(matricula, dataHoje)) {
      return {
        gerada: false,
        motivo: 'Plano expirado - Período de vigência encerrado'
      };
    }

    // Calcular próximo vencimento
    const proximoVencimento = this.calcularProximoVencimento(
      matricula.diaVencimento,
      dataHoje,
      plano
    );

    // Calcular mês de referência
    const mesReferencia = this.formatarMesReferencia(proximoVencimento);

    // Verificar se já existe cobrança
    const cobrancaExistente = await this.verificarCobrancaExistente(
      matricula.alunoId,
      matricula.planoId,
      mesReferencia
    );

    if (cobrancaExistente) {
      return { 
        gerada: false, 
        motivo: 'Cobrança já existe para este período',
        numero: cobrancaExistente.numero
      };
    }

    // Criar nova cobrança
    const novaConta = await contaReceberService.criar({
      alunoId: matricula.alunoId,
      planoId: matricula.planoId,
      descontoId: matricula.descontoId,
      dataVencimento: proximoVencimento,
      observacoes: `Cobrança automática - Matrícula: ${matricula.codigo} - Ref: ${mesReferencia}`
    });

    return {
      gerada: true,
      numero: novaConta.numero,
      vencimento: proximoVencimento
    };
  }

  /**
   * ✅ NOVA FUNÇÃO: Verifica se plano já expirou
   */
  planoExpirou(matricula, dataHoje) {
    const { plano, dataInicio } = matricula;

    // Planos recorrentes sem limite de tempo
    if (!plano.numeroMeses && !plano.numeroDias) {
      return false;
    }

    // Calcular data de expiração
    const dataExpiracao = new Date(dataInicio);
    
    if (plano.numeroMeses) {
      dataExpiracao.setMonth(dataExpiracao.getMonth() + plano.numeroMeses);
    }
    
    if (plano.numeroDias) {
      dataExpiracao.setDate(dataExpiracao.getDate() + plano.numeroDias);
    }

    // Verificar se expirou
    return dataHoje > dataExpiracao;
  }

  /**
   * ✅ ATUALIZADO: Calcula próximo vencimento considerando periodicidade
   */
  calcularProximoVencimento(diaVencimento, dataReferencia, plano) {
    const vencimento = new Date(dataReferencia);
    
    // Para planos mensais
    if (plano.periodicidade === 'MENSAL' || plano.periodicidade === 'MESES') {
      vencimento.setDate(diaVencimento);

      // Se já passou no mês, pular para próximo
      if (vencimento < dataReferencia) {
        vencimento.setMonth(vencimento.getMonth() + 1);
      }
    }
    
    // Para planos anuais recorrentes
    if (plano.periodicidade === 'ANUAL') {
      vencimento.setDate(diaVencimento);
      
      // Se já passou no mês, pular para próximo ano
      if (vencimento < dataReferencia) {
        vencimento.setFullYear(vencimento.getFullYear() + 1);
      }
    }

    // Ajustar para último dia se necessário
    const ultimoDia = new Date(
      vencimento.getFullYear(),
      vencimento.getMonth() + 1,
      0
    ).getDate();

    if (diaVencimento > ultimoDia) {
      vencimento.setDate(ultimoDia);
    }

    return vencimento;
  }
}

module.exports = new GerarCobrancasJob();