const matriculaRepository = require('../repositories/matriculaRepository');
const alunoRepository = require('../repositories/alunoRepository');
const planoRepository = require('../repositories/planoRepository');
const turmaRepository = require('../repositories/turmaRepository');
const descontoRepository = require('../repositories/descontoRepository');
const contaReceberService = require('./contaReceberService');
// ✅ Certifique-se que está assim:
const contaReceberRepository = require('../repositories/contaReceberRepository');
const ApiError = require('../utils/apiError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function adicionarMesesSeguro(data, meses) {
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

class MatriculaService {

  async criar(data) {
    return await prisma.$transaction(async (tx) => {
      try {
        // 🔹 1. Validação básica
        if (!data.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
        if (!data.alunoId) throw new ApiError(400, 'alunoId é obrigatório');
        if (!data.planoId) throw new ApiError(400, 'planoId é obrigatório');

        // 🔹 2. Busca entidades relacionadas
        const aluno = await alunoRepository.buscarPorId(data.alunoId, data.empresaId);
        if (!aluno) throw new ApiError(404, 'Aluno não encontrado');

        const plano = await planoRepository.buscarPorId(data.planoId, data.empresaId);
        if (!plano) throw new ApiError(404, 'Plano não encontrado');

        let turma = null;
        if (data.turmaId) {
          turma = await turmaRepository.buscarPorId(data.turmaId, data.empresaId);
          if (!turma) throw new ApiError(404, 'Turma não encontrada');
        }

        let desconto = null;
        if (data.descontoId) {
          desconto = await descontoRepository.buscarPorId(data.descontoId, data.empresaId);
          if (!desconto) throw new ApiError(404, 'Desconto não encontrado');
        }

        // 🔹 3. Geração automática do código da matrícula
        const ultimaMatricula = await tx.matricula.findFirst({
          where: { empresaId: data.empresaId },
          orderBy: { createdAt: 'desc' },
        });

        let codigoGerado = 'M00001';
        if (ultimaMatricula?.codigo) {
          const numero = parseInt(ultimaMatricula.codigo.replace('M', '')) + 1;
          codigoGerado = 'M' + numero.toString().padStart(5, '0');
        }

        // 🔹 4. Cálculo da data de início e fim (COM FUNÇÃO SEGURA)
        const dataInicio = new Date(data.dataInicio);
        let dataFim;

        // ✅ MODIFICAÇÃO: Planos RECORRENTES com cálculo seguro de meses
        if (plano.tipoCobranca === 'RECORRENTE') {
          dataFim = adicionarMesesSeguro(dataInicio, 1);
          console.log('📅 Plano RECORRENTE:', {
            dataInicio: dataInicio.toLocaleDateString('pt-BR'),
            dataFim: dataFim.toLocaleDateString('pt-BR')
          });
        }
        // Planos com meses definidos
        else if (plano.numeroMeses && plano.numeroMeses > 0) {
          dataFim = adicionarMesesSeguro(dataInicio, plano.numeroMeses);
          console.log(`📅 Plano com ${plano.numeroMeses} meses:`, {
            dataInicio: dataInicio.toLocaleDateString('pt-BR'),
            dataFim: dataFim.toLocaleDateString('pt-BR')
          });
        }
        // Planos com dias definidos
        else if (plano.numeroDias && plano.numeroDias > 0) {
          dataFim = new Date(dataInicio);
          dataFim.setDate(dataFim.getDate() + plano.numeroDias);
          console.log(`📅 Plano com ${plano.numeroDias} dias:`, {
            dataInicio: dataInicio.toLocaleDateString('pt-BR'),
            dataFim: dataFim.toLocaleDateString('pt-BR')
          });
        }
        // Fallback: se não tem nenhuma informação, usa 1 mês
        else {
          dataFim = adicionarMesesSeguro(dataInicio, 1);
          console.log('⚠️ Plano sem duração definida - Usando 1 mês como padrão');
        }

        // 🔹 5. Montagem do objeto para criação
        const novaMatricula = {
          codigo: codigoGerado,
          empresaId: data.empresaId,
          alunoId: data.alunoId,
          planoId: data.planoId,
          turmaId: data.turmaId || null,
          descontoId: data.descontoId || null,
          dataInicio,
          dataFim,
          diaVencimento: data.diaVencimento || 5,
          valorMatricula: data.valorMatricula || plano.valorMensalidade,
          valorDesconto: data.valorDesconto || 0,
          valorFinal:
            data.valorFinal || (plano.valorMensalidade - (data.valorDesconto || 0)),
          situacao: data.situacao || 'ATIVA',
          formaPagamento: data.formaPagamento || 'DINHEIRO',
          parcelamento: data.parcelamento || 1,
          observacoes: data.observacoes || null,
        };

        console.log('✅ Nova matrícula preparada:', {
          codigo: novaMatricula.codigo,
          dataInicio: novaMatricula.dataInicio.toLocaleDateString('pt-BR'),
          dataFim: novaMatricula.dataFim.toLocaleDateString('pt-BR'),
          tipoCobranca: plano.tipoCobranca
        });

        const matricula = await tx.matricula.create({
          data: novaMatricula,
          include: {
            aluno: { include: { pessoa: true } },
            plano: true,
            turma: true,
            desconto: true,
          },
        });

        // 🔹 7. Gera automaticamente a primeira cobrança
        const primeiraCobranca = await this.gerarPrimeiraCobranca(
          matricula,
          plano,
          dataInicio,
          data.diaVencimento,
          data.descontoId
        );

        console.log('✅ Matrícula criada com sucesso:', matricula.codigo);

        // 🔹 8. Retorna matrícula + primeira cobrança
        return { matricula, primeiraCobranca };

      } catch (error) {
        console.error('❌ [MATRÍCULA] Erro na transação:', error);
        throw new ApiError(500, `Erro ao criar matrícula: ${error.message}`);
      }
    });
  }

  async gerarProximoCodigo() {
    const ultima = await prisma.matricula.findFirst({
      orderBy: { codigo: 'desc' },
      select: { codigo: true }
    });

    if (!ultima || !ultima.codigo) {
      return 'M00001';
    }

    const ultimoNumero = parseInt(ultima.codigo.replace('M', ''));
    const proximoNumero = ultimoNumero + 1;
    return `M${proximoNumero.toString().padStart(5, '0')}`;
  }

  /**
   * Calcula data fim baseada no plano
   */
  calcularDataFim(dataInicio, plano) {
    const data = new Date(dataInicio);

    switch (plano.periodicidade) {
      case 'MENSAL':
        data.setMonth(data.getMonth() + 1);
        break;

      case 'BIMESTRAL':
        data.setMonth(data.getMonth() + 2);
        break;

      case 'TRIMESTRAL':
        data.setMonth(data.getMonth() + 3);
        break;

      case 'QUADRIMESTRAL':
        data.setMonth(data.getMonth() + 4);
        break;

      case 'SEMESTRAL':
        data.setMonth(data.getMonth() + 6);
        break;

      case 'ANUAL':
        data.setFullYear(data.getFullYear() + 1);
        break;

      case 'MESES':
        if (plano.numeroMeses) {
          data.setMonth(data.getMonth() + plano.numeroMeses);
        }
        break;

      case 'DIAS':
        if (plano.numeroDias) {
          data.setDate(data.getDate() + plano.numeroDias);
        }
        break;

      default:
        // Se não especificado, assume 1 mês
        data.setMonth(data.getMonth() + 1);
    }

    return data;
  }

  /**
   * Calcula valores com desconto
   */
  async calcularValores(planoId, descontoId) {
    const plano = await planoRepository.buscarPorId(planoId);
    let valorMatricula = plano.valorMensalidade;
    let valorDesconto = 0;

    if (descontoId) {
      const desconto = await descontoRepository.buscarPorId(descontoId);

      if (desconto.status === 'ATIVO') {
        if (desconto.tipo === 'PERCENTUAL') {
          valorDesconto = (valorMatricula * desconto.valor) / 100;
        } else {
          valorDesconto = desconto.valor;
        }
      }
    }

    return {
      valorMatricula,
      valorDesconto,
      valorFinal: valorMatricula - valorDesconto
    };
  }

  /**
   * ✅ NOVA FUNÇÃO: Calcula data de vencimento da primeira parcela
   */
  calcularPrimeiroVencimento(dataInicio, diaVencimento, plano) {
    const vencimento = new Date(dataInicio);

    // Se dia de vencimento foi especificado
    if (diaVencimento) {
      vencimento.setDate(diaVencimento);

      // Se o dia já passou no mês de início, vence no próximo mês
      if (vencimento < dataInicio) {
        vencimento.setMonth(vencimento.getMonth() + 1);
      }
    } else {
      // Se não especificou dia, vence no mesmo dia da matrícula
      // (ou em X dias, conforme regra de negócio)
      vencimento.setDate(vencimento.getDate() + 5); // Exemplo: 5 dias após matrícula
    }

    // Ajustar para último dia do mês se necessário
    const ultimoDia = new Date(
      vencimento.getFullYear(),
      vencimento.getMonth() + 1,
      0
    ).getDate();

    if (diaVencimento && diaVencimento > ultimoDia) {
      vencimento.setDate(ultimoDia);
    }

    return vencimento;
  }

  /**
   * ✅ NOVA FUNÇÃO: Gera primeira cobrança automaticamente
   */
  async gerarPrimeiraCobranca(matricula, plano, dataInicio, diaVencimento, descontoId) {
    try {
      // Calcular data de vencimento
      const dataVencimento = this.calcularPrimeiroVencimento(
        dataInicio,
        diaVencimento,
        plano
      );

      // Determinar observação baseada no tipo de cobrança
      let observacao;
      if (plano.tipoCobranca === 'UNICA') {
        observacao = `Pagamento único - Plano: ${plano.nome} - Matrícula: ${matricula.codigo}`;
      } else {
        const mesRef = this.formatarMesReferencia(dataVencimento);
        observacao = `1ª Parcela - Plano: ${plano.nome} - Matrícula: ${matricula.codigo} - Ref: ${mesRef}`;
      }

      // Criar conta a receber
      const contaReceber = await contaReceberService.criar({
        empresaId: matricula.empresaId,
        alunoId: matricula.alunoId,
        planoId: matricula.planoId,
        descontoId: descontoId || null,
        dataVencimento,
        observacoes: observacao,
        numeroParcela: 1,
        totalParcelas: plano.tipoCobranca === 'UNICA' ? 1 : null
      });

      console.log(`✅ [MATRÍCULA] Primeira cobrança gerada automaticamente: ${contaReceber.numero}`);

      return contaReceber;
    } catch (error) {
      console.error('❌ [MATRÍCULA] Erro ao gerar primeira cobrança:', error);
      throw new ApiError(500, `Erro ao gerar primeira cobrança: ${error.message}`);
    }
  }

  /**
   * Formata mês de referência (YYYY-MM)
   */
  formatarMesReferencia(data) {
    const ano = data.getFullYear();
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    return `${ano}-${mes}`;
  }



  async listarTodos(filtros) {
    return await matriculaRepository.buscarTodos(filtros);
  }

  /**
   * Buscar matrícula por ID
   */
  async buscarPorId(id) {
    const matricula = await matriculaRepository.buscarPorId(id);
    if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');
    return matricula;
  }

  /**
   * Atualizar matrícula
   */
  async atualizar(id, data) {
    const matricula = await matriculaRepository.buscarPorId(id);
    if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');

    // Recalcular valores se plano ou desconto mudaram
    if (data.planoId || data.descontoId) {
      const valores = await this.calcularValores(
        data.planoId || matricula.planoId,
        data.descontoId || matricula.descontoId
      );
      Object.assign(data, valores);
    }

    // Recalcular data fim se data início ou plano mudaram
    if (data.dataInicio || data.planoId) {
      const plano = data.planoId
        ? await planoRepository.buscarPorId(data.planoId)
        : await planoRepository.buscarPorId(matricula.planoId);

      data.dataFim = this.calcularDataFim(
        data.dataInicio || matricula.dataInicio,
        plano
      );
    }

    return await matriculaRepository.atualizar(id, data);
  }

  /**
   * Inativar matrícula
   */
  async inativar(id, motivo) {
    return await matriculaRepository.atualizar(id, {
      situacao: 'INATIVA',
      motivoInativacao: motivo
    });
  }

  /**
   * Reativar matrícula
   */
  async reativar(id) {
    return await matriculaRepository.atualizar(id, {
      situacao: 'ATIVA',
      motivoInativacao: null
    });
  }

  /**
   * Deletar matrícula
   */
  async deletar(id) {
    const matricula = await matriculaRepository.buscarPorId(id);
    if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');

    // ✅ NOVA VERIFICAÇÃO
    const contasReceber = await contaReceberRepository.buscarPorMatriculaId(matricula.alunoId);

    // Filtrar apenas as contas desta matrícula (via planoId se necessário)
    const contasMatricula = contasReceber.filter(
      conta => conta.planoId === matricula.planoId
    );

    // Verificar se há faturas PAGAS
    const temPagamento = contasMatricula.some(conta =>
      conta.status === 'PAGO' ||
      (conta.status === 'PENDENTE' && conta.valorPago > 0)
    );

    if (temPagamento) {
      throw new ApiError(
        400,
        'Não é possível deletar matrícula com faturas pagas ou com pagamentos parciais. Para Exlusão é necessário o cancelamento da fatura e do respectivo Pagamento em "Financeiro/Contas a Receber".'
      );
    }

    // ✅ TRANSAÇÃO: Deletar matrícula E suas faturas
    try {
      await prisma.$transaction(async (tx) => {
        // 1️⃣ Deletar todas as contas a receber desta matrícula
        await tx.contaReceber.deleteMany({
          where: {
            alunoId: matricula.alunoId,
            planoId: matricula.planoId,
            status: { not: 'PAGO' } // Proteção adicional
          }
        });

        console.log(`✅ Faturas deletadas para matrícula ${matricula.codigo}`);

        // 2️⃣ Deletar a matrícula
        await tx.matricula.delete({
          where: { id }
        });

        console.log(`✅ Matrícula deletada: ${matricula.codigo}`);
      });

      return { mensagem: 'Matrícula e suas faturas deletadas com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao deletar matrícula:', error);
      throw new ApiError(500, `Erro ao deletar matrícula: ${error.message}`);
    }
  }
}

module.exports = new MatriculaService();