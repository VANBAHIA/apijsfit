const caixaRepository = require('../repositories/caixaRepository');
const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

class CaixaService {
  async gerarNumero(empresaId) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const ultimoCaixa = await prisma.caixa.findFirst({
      where: { empresaId },
      orderBy: { numero: 'desc' },
      select: { numero: true }
    });

    if (!ultimoCaixa) return 'CX00001';

    const ultimoNumero = parseInt(ultimoCaixa.numero.replace('CX', ''));
    const proximoNumero = ultimoNumero + 1;

    return `CX${proximoNumero.toString().padStart(5, '0')}`;
  }

  async abrir(data) {
    const { empresaId, valorAbertura, usuarioAbertura, observacoes } = data;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const caixaAberto = await caixaRepository.buscarAberto(empresaId);
    if (caixaAberto) {
      throw new ApiError(400, `Já existe um caixa aberto (${caixaAberto.numero})`);
    }

    if (valorAbertura === undefined || valorAbertura === null || valorAbertura < 0) {
      throw new ApiError(400, 'Valor de abertura inválido');
    }

    if (!usuarioAbertura) {
      throw new ApiError(400, 'Usuário de abertura é obrigatório');
    }

    const numero = await this.gerarNumero(empresaId);
    const agora = new Date();

    return await caixaRepository.criar({
      empresaId,
      numero,
      dataAbertura: agora,
      horaAbertura: agora.toLocaleTimeString('pt-BR'),
      valorAbertura: Number(valorAbertura),
      usuarioAbertura,
      observacoes,
      status: 'ABERTO',
      movimentos: []
    });
  }

  async registrarMovimento(caixaId, movimento, empresaId, tx = null) {
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const {
      tipo,
      valor,
      descricao,
      formaPagamento,
      contaReceberId,
      contaPagarId,
      categoria
    } = movimento;

    const db = tx || prisma;

    const caixa = await db.caixa.findFirst({ where: { id: caixaId, empresaId } });
    if (!caixa) throw new ApiError(404, 'Caixa não encontrado');

    if (caixa.status !== 'ABERTO') {
      throw new ApiError(400, 'Caixa não está aberto');
    }

    if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
      throw new ApiError(400, 'Tipo de movimento inválido (ENTRADA ou SAIDA)');
    }

    if (!valor || valor <= 0) {
      throw new ApiError(400, 'Valor deve ser maior que zero');
    }

    if (!descricao) {
      throw new ApiError(400, 'Descrição é obrigatória');
    }

    const novoMovimento = {
      id: `MOV${Date.now()}`,
      tipo,
      valor: Number(valor),
      descricao: descricao.trim(),
      formaPagamento: formaPagamento || null,
      contaReceberId: contaReceberId || null,
      contaPagarId: contaPagarId || null,
      categoria: categoria || null,
      dataHora: new Date().toISOString()
    };

    const movimentos = [...caixa.movimentos, novoMovimento];

    const totalEntradas = tipo === 'ENTRADA'
      ? caixa.totalEntradas + Number(valor)
      : caixa.totalEntradas;

    const totalSaidas = tipo === 'SAIDA'
      ? caixa.totalSaidas + Number(valor)
      : caixa.totalSaidas;

    return await db.caixa.update({
      where: { id: caixaId },
      data: {
        movimentos,
        totalEntradas,
        totalSaidas
      }
    });
  }

  async fechar(id, data) {
    const { empresaId, valorFechamento, usuarioFechamento, observacoes } = data;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    const caixa = await caixaRepository.buscarPorId(id, empresaId);
    if (!caixa) throw new ApiError(404, 'Caixa não encontrado');

    if (caixa.status === 'FECHADO') {
      throw new ApiError(400, 'Caixa já está fechado');
    }

    if (valorFechamento === undefined || valorFechamento === null || valorFechamento < 0) {
      throw new ApiError(400, 'Valor de fechamento inválido');
    }

    if (!usuarioFechamento) {
      throw new ApiError(400, 'Usuário de fechamento é obrigatório');
    }

    const saldoEsperado = caixa.valorAbertura + caixa.totalEntradas - caixa.totalSaidas;
    const diferenca = Number(valorFechamento) - saldoEsperado;

    const agora = new Date();

    let observacoesFechamento = observacoes || '';
    if (Math.abs(diferenca) > 0.01) {
      const tipoDiferenca = diferenca > 0 ? 'SOBRA' : 'FALTA';
      observacoesFechamento += `\n${tipoDiferenca}: R$ ${Math.abs(diferenca).toFixed(2)}`;
    }

    return await caixaRepository.atualizar(id, {
      empresaId,
      dataFechamento: agora,
      horaFechamento: agora.toLocaleTimeString('pt-BR'),
      valorFechamento: Number(valorFechamento),
      saldoFinal: Number(valorFechamento),
      usuarioFechamento,
      status: 'FECHADO',
      observacoes: `${caixa.observacoes || ''}${observacoesFechamento}`.trim()
    });
  }

  async buscarAberto(empresaId) {
    return await caixaRepository.buscarAberto(empresaId);
  }

  async listarTodos(filtros) {
    if (!filtros.empresaId) throw new ApiError(400, 'empresaId é obrigatório');
    return await caixaRepository.buscarTodos(filtros);
  }

  async buscarPorId(id, empresaId) {
    const caixa = await caixaRepository.buscarPorId(id, empresaId);
    if (!caixa) throw new ApiError(404, 'Caixa não encontrado');
    return caixa;
  }

  async removerMovimento(caixaId, movimentoId, empresaId) {
    const caixa = await caixaRepository.buscarPorId(caixaId, empresaId);
    if (!caixa) throw new ApiError(404, 'Caixa não encontrado');

    if (caixa.status === 'FECHADO') {
      throw new ApiError(400, 'Não é possível remover movimento de caixa fechado');
    }

    const movimento = caixa.movimentos.find(m => m.id === movimentoId);
    if (!movimento) {
      throw new ApiError(404, 'Movimento não encontrado');
    }

    const movimentos = caixa.movimentos.filter(m => m.id !== movimentoId);

    const totalEntradas = movimento.tipo === 'ENTRADA'
      ? caixa.totalEntradas - movimento.valor
      : caixa.totalEntradas;

    const totalSaidas = movimento.tipo === 'SAIDA'
      ? caixa.totalSaidas - movimento.valor
      : caixa.totalSaidas;

    return await caixaRepository.atualizar(caixaId, {
      empresaId,
      movimentos,
      totalEntradas,
      totalSaidas
    });
  }

  async relatorioCaixa(id, empresaId) {
    const caixa = await this.buscarPorId(id, empresaId);

    const entradas = caixa.movimentos.filter(m => m.tipo === 'ENTRADA');
    const saidas = caixa.movimentos.filter(m => m.tipo === 'SAIDA');

    const saidasPorCategoria = saidas.reduce((acc, mov) => {
      const categoria = mov.categoria || 'OUTROS';
      if (!acc[categoria]) {
        acc[categoria] = { total: 0, quantidade: 0, movimentos: [] };
      }
      acc[categoria].total += mov.valor;
      acc[categoria].quantidade++;
      acc[categoria].movimentos.push(mov);
      return acc;
    }, {});

    const entradasPorFormaPagamento = entradas.reduce((acc, mov) => {
      const forma = mov.formaPagamento || 'NÃO INFORMADO';
      if (!acc[forma]) {
        acc[forma] = { total: 0, quantidade: 0 };
      }
      acc[forma].total += mov.valor;
      acc[forma].quantidade++;
      return acc;
    }, {});

    const saldoEsperado = caixa.valorAbertura + caixa.totalEntradas - caixa.totalSaidas;
    const diferenca = caixa.status === 'FECHADO'
      ? caixa.valorFechamento - saldoEsperado
      : 0;

    return {
      caixa: {
        numero: caixa.numero,
        status: caixa.status,
        dataAbertura: caixa.dataAbertura,
        horaAbertura: caixa.horaAbertura,
        dataFechamento: caixa.dataFechamento,
        horaFechamento: caixa.horaFechamento,
        usuarioAbertura: caixa.usuarioAbertura,
        usuarioFechamento: caixa.usuarioFechamento
      },
      valores: {
        valorAbertura: caixa.valorAbertura,
        totalEntradas: caixa.totalEntradas,
        totalSaidas: caixa.totalSaidas,
        saldoEsperado,
        valorFechamento: caixa.valorFechamento,
        diferenca,
        saldoFinal: caixa.saldoFinal
      },
      resumo: {
        totalMovimentos: caixa.movimentos.length,
        quantidadeEntradas: entradas.length,
        quantidadeSaidas: saidas.length
      },
      detalhes: {
        saidasPorCategoria,
        entradasPorFormaPagamento
      },
      movimentos: caixa.movimentos.sort((a, b) =>
        new Date(a.dataHora) - new Date(b.dataHora)
      )
    };
  }

  async sangria(caixaId, data) {
    const { empresaId, valor, descricao, usuarioResponsavel } = data;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    if (!valor || valor <= 0) {
      throw new ApiError(400, 'Valor de sangria deve ser maior que zero');
    }
    if (!usuarioResponsavel) {
      throw new ApiError(400, 'Usuário responsável pela sangria é obrigatório');
    }

    const caixa = await caixaRepository.buscarPorId(caixaId, empresaId);
    if (!caixa) throw new ApiError(404, 'Caixa não encontrado');
    if (caixa.status !== 'ABERTO') {
      throw new ApiError(400, 'Não é possível realizar sangria em caixa fechado');
    }

    const saldoAtual = Number(caixa.valorAbertura) + 
                       Number(caixa.totalEntradas) - 
                       Number(caixa.totalSaidas);

    if (Number(valor) > saldoAtual) {
      throw new ApiError(
        400, 
        `Saldo insuficiente. Saldo disponível: R$ ${saldoAtual.toFixed(2)} - Valor solicitado: R$ ${Number(valor).toFixed(2)}`
      );
    }

    const saldoAposSangria = saldoAtual - Number(valor);
    if (saldoAposSangria < 0) {
      throw new ApiError(
        400, 
        `Operação negada. A sangria deixaria o caixa com saldo negativo de R$ ${Math.abs(saldoAposSangria).toFixed(2)}`
      );
    }

    return await this.registrarMovimento(caixaId, {
      tipo: 'SAIDA',
      valor: Number(valor),
      descricao: `SANGRIA: ${descricao || 'Sem descrição'} - Responsável: ${usuarioResponsavel}`,
      categoria: 'SANGRIA',
      formaPagamento: 'DINHEIRO'
    }, empresaId);
  }

  async suprimento(caixaId, data) {
    const { empresaId, valor, descricao, usuarioResponsavel } = data;
    if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');

    if (!valor || valor <= 0) {
      throw new ApiError(400, 'Valor de suprimento deve ser maior que zero');
    }

    return await this.registrarMovimento(caixaId, {
      tipo: 'ENTRADA',
      valor,
      descricao: `SUPRIMENTO: ${descricao} - Responsável: ${usuarioResponsavel}`,
      categoria: 'SUPRIMENTO',
      formaPagamento: 'SUPRIMENTO'
    }, empresaId);
  }
}

module.exports = new CaixaService();
