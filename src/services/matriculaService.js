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

class MatriculaService {
  /**
   * Gera próximo código de matrícula
   */
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

  /**
   * ✅ ATUALIZADO: Criar matrícula com geração automática de cobrança
   */
  async criar(data) {
    // Validações
    if (!data.alunoId) throw new ApiError(400, 'Aluno é obrigatório');
    if (!data.planoId) throw new ApiError(400, 'Plano é obrigatório');
    if (!data.dataInicio) throw new ApiError(400, 'Data de início é obrigatória');

    // Verificar se aluno existe
    const aluno = await alunoRepository.buscarPorId(data.alunoId);
    if (!aluno) throw new ApiError(404, 'Aluno não encontrado');

    // Verificar se plano existe
    const plano = await planoRepository.buscarPorId(data.planoId);
    if (!plano) throw new ApiError(404, 'Plano não encontrado');
    if (plano.status !== 'ATIVO') {
      throw new ApiError(400, 'Plano inativo - não é possível criar matrícula');
    }

    // Verificar turma (se fornecida)
    if (data.turmaId) {
      const turma = await turmaRepository.buscarPorId(data.turmaId);
      if (!turma) throw new ApiError(404, 'Turma não encontrada');
    }

    // Verificar desconto (se fornecido)
    if (data.descontoId) {
      const desconto = await descontoRepository.buscarPorId(data.descontoId);
      if (!desconto) throw new ApiError(404, 'Desconto não encontrado');
      if (desconto.status !== 'ATIVO') {
        throw new ApiError(400, 'Desconto inativo - não pode ser aplicado');
      }
    }

    try {
      // ✅ TRANSAÇÃO: Criar matrícula + primeira cobrança atomicamente
      const resultado = await prisma.$transaction(async (tx) => {

        // 1️⃣ Gerar código da matrícula
        const codigo = await this.gerarProximoCodigo();

        // 2️⃣ Calcular data fim
        const dataFim = this.calcularDataFim(data.dataInicio, plano);

        // 3️⃣ Calcular valores
        const valores = await this.calcularValores(data.planoId, data.descontoId);

        // 4️⃣ Definir dia de vencimento
        let diaVencimento = null;
        if (plano.tipoCobranca === 'RECORRENTE') {
          diaVencimento = data.diaVencimento || new Date(data.dataInicio).getDate();
        }

        // 5️⃣ Criar matrícula
        const dadosMatricula = {
          codigo,
          alunoId: data.alunoId,
          planoId: data.planoId,
          turmaId: data.turmaId || null,
          descontoId: data.descontoId || null,
          dataInicio: new Date(data.dataInicio),
          dataFim,
          diaVencimento,
          ...valores,
          situacao: data.situacao || 'ATIVA',
          formaPagamento: data.formaPagamento || null,
          parcelamento: data.parcelamento || 1,
          observacoes: data.observacoes || null
        };

        const matricula = await tx.matricula.create({
          data: dadosMatricula,
          include: {
            aluno: { include: { pessoa: true } },
            plano: true,
            turma: true,
            desconto: true
          }
        });

        console.log(`✅ [MATRÍCULA] Criada: ${matricula.codigo}`);

        // 6️⃣ Gerar primeira cobrança automaticamente
        const primeiraCobranca = await this.gerarPrimeiraCobranca(
          matricula,
          plano,
          data.dataInicio,
          diaVencimento,
          data.descontoId
        );

        return {
          matricula,
          primeiraCobranca
        };
      });

      console.log('✅ [MATRÍCULA] Transação concluída com sucesso!');

      return resultado;

    } catch (error) {
      console.error('❌ [MATRÍCULA] Erro na transação:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar matrícula: ${error.message}`);
    }
  }

  /**
   * Listar todas as matrículas
   */
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