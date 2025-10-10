const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// ========== CRIAR ALUNO ==========
router.post('/', async (req, res) => {
  try {
    const {
      pessoaId,
      vldExameMedico,
      vldAvaliacao,
      objetivo,
      profissao,
      empresa,
      responsavel,
      horarios,
      controleAcesso
    } = req.body;

    // Validação básica
    if (!pessoaId || !controleAcesso?.senha) {
      return res.status(400).json({ 
        error: 'pessoaId e controleAcesso.senha são obrigatórios' 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(controleAcesso.senha, 10);

    // Criar aluno
    const aluno = await prisma.aluno.create({
      data: {
        pessoaId,
        vldExameMedico: vldExameMedico ? new Date(vldExameMedico) : null,
        vldAvaliacao: vldAvaliacao ? new Date(vldAvaliacao) : null,
        objetivo,
        profissao,
        empresa,
        responsavel,
        horarios: horarios || [],
        controleAcesso: {
          senha: senhaHash,
          impressaoDigital1: controleAcesso.impressaoDigital1 || null,
          impressaoDigital2: controleAcesso.impressaoDigital2 || null
        }
      },
      include: {
        pessoa: true
      }
    });

    res.status(201).json(aluno);
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ error: 'Erro ao criar aluno', details: error.message });
  }
});

// ========== LISTAR TODOS OS ALUNOS ==========
router.get('/', async (req, res) => {
  try {
    const { situacao, page = 1, limit = 10 } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};

    if (situacao) {
      where.pessoa = { situacao };
    }

    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        include: {
          pessoa: {
            select: {
              codigo: true,
              nome1: true,
              nome2: true,
              situacao: true,
              contatos: true,
              doc1: true,
              dtNsc: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.aluno.count({ where })
    ]);

    res.json({
      data: alunos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro ao listar alunos', details: error.message });
  }
});

// ========== BUSCAR ALUNO POR ID ==========
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: {
        pessoa: true
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ error: 'Erro ao buscar aluno', details: error.message });
  }
});

// ========== ATUALIZAR ALUNO ==========
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pessoa,
      vldExameMedico,
      vldAvaliacao,
      objetivo,
      profissao,
      empresa,
      responsavel,
      horarios,
      controleAcesso
    } = req.body;

    // Dados do Aluno
    const updateData = {
      vldExameMedico: vldExameMedico ? new Date(vldExameMedico) : undefined,
      vldAvaliacao: vldAvaliacao ? new Date(vldAvaliacao) : undefined,
      objetivo,
      profissao,
      empresa,
      responsavel,
      horarios
    };

    // Se houver atualização de senha
    if (controleAcesso?.senha) {
      updateData.controleAcesso = {
        senha: await bcrypt.hash(controleAcesso.senha, 10),
        impressaoDigital1: controleAcesso.impressaoDigital1 || null,
        impressaoDigital2: controleAcesso.impressaoDigital2 || null
      };
    }

    // ✅ Atualizar Pessoa se os dados foram enviados
    if (pessoa) {
      // Buscar o aluno para pegar o pessoaId
      const alunoExistente = await prisma.aluno.findUnique({
        where: { id },
        select: { pessoaId: true }
      });

      if (!alunoExistente) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // ✅ CORREÇÃO: Preparar dados da pessoa corretamente
      const dadosPessoa = {
        nome1: pessoa.nome1,
        nome2: pessoa.nome2 || null,
        doc1: pessoa.doc1 || null,
        doc2: pessoa.doc2 || null,  // ✅ RG
        situacao: pessoa.situacao || 'ATIVO'
      };

      // ✅ Adicionar dtNsc apenas se for válido
      if (pessoa.dtNsc) {
        dadosPessoa.dtNsc = new Date(pessoa.dtNsc);
      }

      // ✅ Adicionar endereços (sempre substitui o array completo)
      if (pessoa.enderecos && Array.isArray(pessoa.enderecos)) {
        dadosPessoa.enderecos = pessoa.enderecos;
      }

      // ✅ Adicionar contatos (sempre substitui o array completo)
      if (pessoa.contatos && Array.isArray(pessoa.contatos)) {
        dadosPessoa.contatos = pessoa.contatos;
      }

      console.log('📝 Atualizando Pessoa:', JSON.stringify(dadosPessoa, null, 2)); // ← DEBUG

      // Atualizar Pessoa
      await prisma.pessoa.update({
        where: { id: alunoExistente.pessoaId },
        data: dadosPessoa
      });
    }

    // Atualizar Aluno
    const aluno = await prisma.aluno.update({
      where: { id },
      data: updateData,
      include: {
        pessoa: true
      }
    });

    res.json(aluno);
  } catch (error) {
    console.error('❌ Erro ao atualizar aluno:', error);
    res.status(500).json({ error: 'Erro ao atualizar aluno', details: error.message });
  }
});

// ========== DELETAR ALUNO ==========
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.aluno.delete({
      where: { id }
    });

    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ error: 'Erro ao deletar aluno', details: error.message });
  }
});

// ========== ADICIONAR HORÁRIO ==========
router.post('/:id/horarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { local, diasSemana, horarioEntrada, horarioSaida } = req.body;

    if (!local || !diasSemana || !horarioEntrada || !horarioSaida) {
      return res.status(400).json({ 
        error: 'Todos os campos do horário são obrigatórios' 
      });
    }

    const aluno = await prisma.aluno.findUnique({
      where: { id }
    });

    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }

    const novoHorario = { local, diasSemana, horarioEntrada, horarioSaida };
    
    const alunoAtualizado = await prisma.aluno.update({
      where: { id },
      data: {
        horarios: {
          push: novoHorario
        }
      },
      include: {
        pessoa: true
      }
    });

    res.json(alunoAtualizado);
  } catch (error) {
    console.error('Erro ao adicionar horário:', error);
    res.status(500).json({ error: 'Erro ao adicionar horário', details: error.message });
  }
});

module.exports = router;