// src/services/avaliacaoFisicaService.js
const avaliacaoFisicaRepository = require('../repositories/avaliacaoFisicaRepository');
const alunoRepository = require('../repositories/alunoRepository');
const ApiError = require('../utils/apiError');

class AvaliacaoFisicaService {

  /**
   * Gera o próximo código sequencial
   */
  async gerarProximoCodigo(empresaId) {
    const ultimaAvaliacao = await avaliacaoFisicaRepository.buscarUltimaCodigo(empresaId);

    if (!ultimaAvaliacao || !ultimaAvaliacao.codigo) {
      return 'AV00001';
    }

    const ultimoNumero = parseInt(ultimaAvaliacao.codigo.replace('AV', ''));
    const proximoNumero = ultimoNumero + 1;

    return `AV${proximoNumero.toString().padStart(5, '0')}`;
  }

  /**
   * Calcula IMC (Índice de Massa Corporal)
   */
  calcularIMC(peso, altura) {
    // IMC = peso (kg) / (altura (m))²
    const alturaMetros = altura / 100;
    return peso / (alturaMetros * alturaMetros);
  }

  /**
   * Classifica IMC segundo padrões OMS
   */
  classificarIMC(imc) {
    if (imc < 18.5) return 'ABAIXO_DO_PESO';
    if (imc < 25) return 'NORMAL';
    if (imc < 30) return 'SOBREPESO';
    if (imc < 35) return 'OBESIDADE_I';
    if (imc < 40) return 'OBESIDADE_II';
    return 'OBESIDADE_III';
  }

  /**
   * Calcula percentual de gordura (Protocolo de 7 dobras - Jackson & Pollock)
   */
  calcularPercentualGordura(dados, sexo, idade) {
    const {
      dobrasSubescapular,
      dobrasTricipital,
      dobrasToracica,
      dobrasAxilarMedia,
      dobrasSuprailiaca,
      dobrasAbdominal,
      dobrasCoxa
    } = dados;

    // Verificar se tem todas as dobras necessárias
    const dobras = [
      dobrasSubescapular,
      dobrasTricipital,
      dobrasToracica,
      dobrasAxilarMedia,
      dobrasSuprailiaca,
      dobrasAbdominal,
      dobrasCoxa
    ];

    if (dobras.some(d => d === null || d === undefined)) {
      return null; // Não é possível calcular sem todas as dobras
    }

    const somaDobras = dobras.reduce((acc, val) => acc + val, 0);

    let densidadeCorporal;

    if (sexo === 'MASCULINO') {
      densidadeCorporal = 1.112 -
        (0.00043499 * somaDobras) +
        (0.00000055 * Math.pow(somaDobras, 2)) -
        (0.00028826 * idade);
    } else { // FEMININO
      densidadeCorporal = 1.097 -
        (0.00046971 * somaDobras) +
        (0.00000056 * Math.pow(somaDobras, 2)) -
        (0.00012828 * idade);
    }

    // Fórmula de Siri para percentual de gordura
    const percentualGordura = ((4.95 / densidadeCorporal) - 4.5) * 100;

    return percentualGordura;
  }

  /**
   * Classifica percentual de gordura
   */
  classificarGordura(percentual, sexo, idade) {
    // Classificação segundo ACSM (American College of Sports Medicine)
    const tabelaMasculino = {
      20: { baixo: 8, normal: 19, alto: 25 },
      30: { baixo: 11, normal: 21, alto: 26 },
      40: { baixo: 13, normal: 22, alto: 27 },
      50: { baixo: 15, normal: 23, alto: 28 },
      60: { baixo: 16, normal: 24, alto: 29 }
    };

    const tabelaFeminino = {
      20: { baixo: 21, normal: 33, alto: 39 },
      30: { baixo: 23, normal: 34, alto: 40 },
      40: { baixo: 24, normal: 35, alto: 41 },
      50: { baixo: 26, normal: 36, alto: 42 },
      60: { baixo: 27, normal: 37, alto: 43 }
    };

    const tabela = sexo === 'MASCULINO' ? tabelaMasculino : tabelaFeminino;

    // Determinar faixa etária
    let faixaEtaria = 20;
    if (idade >= 60) faixaEtaria = 60;
    else if (idade >= 50) faixaEtaria = 50;
    else if (idade >= 40) faixaEtaria = 40;
    else if (idade >= 30) faixaEtaria = 30;

    const limites = tabela[faixaEtaria];

    if (percentual < limites.baixo) return 'MUITO_BAIXO';
    if (percentual < limites.normal) return 'NORMAL';
    if (percentual < limites.alto) return 'ALTO';
    return 'MUITO_ALTO';
  }

  /**
   * Calcula massa magra e massa gorda
   */
  calcularComposicaoCorporal(peso, percentualGordura) {
    const massaGorda = (peso * percentualGordura) / 100;
    const massaMagra = peso - massaGorda;

    return { massaMagra, massaGorda };
  }

  /**
   * Calcula peso ideal baseado no IMC
   */
  calcularPesoIdeal(altura) {
    // Usando IMC = 22 (centro da faixa normal)
    const alturaMetros = altura / 100;
    return 22 * (alturaMetros * alturaMetros);
  }

  /**
   * Criar nova avaliação física
   */
  async criar(dados, alunoId, empresaId) {
    const { peso, altura, dataAvaliacao } = dados;

    // Validações
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    if (!alunoId) {
      throw new ApiError(400, 'alunoId é obrigatório');
    }

    if (!peso || peso <= 0) {
      throw new ApiError(400, 'Peso deve ser maior que zero');
    }

    if (!altura || altura <= 0) {
      throw new ApiError(400, 'Altura deve ser maior que zero');
    }

    if (!dataAvaliacao) {
      throw new ApiError(400, 'Data da avaliação é obrigatória');
    }

    try {
      // Verificar se aluno existe
      const aluno = await alunoRepository.buscarPorId(alunoId, empresaId);
      if (!aluno) {
        throw new ApiError(404, 'Aluno não encontrado');
      }

      // Calcular idade do aluno
      const dataNascimento = aluno.pessoa.dtNsc;
      const idade = dataNascimento
        ? Math.floor((new Date() - new Date(dataNascimento)) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      // Gerar código
      const codigo = await this.gerarProximoCodigo(empresaId);

      // Calcular IMC
      const imc = this.calcularIMC(peso, altura);
      const classificacaoIMC = this.classificarIMC(imc);

      // Calcular percentual de gordura (se tiver dobras cutâneas)
      let percentualGordura = null;
      let classificacaoGordura = null;
      let massaMagra = null;
      let massaGorda = null;

      if (aluno.pessoa.sexo && idade && dados.dobrasSubescapular) {
        percentualGordura = this.calcularPercentualGordura(dados, aluno.pessoa.sexo, idade);

        if (percentualGordura) {
          classificacaoGordura = this.classificarGordura(percentualGordura, aluno.pessoa.sexo, idade);
          const composicao = this.calcularComposicaoCorporal(peso, percentualGordura);
          massaMagra = composicao.massaMagra;
          massaGorda = composicao.massaGorda;
        }
      }

      // Calcular peso ideal
      const pesoIdeal = this.calcularPesoIdeal(altura);

      // Preparar dados para criação
      const dadosAvaliacao = {
        codigo,
        empresaId,
        alunoId,
        dataAvaliacao: new Date(dataAvaliacao),
        peso: Number(peso),
        altura: Number(altura),
        imc,
        classificacaoIMC,
        percentualGordura,
        classificacaoGordura,
        massaMagra,
        massaGorda,
        pesoIdeal,

        // Próxima avaliação (sugestão: 90 dias)
        proximaAvaliacao: dados.proximaAvaliacao
          ? new Date(dados.proximaAvaliacao)
          : new Date(new Date(dataAvaliacao).setDate(new Date(dataAvaliacao).getDate() + 90)),

        // Medidas opcionais
        envergadura: dados.envergadura ? Number(dados.envergadura) : null,

        // Circunferências
        pescoco: dados.pescoco ? Number(dados.pescoco) : null,
        ombro: dados.ombro ? Number(dados.ombro) : null,
        torax: dados.torax ? Number(dados.torax) : null,
        cintura: dados.cintura ? Number(dados.cintura) : null,
        abdomen: dados.abdomen ? Number(dados.abdomen) : null,
        quadril: dados.quadril ? Number(dados.quadril) : null,
        bracoDireito: dados.bracoDireito ? Number(dados.bracoDireito) : null,
        bracoEsquerdo: dados.bracoEsquerdo ? Number(dados.bracoEsquerdo) : null,
        antebracoDireito: dados.antebracoDireito ? Number(dados.antebracoDireito) : null,
        antebracoEsquerdo: dados.antebracoEsquerdo ? Number(dados.antebracoEsquerdo) : null,
        coxaDireita: dados.coxaDireita ? Number(dados.coxaDireita) : null,
        coxaEsquerda: dados.coxaEsquerda ? Number(dados.coxaEsquerda) : null,
        panturrilhaDireita: dados.panturrilhaDireita ? Number(dados.panturrilhaDireita) : null,
        panturrilhaEsquerda: dados.panturrilhaEsquerda ? Number(dados.panturrilhaEsquerda) : null,

        // Dobras cutâneas
        dobrasSubescapular: dados.dobrasSubescapular ? Number(dados.dobrasSubescapular) : null,
        dobrasTricipital: dados.dobrasTricipital ? Number(dados.dobrasTricipital) : null,
        dobrasBicipital: dados.dobrasBicipital ? Number(dados.dobrasBicipital) : null,
        dobrasToracica: dados.dobrasToracica ? Number(dados.dobrasToracica) : null,
        dobrasAxilarMedia: dados.dobrasAxilarMedia ? Number(dados.dobrasAxilarMedia) : null,
        dobrasSuprailiaca: dados.dobrasSuprailiaca ? Number(dados.dobrasSuprailiaca) : null,
        dobrasAbdominal: dados.dobrasAbdominal ? Number(dados.dobrasAbdominal) : null,
        dobrasCoxa: dados.dobrasCoxa ? Number(dados.dobrasCoxa) : null,
        dobrasPanturrilha: dados.dobrasPanturrilha ? Number(dados.dobrasPanturrilha) : null,

        // Pressão e frequência
        pressaoSistolica: dados.pressaoSistolica ? Number(dados.pressaoSistolica) : null,
        pressaoDiastolica: dados.pressaoDiastolica ? Number(dados.pressaoDiastolica) : null,
        frequenciaRepouso: dados.frequenciaRepouso ? Number(dados.frequenciaRepouso) : null,

        // Testes físicos
        flexibilidade: dados.flexibilidade || null,
        forcaAbdominal: dados.forcaAbdominal ? Number(dados.forcaAbdominal) : null,
        forcaBracos: dados.forcaBracos ? Number(dados.forcaBracos) : null,

        // Avaliador
        avaliadorId: dados.avaliadorId || null,
        avaliadorNome: dados.avaliadorNome || null,

        // Observações
        objetivos: dados.objetivos || null,
        observacoes: dados.observacoes || null,
        restricoes: dados.restricoes || null,

        status: 'ATIVA'
      };

      const avaliacao = await avaliacaoFisicaRepository.criar(dadosAvaliacao);

      console.log('✅ Avaliação física criada:', avaliacao.codigo);
      return avaliacao;

    } catch (error) {
      console.error('❌ Erro ao criar avaliação física:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(500, `Erro ao criar avaliação física: ${error.message}`);
    }
  }

  /**
   * Listar todas as avaliações
   */
  async listarTodos(filtros = {}) {
    const { empresaId } = filtros;

    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      return await avaliacaoFisicaRepository.buscarTodos(filtros);
    } catch (error) {
      console.error('❌ Erro ao listar avaliações:', error);
      throw new ApiError(500, `Erro ao listar avaliações: ${error.message}`);
    }
  }

  /**
   * Buscar avaliação por ID
   */
  async buscarPorId(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const avaliacao = await avaliacaoFisicaRepository.buscarPorId(id, empresaId);

      if (!avaliacao) {
        throw new ApiError(404, 'Avaliação física não encontrada');
      }

      return avaliacao;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar avaliação: ${error.message}`);
    }
  }

  /**
   * Buscar histórico de avaliações de um aluno
   */
  async buscarPorAluno(alunoId, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const aluno = await alunoRepository.buscarPorId(alunoId, empresaId);
      if (!aluno) {
        throw new ApiError(404, 'Aluno não encontrado');
      }

      return await avaliacaoFisicaRepository.buscarPorAluno(alunoId, empresaId);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar histórico: ${error.message}`);
    }
  }

  /**
   * Atualizar avaliação
   */
  async atualizar(id, dados, empresaId) {

    // 🔄 Mapear campos vindos do front com nomes incorretos
    const mapaCampos = {
      circunferenciaTorax: 'torax',
      circunferenciaCintura: 'cintura',
      circunferenciaQuadril: 'quadril',
      circunferenciaBracoDireito: 'bracoDireito',
      circunferenciaBracoEsquerdo: 'bracoEsquerdo',
      circunferenciaCoxaDireita: 'coxaDireita',
      circunferenciaCoxaEsquerda: 'coxaEsquerda',
      circunferenciaPanturrilhaDireita: 'panturrilhaDireita',
      circunferenciaPanturrilhaEsquerda: 'panturrilhaEsquerda'
    };

    // Substituir automaticamente os nomes
    for (const [campoErrado, campoCorreto] of Object.entries(mapaCampos)) {
      if (dados[campoErrado] !== undefined) {
        dados[campoCorreto] = dados[campoErrado];
        delete dados[campoErrado];
      }
    }



    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const avaliacaoExistente = await avaliacaoFisicaRepository.buscarPorId(id, empresaId);

      if (!avaliacaoExistente) {
        throw new ApiError(404, 'Avaliação física não encontrada');
      }
      if (dados.dataAvaliacao) {
        dados.dataAvaliacao = new Date(dados.dataAvaliacao);
      }



      // Recalcular se peso ou altura mudaram
      if (dados.peso || dados.altura) {
        const peso = dados.peso || avaliacaoExistente.peso;
        const altura = dados.altura || avaliacaoExistente.altura;

        dados.imc = this.calcularIMC(peso, altura);
        dados.classificacaoIMC = this.classificarIMC(dados.imc);
        dados.pesoIdeal = this.calcularPesoIdeal(altura);
      }

      const avaliacaoAtualizada = await avaliacaoFisicaRepository.atualizar(id, dados, empresaId);

      console.log('✅ Avaliação física atualizada:', id);
      return avaliacaoAtualizada;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao atualizar avaliação: ${error.message}`);
    }
  }

  /**
   * Deletar avaliação
   */
  async deletar(id, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const avaliacao = await avaliacaoFisicaRepository.buscarPorId(id, empresaId);

      if (!avaliacao) {
        throw new ApiError(404, 'Avaliação física não encontrada');
      }

      await avaliacaoFisicaRepository.deletar(id, empresaId);

      console.log('✅ Avaliação física deletada:', id);
      return { message: 'Avaliação física deletada com sucesso' };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao deletar avaliação: ${error.message}`);
    }
  }

  /**
   * Buscar evolução do aluno
   */
  async buscarEvolucao(alunoId, empresaId, parametros = ['peso', 'imc', 'percentualGordura']) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const aluno = await alunoRepository.buscarPorId(alunoId, empresaId);
      if (!aluno) {
        throw new ApiError(404, 'Aluno não encontrado');
      }

      const evolucao = await avaliacaoFisicaRepository.buscarEvolucao(
        alunoId,
        empresaId,
        parametros
      );

      return {
        aluno: {
          id: aluno.id,
          nome: aluno.pessoa.nome1 + (aluno.pessoa.nome2 ? ' ' + aluno.pessoa.nome2 : ''),
          matricula: aluno.matricula
        },
        totalAvaliacoes: evolucao.length,
        evolucao
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao buscar evolução: ${error.message}`);
    }
  }

  /**
   * Comparar duas avaliações
   */
  async compararAvaliacoes(avaliacaoAnteriorId, avaliacaoAtualId, empresaId) {
    if (!empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    try {
      const [anterior, atual] = await Promise.all([
        avaliacaoFisicaRepository.buscarPorId(avaliacaoAnteriorId, empresaId),
        avaliacaoFisicaRepository.buscarPorId(avaliacaoAtualId, empresaId)
      ]);

      if (!anterior || !atual) {
        throw new ApiError(404, 'Uma ou ambas avaliações não encontradas');
      }

      if (anterior.alunoId !== atual.alunoId) {
        throw new ApiError(400, 'As avaliações devem ser do mesmo aluno');
      }

      const comparacao = {
        peso: {
          anterior: anterior.peso,
          atual: atual.peso,
          diferenca: atual.peso - anterior.peso,
          percentual: ((atual.peso - anterior.peso) / anterior.peso * 100).toFixed(2)
        },
        imc: {
          anterior: anterior.imc,
          atual: atual.imc,
          diferenca: atual.imc - anterior.imc
        },
        percentualGordura: anterior.percentualGordura && atual.percentualGordura ? {
          anterior: anterior.percentualGordura,
          atual: atual.percentualGordura,
          diferenca: atual.percentualGordura - anterior.percentualGordura
        } : null,
        massaMagra: anterior.massaMagra && atual.massaMagra ? {
          anterior: anterior.massaMagra,
          atual: atual.massaMagra,
          diferenca: atual.massaMagra - anterior.massaMagra
        } : null,
        massaGorda: anterior.massaGorda && atual.massaGorda ? {
          anterior: anterior.massaGorda,
          atual: atual.massaGorda,
          diferenca: atual.massaGorda - anterior.massaGorda
        } : null
      };

      return {
        aluno: {
          nome: anterior.aluno.pessoa.nome1,
          matricula: anterior.aluno.matricula
        },
        dataAnterior: anterior.dataAvaliacao,
        dataAtual: atual.dataAvaliacao,
        diasEntre: Math.floor((new Date(atual.dataAvaliacao) - new Date(anterior.dataAvaliacao)) / (1000 * 60 * 60 * 24)),
        comparacao
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Erro ao comparar avaliações: ${error.message}`);
    }
  }
}

module.exports = new AvaliacaoFisicaService();