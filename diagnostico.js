// diagnostico.js - Rode este script para verificar seus dados
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA DE COBRANÇAS\n');
  console.log('=' .repeat(60));

  // 1️⃣ VERIFICAR MATRÍCULAS ATIVAS
  const matriculas = await prisma.matricula.findMany({
    where: { situacao: 'ATIVA' },
    include: {
      aluno: {
        include: {
          pessoa: { select: { nome1: true } }
        }
      },
      plano: true
    }
  });

  console.log(`\n📋 MATRÍCULAS ATIVAS: ${matriculas.length}\n`);

  for (const mat of matriculas) {
    console.log(`┌─ Matrícula: ${mat.codigo}`);
    console.log(`├─ Aluno: ${mat.aluno.pessoa.nome1}`);
    console.log(`├─ Plano: ${mat.plano.nome}`);
    console.log(`├─ Tipo Cobrança: ${mat.plano.tipoCobranca || 'NÃO DEFINIDO ❌'}`);
    console.log(`├─ Periodicidade: ${mat.plano.periodicidade || 'NÃO DEFINIDO ❌'}`);
    console.log(`├─ Dia Vencimento: ${mat.diaVencimento || 'NÃO DEFINIDO ❌'}`);
    console.log(`├─ Data Início: ${mat.dataInicio.toLocaleDateString('pt-BR')}`);
    console.log(`├─ Data Fim: ${mat.dataFim.toLocaleDateString('pt-BR')}`);
    console.log(`└─ Data Fim > Hoje? ${mat.dataFim > new Date() ? '✅ SIM' : '❌ NÃO'}\n`);
  }

  // 2️⃣ VERIFICAR TODOS OS PLANOS
  console.log('=' .repeat(60));
  const planos = await prisma.plano.findMany();
  console.log(`\n💳 PLANOS CADASTRADOS: ${planos.length}\n`);

  for (const plano of planos) {
    console.log(`┌─ Plano: ${plano.nome}`);
    console.log(`├─ Status: ${plano.status}`);
    console.log(`├─ Tipo Cobrança: ${plano.tipoCobranca || 'NÃO DEFINIDO ❌'}`);
    console.log(`├─ Periodicidade: ${plano.periodicidade || 'NÃO DEFINIDO ❌'}`);
    console.log(`├─ Valor: R$ ${plano.valorMensalidade?.toFixed(2) || '0.00'}`);
    console.log(`└─ Número Meses: ${plano.numeroMeses || 'N/A'}\n`);
  }

  // 3️⃣ VERIFICAR COBRANÇAS EXISTENTES
  console.log('=' .repeat(60));
  const contas = await prisma.contaReceber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      aluno: {
        include: {
          pessoa: { select: { nome1: true } }
        }
      }
    }
  });

  console.log(`\n💰 ÚLTIMAS COBRANÇAS: ${contas.length}\n`);

  for (const conta of contas) {
    console.log(`┌─ Número: ${conta.numero}`);
    console.log(`├─ Aluno: ${conta.aluno.pessoa.nome1}`);
    console.log(`├─ Valor: R$ ${conta.valorFinal.toFixed(2)}`);
    console.log(`├─ Vencimento: ${conta.dataVencimento.toLocaleDateString('pt-BR')}`);
    console.log(`├─ Status: ${conta.status}`);
    console.log(`└─ Criada em: ${conta.createdAt.toLocaleString('pt-BR')}\n`);
  }

  // 4️⃣ VERIFICAR SE FALTA COBRANÇA PARA ESTE MÊS
  console.log('=' .repeat(60));
  console.log('\n🎯 ANÁLISE DE PENDÊNCIAS\n');

  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`;
  
  for (const mat of matriculas) {
    const contasMes = await prisma.contaReceber.findFirst({
      where: {
        alunoId: mat.alunoId,
        planoId: mat.planoId,
        dataVencimento: {
          gte: new Date(mesAtual + '-01'),
          lt: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
        },
        status: { not: 'CANCELADO' }
      }
    });

    if (!contasMes && mat.plano.tipoCobranca === 'RECORRENTE') {
      console.log(`❌ FALTA COBRANÇA - Matrícula: ${mat.codigo} | Aluno: ${mat.aluno.pessoa.nome1}`);
    } else if (contasMes) {
      console.log(`✅ Já existe cobrança - Matrícula: ${mat.codigo} | Fatura: ${contasMes.numero}`);
    } else {
      console.log(`⚠️  Matrícula ${mat.codigo} não é recorrente (Tipo: ${mat.plano.tipoCobranca})`);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('\n✅ Diagnóstico concluído!\n');

  await prisma.$disconnect();
}

diagnosticar().catch(console.error);