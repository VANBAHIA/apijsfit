const matriculaRepository = require('../repositories/matriculaRepository');
const alunoRepository = require('../repositories/alunoRepository');
const planoRepository = require('../repositories/planoRepository');
const turmaRepository = require('../repositories/turmaRepository');
const descontoRepository = require('../repositories/descontoRepository');
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

    if (plano.periodicidade === 'MESES') {
      data.setMonth(data.getMonth() + plano.numeroMeses);
    } else if (plano.periodicidade === 'DIAS') {
      data.setDate(data.getDate() + plano.numeroDias);
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

    // Verificar turma (se fornecida)
    if (data.turmaId) {
      const turma = await turmaRepository.buscarPorId(data.turmaId);
      if (!turma) throw new ApiError(404, 'Turma não encontrada');
    }

    // Gerar código
    const codigo = await this.gerarProximoCodigo();

    // Calcular data fim
    const dataFim = this.calcularDataFim(data.dataInicio, plano);

    // Calcular valores
    const valores = await this.calcularValores(data.planoId, data.descontoId);

    // Dia de vencimento (para planos mensais)
    let diaVencimento = null;
    if (plano.periodicidade === 'MESES') {
      diaVencimento = data.diaVencimento || new Date(data.dataInicio).getDate();
    }

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

    return await matriculaRepository.criar(dadosMatricula);
  }

  async listarTodos(filtros) {
    return await matriculaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const matricula = await matriculaRepository.buscarPorId(id);
    if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');
    return matricula;
  }

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

  async inativar(id, motivo) {
    return await matriculaRepository.atualizar(id, {
      situacao: 'INATIVA',
      motivoInativacao: motivo
    });
  }

  async reativar(id) {
    return await matriculaRepository.atualizar(id, {
      situacao: 'ATIVA',
      motivoInativacao: null
    });
  }

  async deletar(id) {
    const matricula = await matriculaRepository.buscarPorId(id);
    if (!matricula) throw new ApiError(404, 'Matrícula não encontrada');
    return await matriculaRepository.deletar(id);
  }
}

module.exports = new MatriculaService();