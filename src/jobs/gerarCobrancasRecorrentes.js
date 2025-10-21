// src/jobs/gerarCobrancasRecorrentes.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const contaReceberService = require('../services/contaReceberService');

class GerarCobrancasJob {


   async atualizarContasVencidas() {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // Atualiza todas as contas vencidas que ainda não estão marcadas como PAGO ou CANCELADO
      const resultado = await prisma.contaReceber.updateMany({
        where: {
          dataVencimento: { lt: hoje },
          status: { notIn: ['PAGO', 'CANCELADO', 'VENCIDO'] },
        },
        data: {
          status: 'VENCIDO'
        },
      });

      console.log(`📅 [Contas Vencidas] Atualizadas ${resultado.count} contas para status VENCIDO`);
      return resultado.count;
    } catch (error) {
      console.error('❌ Erro ao atualizar contas vencidas:', error);
      throw error;
    }
  }

  /**
   * Executa o job de geração de cobranças
   */
  async executar() {
    try {
      console.log('🚀 Iniciando job de geração de cobranças...');

      // 🆕 Atualizar contas vencidas antes de gerar novas cobranças
      await this.atualizarContasVencidas();

      const dataHoje = new Date();
      dataHoje.setHours(0, 0, 0, 0);

      // Buscar próximos 7 dias
      const dataLimite = new Date(dataHoje);
      dataLimite.setDate(dataLimite.getDate() + 7);

      const matriculas = await this.buscarMatriculasParaGerar(dataHoje, dataLimite);

      console.log(`📋 Encontradas ${matriculas.length} matrículas ativas com planos recorrentes`);

      const resultados = {
        total: matriculas.length,
        geradas: 0,
        jaExistiam: 0,
        erros: 0,
        dataFimAtualizadas: 0,
        detalhes: []
      };

      for (const matricula of matriculas) {
        try {
          const resultado = await this.processarMatricula(matricula, dataHoje);

          if (resultado.gerada) {
            resultados.geradas++;
            if (resultado.dataFimAtualizada) {
              resultados.dataFimAtualizadas++;
            }
          } else {
            resultados.jaExistiam++;
          }

          resultados.detalhes.push({
            matricula: matricula.codigo,
            aluno: matricula.aluno.pessoa.nome1,
            plano: matricula.plano.nome,
            ...resultado
          });

        } catch (error) {
          resultados.erros++;
          console.error(`❌ Erro ao processar matrícula ${matricula.codigo}:`, error);

          resultados.detalhes.push({
            matricula: matricula.codigo,
            erro: error.message
          });
        }
      }

      console.log('✅ Job concluído:', {
        total: resultados.total,
        geradas: resultados.geradas,
        jaExistiam: resultados.jaExistiam,
        erros: resultados.erros,
        dataFimAtualizadas: resultados.dataFimAtualizadas
      });

      return resultados;

    } catch (error) {
      console.error('❌ Erro ao executar job:', error);
      throw error;
    }
  }

  /**
   * ✅ FUNÇÃO AUXILIAR: Adicionar meses de forma segura
   */
  adicionarMesesSeguro(data, meses) {
    const resultado = new Date(data);
    const diaOriginal = resultado.getDate();
    
    // Adiciona os meses
    resultado.setMonth(resultado.getMonth() + meses);
    
    // Se o dia mudou (ex: 31/01 virou 03/03), ajusta para o último dia do mês anterior
    if (resultado.getDate() !== diaOriginal) {
      resultado.setDate(0); // Volta para o último dia do mês anterior
    }
    
    return resultado;
  }

  /**
   * Busca matrículas ativas com planos recorrentes
   */
  async buscarMatriculasParaGerar(dataHoje, dataLimite) {
    return await prisma.matricula.findMany({
      where: {
        situacao: 'ATIVA',
        diaVencimento: { not: null },
        plano: { tipoCobranca: 'RECORRENTE' },
      },
      include: {
        aluno: {
          include: {
            pessoa: { select: { nome1: true, doc1: true } }
          }
        },
        plano: true,
        desconto: true,
      },
    });
  }

  /**
   * ✅ NOVA FUNÇÃO: Atualiza a dataFim da matrícula adicionando 1 mês
   */
  async atualizarDataFimMatricula(matriculaId, dataFimAtual) {
    try {
      const novaDataFim = this.adicionarMesesSeguro(dataFimAtual, 1);
      
      await prisma.matricula.update({
        where: { id: matriculaId },
        data: { dataFim: novaDataFim }
      });

      console.log(`📅 Data fim atualizada - Matrícula ${matriculaId}:`, {
        dataFimAnterior: dataFimAtual.toLocaleDateString('pt-BR'),
        novaDataFim: novaDataFim.toLocaleDateString('pt-BR')
      });

      return novaDataFim;
    } catch (error) {
      console.error(`❌ Erro ao atualizar dataFim da matrícula ${matriculaId}:`, error);
      throw error;
    }
  }

  /**
   * Processa uma matrícula e gera cobrança se necessário
   */
  async processarMatricula(matricula, dataHoje) {
    const { plano } = matricula;

    // ✅ VERIFICAR TIPO DE COBRANÇA
    if (plano.tipoCobranca === 'UNICA') {
      return {
        gerada: false,
        motivo: 'Plano com cobrança única - Não gera recorrência'
      };
    }

    // 🆕 NOVA VALIDAÇÃO: Não gerar se o mês/ano for anterior ao início
    const dataInicio = new Date(matricula.dataInicio);
    const mesAnoInicio = dataInicio.getFullYear() * 12 + dataInicio.getMonth();
    const mesAnoHoje = dataHoje.getFullYear() * 12 + dataHoje.getMonth();

    if (mesAnoHoje < mesAnoInicio) {
      return {
        gerada: false,
        motivo: 'Mês anterior ao início da matrícula'
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

    // ✅ Verificar se já existe cobrança para ESTA MATRÍCULA
    const cobrancaExistente = await this.verificarCobrancaExistente(
      matricula.id,
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

    // ✅ Criar nova cobrança vinculada à matrícula
    const novaConta = await contaReceberService.criar({
      empresaId: matricula.empresaId,
      matriculaId: matricula.id,
      alunoId: matricula.alunoId,
      planoId: matricula.planoId,
      descontoId: matricula.descontoId,
      dataVencimento: proximoVencimento,
      observacoes: `Cobrança automática - Matrícula: ${matricula.codigo} - Ref: ${mesReferencia}`
    });

    // 🆕 ATUALIZAR DATA FIM DA MATRÍCULA (+1 MÊS)
    let novaDataFim = null;
    try {
      novaDataFim = await this.atualizarDataFimMatricula(
        matricula.id, 
        matricula.dataFim
      );
      console.log(`✅ Cobrança gerada e dataFim atualizada - Matrícula: ${matricula.codigo}`);
    } catch (error) {
      console.error(`⚠️ Cobrança gerada mas falhou ao atualizar dataFim:`, error);
      // Não interrompe o fluxo, a cobrança já foi criada
    }

    return {
      gerada: true,
      numero: novaConta.numero,
      vencimento: proximoVencimento,
      dataFimAtualizada: novaDataFim ? novaDataFim.toLocaleDateString('pt-BR') : 'Erro ao atualizar'
    };
  }

  /**
   * Verifica se plano já expirou
   */
  planoExpirou(matricula, dataHoje) {
    const { plano, dataInicio } = matricula;

    // Planos recorrentes sem limite de tempo NUNCA expiram
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
   * Calcula próximo vencimento considerando periodicidade
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

  
  formatarMesReferencia(data) {
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${mes}/${ano}`;
  }


  async verificarCobrancaExistente(matriculaId, alunoId, planoId, mesReferencia) {
    return await prisma.contaReceber.findFirst({
      where: {
        matriculaId,  // ✅ Verificar por matrícula específica
        alunoId,
        planoId,
        observacoes: {
          contains: `Ref: ${mesReferencia}`
        },
        status: {
          not: 'CANCELADO'
        }
      }
    });
  }


}

module.exports = new GerarCobrancasJob();