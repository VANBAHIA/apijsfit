const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/** -----------------------------------
  CONFIGURAÇÕES

  prara eexecutar digite npx prisma db seed
----------------------------------*/
const EMPRESA_ID = '68f2443c95d5de7d6de6c62b';
const DATABASE_PATH = path.join(__dirname, 'DATABASE.JSON');

// 🔥 true = apaga tudo e recria / false = só adiciona o que falta
const RESET_MODE = true;

/** -----------------------------------
  FUNÇÃO PRINCIPAL
----------------------------------*/
async function main() {
  console.log('🚀 Seed de grupos e exercícios iniciado\n');

  // Verificar se arquivo existe
  if (!fs.existsSync(DATABASE_PATH)) {
    throw new Error(`Arquivo ${DATABASE_PATH} não encontrado`);
  }

  // Ler e parsear o arquivo
  console.log('📖 Lendo arquivo DATABASE.JSON...');
  const rawContent = fs.readFileSync(DATABASE_PATH, 'utf-8');
  
  let data;
  try {
    // Tentar fazer parse direto
    data = JSON.parse(rawContent);
  } catch (error) {
    console.log('⚠️  JSON inválido, tentando corrigir...');
    
    // Tentar corrigir o JSON
    let content = rawContent.trim();
    
    // Adicionar [ no início se não tiver
    if (!content.startsWith('[')) {
      content = '[' + content;
    }
    
    // Adicionar ] no final se não tiver
    if (!content.endsWith(']')) {
      content = content + ']';
    }
    
    try {
      data = JSON.parse(content);
      console.log('✅ JSON corrigido com sucesso!\n');
    } catch (err) {
      console.error('❌ Não foi possível corrigir o JSON automaticamente');
      console.error('Erro:', err.message);
      throw new Error('Execute o script fix-database-json.js primeiro');
    }
  }

  // Processar dados
  let exercicios = [];
  let grupos = [];

  if (Array.isArray(data)) {
    // Se for array direto de exercícios
    exercicios = data;
    
    // Extrair grupos únicos
    const gruposSet = new Set();
    exercicios.forEach(ex => {
      if (ex.grupo) {
        gruposSet.add(ex.grupo.trim().toUpperCase());
      }
    });
    
    grupos = Array.from(gruposSet).sort().map((nome, index) => ({
      nome,
      codigo: `GRP${String(index + 1).padStart(3, '0')}`
    }));
  } else if (data.grupos && data.exercicios) {
    // Se já tiver estrutura grupos/exercicios
    grupos = data.grupos;
    exercicios = data.exercicios;
  } else {
    throw new Error('Estrutura do JSON não reconhecida');
  }

  console.log(`📦 Encontrados ${grupos.length} grupos e ${exercicios.length} exercícios\n`);

  // 🧹 Modo reset: apaga tudo antes
  if (RESET_MODE) {
    console.log('🧹 Limpando coleções existentes...');
    await prisma.exercicio.deleteMany({ where: { empresaId: EMPRESA_ID } });
    await prisma.grupoExercicio.deleteMany({ where: { empresaId: EMPRESA_ID } });
    console.log('✅ Coleções limpas\n');
  }

  // Buscar grupos existentes (modo safe)
  const gruposExistentes = await prisma.grupoExercicio.findMany({
    where: { empresaId: EMPRESA_ID },
    select: { id: true, nome: true },
  });
  const gruposMap = Object.fromEntries(
    gruposExistentes.map(g => [g.nome.toUpperCase(), g.id])
  );

  // 🧩 Inserir grupos
  console.log('📋 Inserindo grupos...');
  let gruposInseridos = 0;
  
  for (const g of grupos) {
    const nome = (g.nome || '').trim().toUpperCase();
    if (!nome) continue;

    if (!RESET_MODE && gruposMap[nome]) {
      console.log(`   ⏭️  Grupo já existe: ${nome}`);
      continue;
    }

    const codigo = g.codigo || `GRP${String(Object.keys(gruposMap).length + 1).padStart(3, '0')}`;

    try {
      const grupo = await prisma.grupoExercicio.create({
        data: {
          codigo,
          nome,
          empresaId: EMPRESA_ID,
        },
      });

      gruposMap[nome] = grupo.id;
      gruposInseridos++;
      console.log(`   ✅ ${codigo} - ${nome}`);
    } catch (error) {
      console.error(`   ❌ Erro ao criar grupo ${nome}:`, error.message);
    }
  }
  
  console.log(`\n✅ ${gruposInseridos} grupos inseridos\n`);

  // Buscar exercícios existentes (modo safe)
  const exerciciosExistentes = await prisma.exercicio.findMany({
    where: { empresaId: EMPRESA_ID },
    select: { nome: true },
  });
  const nomesExistentes = new Set(
    exerciciosExistentes.map(e => e.nome.toUpperCase())
  );

  // 🏋️‍♂️ Inserir exercícios
  console.log('🏋️‍♂️ Inserindo exercícios...');
  let exerciciosInseridos = 0;
  let exerciciosPulados = 0;
  let exerciciosErro = 0;
  
  for (const [index, e] of exercicios.entries()) {
    const nome = (e.nome || '').trim().toUpperCase();
    if (!nome) continue;

    if (!RESET_MODE && nomesExistentes.has(nome)) {
      exerciciosPulados++;
      continue;
    }

    const codigo = e.codigo || `EXE${String(index + 1).padStart(3, '0')}`;
    const grupoNome = (e.grupo || '').trim().toUpperCase();
    const grupoId = gruposMap[grupoNome] || null;

    // Processar músculos
    let musculos = [];
    if (Array.isArray(e.Musculos)) {
      musculos = e.Musculos;
    } else if (typeof e.Musculos === 'string') {
      musculos = e.Musculos.split(',').map(m => m.trim()).filter(Boolean);
    } else if (Array.isArray(e.musculos)) {
      musculos = e.musculos;
    } else if (typeof e.musculos === 'string') {
      musculos = e.musculos.split(',').map(m => m.trim()).filter(Boolean);
    }

    try {
      await prisma.exercicio.create({
        data: {
          nome,
          descricao: e.descricao || null,
          musculos,
          empresaId: EMPRESA_ID,
          grupoId,
          imagemUrl: e.imagemUrl || null,
        },
      });

      exerciciosInseridos++;
      
      if (exerciciosInseridos % 50 === 0) {
        console.log(`   📊 Progresso: ${exerciciosInseridos}/${exercicios.length}`);
      }
    } catch (error) {
      exerciciosErro++;
      console.error(`   ❌ Erro ao criar exercício ${nome}:`, error.message);
    }
  }
  
  console.log('\n📊 Resumo:');
  console.log(`   ✅ Exercícios inseridos: ${exerciciosInseridos}`);
  if (exerciciosPulados > 0) {
    console.log(`   ⏭️  Exercícios pulados (já existentes): ${exerciciosPulados}`);
  }
  if (exerciciosErro > 0) {
    console.log(`   ❌ Exercícios com erro: ${exerciciosErro}`);
  }
  
  console.log('\n✅ Seed concluído com sucesso!');
}

/** -----------------------------------
  EXECUÇÃO
----------------------------------*/
main()
  .catch(err => {
    console.error('\n❌ Erro no seed:', err.message);
    console.error('\n🔍 Stack trace:');
    console.error(err.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });