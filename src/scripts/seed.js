

require('dotenv').config();
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const permissoesPadrao = {
    SUPER_ADMIN: {
    modulos: {
      empresas: { visualizar: true, criar: true, editar: true, deletar: true },
      usuarios: { visualizar: true, criar: true, editar: true, deletar: true },
      licencas: { visualizar: true, criar: true, editar: true, deletar: true },
      pessoas: { visualizar: true, criar: true, editar: true, deletar: true },
      alunos: { visualizar: true, criar: true, editar: true, deletar: true },
      funcionarios: { visualizar: true, criar: true, editar: true, deletar: true },
      turmas: { visualizar: true, criar: true, editar: true, deletar: true },
      matriculas: { visualizar: true, criar: true, editar: true, deletar: true },
      frequencias: { visualizar: true, criar: true, editar: true, deletar: true },
      financeiro: { visualizar: true, criar: true, editar: true, deletar: true },
      relatorios: { visualizar: true, gerar: true }
    },
    acoes_especiais: ['GERENCIAR_LICENCA', 'GERENCIAR_USUARIOS', 'ALTERAR_EMPRESA']
  },
  ADMIN: {
    modulos: {
      empresas: { visualizar: true, criar: true, editar: true, deletar: true },
      usuarios: { visualizar: true, criar: true, editar: true, deletar: true },
      licencas: { visualizar: true, criar: true, editar: true, deletar: true },
      pessoas: { visualizar: true, criar: true, editar: true, deletar: true },
      alunos: { visualizar: true, criar: true, editar: true, deletar: true },
      funcionarios: { visualizar: true, criar: true, editar: true, deletar: true },
      turmas: { visualizar: true, criar: true, editar: true, deletar: true },
      matriculas: { visualizar: true, criar: true, editar: true, deletar: true },
      frequencias: { visualizar: true, criar: true, editar: true, deletar: true },
      financeiro: { visualizar: true, criar: true, editar: true, deletar: true },
      relatorios: { visualizar: true, gerar: true }
    },
    acoes_especiais: ['GERENCIAR_LICENCA', 'GERENCIAR_USUARIOS', 'ALTERAR_EMPRESA']
  },
  USUARIO: {
    modulos: {
      pessoas: { visualizar: true, criar: true, editar: false },
      alunos: { visualizar: true, criar: true, editar: false },
      turmas: { visualizar: true, criar: false, editar: false },
      matriculas: { visualizar: true, criar: true, editar: false },
      frequencias: { visualizar: true, criar: true, editar: false },
      relatorios: { visualizar: true, gerar: false }
    },
    acoes_especiais: []
  }
};

async function seed() {
  try {
    console.log('Iniciando implantação de dados...\n');

    // 1. Criar Empresa
    console.log('Criando empresa...');
    const empresa = await prisma.empresa.create({
      data: {
        codigo: 'EMP0001',
        razaoSocial: 'Academia Fitness Plus',
        nomeFantasia: 'Fitness Plus',
        cnpj: '12.345.678/0001-99',
        inscricaoEstadual: 'MG.12.345.678.123',
        email: 'contato@fitnesplus.com.br',
        site: 'www.fitnesplus.com.br',
        situacao: 'ATIVO',
        endereco: {
          logradouro: 'Rua das Flores, 123',
          cep: '30130-100',
          cidade: 'Belo Horizonte',
          uf: 'MG'
        },
        contatos: [
          {
            tipo: 'TELEFONE_FIXO',
            valor: '(31) 3123-4567'
          },
          {
            tipo: 'CELULAR',
            valor: '(31) 98765-4321'
          }
        ]
      }
    });
    console.log(`OK - Empresa criada: ${empresa.razaoSocial}\n`);

    // 2. Criar Licença
    console.log('Criando licença...');
    const dataInicio = new Date();
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);

    const licenca = await prisma.licenca.create({
      data: {
        empresaId: empresa.id,
        chave: uuidv4().toUpperCase(),
        tipo: 'ANUAL',
        dataInicio,
        dataExpiracao,
        maxUsuarios: 10,
        maxAlunos: 500,
        funcionalidades: [
          'ALUNOS',
          'FUNCIONARIOS',
          'TURMAS',
          'MATRICULAS',
          'FREQUENCIA',
          'FINANCEIRO',
          'RELATORIOS'
        ],
        situacao: 'ATIVA'
      }
    });
    console.log(`OK - Licença criada (Chave: ${licenca.chave})\n`);

    // 3. Criar Usuários
    console.log('Criando usuários...');
    const senhaHash = await bcrypt.hash('senha123', 10);

    const usuarioAdmin = await prisma.usuario.create({
      data: {
        empresaId: empresa.id,
        nomeUsuario: 'admin',
        nome: 'Administrador',
        email: 'admin@fitnesplus.com.br',
        senha: senhaHash,
        perfil: 'ADMIN',
        permissoes: permissoesPadrao.ADMIN,
        situacao: 'ATIVO'
      }
    });
    console.log(`  - ADMIN: ${usuarioAdmin.nomeUsuario} / senha: senha123`);

    const usuarioOperador = await prisma.usuario.create({
      data: {
        empresaId: empresa.id,
        nomeUsuario: 'operador',
        nome: 'Operador Sistema',
        email: 'operador@fitnesplus.com.br',
        senha: senhaHash,
        perfil: 'USUARIO',
        permissoes: permissoesPadrao.USUARIO,
        situacao: 'ATIVO'
      }
    });
    console.log(`  - USUARIO: ${usuarioOperador.nomeUsuario} / senha: senha123\n`);

    // 4. Criar Funções
    console.log('Criando funções...');
    const funcoes = await Promise.all([
      prisma.funcao.create({
        data: { empresaId: empresa.id, funcao: 'Professor', status: 'ATIVO' }
      }),
      prisma.funcao.create({
        data: { empresaId: empresa.id, funcao: 'Recepcionista', status: 'ATIVO' }
      }),
      prisma.funcao.create({
        data: { empresaId: empresa.id, funcao: 'Gerente', status: 'ATIVO' }
      })
    ]);
    console.log(`OK - ${funcoes.length} funções criadas\n`);

    // 5. Criar Locais
    console.log('Criando locais...');
    const locais = await Promise.all([
      prisma.local.create({
        data: { empresaId: empresa.id, nome: 'Sala de Musculação', status: 'ATIVO' }
      }),
      prisma.local.create({
        data: { empresaId: empresa.id, nome: 'Sala de Yoga', status: 'ATIVO' }
      }),
      prisma.local.create({
        data: { empresaId: empresa.id, nome: 'Sala de Dança', status: 'ATIVO' }
      })
    ]);
    console.log(`OK - ${locais.length} locais criados\n`);

    // 6. Criar Planos
    console.log('Criando planos...');
    const planos = await Promise.all([
      prisma.plano.create({
        data: {
          empresaId: empresa.id,
          codigo: 'PLAN001',
          nome: 'Plano Básico',
          periodicidade: 'MENSAL',
          tipoCobranca: 'RECORRENTE',
          valorMensalidade: 99.90,
          status: 'ATIVO',
          descricao: 'Acesso completo à academia'
        }
      }),
      prisma.plano.create({
        data: {
          empresaId: empresa.id,
          codigo: 'PLAN002',
          nome: 'Plano Trimestral',
          periodicidade: 'TRIMESTRAL',
          numeroMeses: 3,
          tipoCobranca: 'RECORRENTE',
          valorMensalidade: 89.90,
          status: 'ATIVO',
          descricao: 'Plano com 3 meses de duração'
        }
      }),
      prisma.plano.create({
        data: {
          empresaId: empresa.id,
          codigo: 'PLAN003',
          nome: 'Plano Anual',
          periodicidade: 'ANUAL',
          tipoCobranca: 'RECORRENTE',
          valorMensalidade: 79.90,
          status: 'ATIVO',
          descricao: 'Plano com 12 meses de duração'
        }
      })
    ]);
    console.log(`OK - ${planos.length} planos criados\n`);

    // 7. Criar Descontos
    console.log('Criando descontos...');
    const descontos = await Promise.all([
      prisma.desconto.create({
        data: {
          empresaId: empresa.id,
          descricao: 'Desconto Indicação',
          tipo: 'PORCENTAGEM',
          valor: 10,
          status: 'ATIVO'
        }
      }),
      prisma.desconto.create({
        data: {
          empresaId: empresa.id,
          descricao: 'Desconto Estudante',
          tipo: 'PORCENTAGEM',
          valor: 15,
          status: 'ATIVO'
        }
      })
    ]);
    console.log(`OK - ${descontos.length} descontos criados\n`);

    // 8. Criar Pessoas
    console.log('Criando pessoas...');
    const pessoa1 = await prisma.pessoa.create({
      data: {
        empresaId: empresa.id,
        codigo: 'PES0001',
        tipo: 'FISICA',
        nome1: 'João Silva',
        doc1: '12345678901',
        dtNsc: new Date('1990-05-15'),
        situacao: 'ATIVO',
        enderecos: [
          {
            logradouro: 'Rua Principal, 456',
            cep: '30130-200',
            cidade: 'Belo Horizonte',
            uf: 'MG'
          }
        ],
        contatos: [
          {
            tipo: 'CELULAR',
            valor: '(31) 99999-8888'
          }
        ]
      }
    });

    const pessoa2 = await prisma.pessoa.create({
      data: {
        empresaId: empresa.id,
        codigo: 'PES0002',
        tipo: 'FISICA',
        nome1: 'Maria Santos',
        doc1: '10987654321',
        dtNsc: new Date('1995-08-22'),
        situacao: 'ATIVO',
        enderecos: [
          {
            logradouro: 'Av. Secundária, 789',
            cep: '30130-300',
            cidade: 'Belo Horizonte',
            uf: 'MG'
          }
        ],
        contatos: [
          {
            tipo: 'CELULAR',
            valor: '(31) 98888-7777'
          }
        ]
      }
    });

    const pessoa3 = await prisma.pessoa.create({
      data: {
        empresaId: empresa.id,
        codigo: 'PES0003',
        tipo: 'FISICA',
        nome1: 'Carlos Professor',
        doc1: '11111111111',
        dtNsc: new Date('1985-03-10'),
        situacao: 'ATIVO',
        enderecos: [
          {
            logradouro: 'Rua do Professor, 100',
            cep: '30130-400',
            cidade: 'Belo Horizonte',
            uf: 'MG'
          }
        ],
        contatos: [
          {
            tipo: 'CELULAR',
            valor: '(31) 97777-6666'
          }
        ]
      }
    });

    console.log(`OK - 3 pessoas criadas\n`);

    // 9. Criar Alunos
    console.log('Criando alunos...');
    const aluno1 = await prisma.aluno.create({
      data: {
        empresaId: empresa.id,
        pessoaId: pessoa1.id,
        matricula: 'ALU0001',
        vldExameMedico: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        objetivo: 'Perda de peso',
        profissao: 'Engenheiro',
        controleAcesso: {
          senha: '1234',
          impressaoDigital1: 'digital123',
          impressaoDigital2: 'digital456'
        }
      }
    });

    const aluno2 = await prisma.aluno.create({
      data: {
        empresaId: empresa.id,
        pessoaId: pessoa2.id,
        matricula: 'ALU0002',
        vldExameMedico: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        objetivo: 'Ganho de massa',
        profissao: 'Professora',
        controleAcesso: {
          senha: '5678',
          impressaoDigital1: 'digital789'
        }
      }
    });

    console.log(`OK - 2 alunos criados\n`);

    // 10. Criar Funcionário
    console.log('Criando funcionários...');
    const funcionario = await prisma.funcionario.create({
      data: {
        empresaId: empresa.id,
        pessoaId: pessoa3.id,
        matricula: 'FUNC0001',
        funcaoId: funcoes[0].id,
        dataAdmissao: new Date('2023-01-15'),
        salario: 3500.00,
        situacao: 'ATIVO'
      }
    });
    console.log(`OK - 1 funcionário criado\n`);

    // 11. Criar Turmas
    console.log('Criando turmas...');
    const turma1 = await prisma.turma.create({
      data: {
        empresaId: empresa.id,
        nome: 'Musculação - Matutino',
        sexo: 'MISTO',
        horarios: [
          {
            local: 'Sala de Musculação',
            diasSemana: ['SEGUNDA', 'QUARTA', 'SEXTA'],
            horarioEntrada: '06:00',
            horarioSaida: '08:00'
          }
        ],
        instrutores: [
          {
            nome: 'Carlos Professor',
            contatos: [
              {
                tipo: 'CELULAR',
                valor: '(31) 97777-6666'
              }
            ]
          }
        ],
        status: 'ATIVO'
      }
    });

    const turma2 = await prisma.turma.create({
      data: {
        empresaId: empresa.id,
        nome: 'Yoga - Noturno',
        sexo: 'MISTO',
        horarios: [
          {
            local: 'Sala de Yoga',
            diasSemana: ['TERCA', 'QUINTA'],
            horarioEntrada: '19:00',
            horarioSaida: '20:30'
          }
        ],
        instrutores: [],
        status: 'ATIVO'
      }
    });

    console.log(`OK - 2 turmas criadas\n`);

    // 12. Criar Matrículas
    console.log('Criando matrículas...');
    const dataInicio1 = new Date();
    const dataFim1 = new Date(dataInicio1);
    dataFim1.setMonth(dataFim1.getMonth() + 1);

    const matricula1 = await prisma.matricula.create({
      data: {
        empresaId: empresa.id,
        codigo: 'MAT0001',
        alunoId: aluno1.id,
        planoId: planos[0].id,
        turmaId: turma1.id,
        dataInicio: dataInicio1,
        dataFim: dataFim1,
        diaVencimento: 15,
        valorMatricula: 99.90,
        valorDesconto: 0,
        valorFinal: 99.90,
        situacao: 'ATIVA',
        parcelamento: 1,
        proximaCobrancaData: new Date(new Date().setDate(new Date().getDate() + 30))
      }
    });

    const matricula2 = await prisma.matricula.create({
      data: {
        empresaId: empresa.id,
        codigo: 'MAT0002',
        alunoId: aluno2.id,
        planoId: planos[1].id,
        turmaId: turma2.id,
        descontoId: descontos[1].id,
        dataInicio: dataInicio1,
        dataFim: dataFim1,
        diaVencimento: 10,
        valorMatricula: 89.90,
        valorDesconto: 13.48,
        valorFinal: 76.42,
        situacao: 'ATIVA',
        parcelamento: 1
      }
    });

    console.log(`OK - 2 matrículas criadas\n`);

    // 13. Criar Frequências
    console.log('Criando frequências...');
    const hoje = new Date();
    
    await Promise.all([
      prisma.frequencia.create({
        data: {
          empresaId: empresa.id,
          alunoId: aluno1.id,
          data: hoje,
          horarioInicio: new Date(hoje.setHours(6, 0, 0)),
          horarioFim: new Date(hoje.setHours(7, 30, 0)),
          presente: true,
          tipo: 'MANUAL',
          validadaPor: usuarioOperador.id
        }
      }),
      prisma.frequencia.create({
        data: {
          empresaId: empresa.id,
          alunoId: aluno2.id,
          data: hoje,
          horarioInicio: new Date(hoje.setHours(19, 0, 0)),
          horarioFim: new Date(hoje.setHours(20, 30, 0)),
          presente: true,
          tipo: 'MANUAL',
          validadaPor: usuarioOperador.id
        }
      })
    ]);

    console.log(`OK - Frequências criadas\n`);

    // 14. Criar Contas a Receber
    console.log('Criando contas a receber...');
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 15);

    await prisma.contaReceber.create({
      data: {
        empresaId: empresa.id,
        numero: 'CR0001',
        alunoId: aluno1.id,
        planoId: planos[0].id,
        matriculaId: matricula1.id,
        valorOriginal: 99.90,
        valorDesconto: 0,
        valorFinal: 99.90,
        valorPago: 0,
        valorRestante: 99.90,
        dataEmissao: new Date(),
        dataVencimento: dataVencimento,
        status: 'PENDENTE',
        numeroParcela: 1,
        totalParcelas: 1
      }
    });

    console.log(`OK - Conta a receber criada\n`);

    // 15. Criar Caixa
    console.log('Criando caixa...');
    const caixa = await prisma.caixa.create({
      data: {
        empresaId: empresa.id,
        numero: 'CX0001',
        dataAbertura: new Date(),
        horaAbertura: new Date().toLocaleTimeString('pt-BR'),
        valorAbertura: 500.00,
        usuarioAbertura: usuarioAdmin.nomeUsuario,
        totalEntradas: 0,
        totalSaidas: 0,
        status: 'ABERTO',
        movimentos: [],
        observacoes: 'Caixa inicial'
      }
    });

    console.log(`OK - Caixa criada\n`);

    console.log('='.repeat(60));
    console.log('IMPLANTAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\nDados iniciais:');
    console.log(`  - Empresa: ${empresa.razaoSocial}`);
    console.log(`  - Licença: ${licenca.tipo} (Válida até ${dataExpiracao.toLocaleDateString('pt-BR')})`);
    console.log(`  - Usuários: admin, operador`);
    console.log(`  - Alunos: 2`);
    console.log(`  - Funcionários: 1`);
    console.log(`  - Turmas: 2`);
    console.log(`  - Matrículas: 2`);
    console.log('\nAcesse o sistema com:');
    console.log('  Usuário: admin | Senha: senha123');
    console.log('  Usuário: operador | Senha: senha123');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Erro durante implantação:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();