const fs = require('fs');
const path = require('path');

// Caminho do arquivo
const DATABASE_PATH = path.join(__dirname, 'DATABASE.JSON');
const OUTPUT_PATH = path.join(__dirname, 'DATABASE_FIXED.JSON');

console.log('🔧 Corrigindo arquivo DATABASE.JSON...\n');

try {
  // Ler o arquivo original
  const rawContent = fs.readFileSync(DATABASE_PATH, 'utf-8');
  
  // Limpar e preparar o conteúdo
  let content = rawContent.trim();
  
  // Se não começar com [, adicionar
  if (!content.startsWith('[')) {
    content = '[' + content;
  }
  
  // Se não terminar com ], adicionar
  if (!content.endsWith(']')) {
    content = content + ']';
  }
  
  // Tentar fazer o parse
  console.log('📝 Tentando fazer parse do JSON...');
  const data = JSON.parse(content);
  
  console.log(`✅ JSON válido! Encontrados ${data.length} exercícios\n`);
  
  // Extrair grupos únicos
  const gruposSet = new Set();
  data.forEach(ex => {
    if (ex.grupo) {
      gruposSet.add(ex.grupo.trim().toUpperCase());
    }
  });
  
  const grupos = Array.from(gruposSet).sort().map((nome, index) => ({
    nome,
    codigo: `GRP${String(index + 1).padStart(3, '0')}`
  }));
  
  console.log(`📋 Grupos encontrados: ${grupos.length}`);
  grupos.forEach(g => console.log(`   - ${g.nome}`));
  
  // Criar estrutura final
  const estruturaFinal = {
    grupos: grupos,
    exercicios: data.map((ex, index) => ({
      ...ex,
      codigo: ex.codigo || `EXE${String(index + 1).padStart(3, '0')}`
    }))
  };
  
  // Salvar arquivo corrigido
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(estruturaFinal, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ Arquivo corrigido salvo em: ${OUTPUT_PATH}`);
  console.log(`\n📊 Estatísticas:`);
  console.log(`   - Grupos: ${grupos.length}`);
  console.log(`   - Exercícios: ${data.length}`);
  
  console.log(`\n💡 Próximos passos:`);
  console.log(`   1. Renomeie DATABASE.JSON para DATABASE_OLD.JSON (backup)`);
  console.log(`   2. Renomeie DATABASE_FIXED.JSON para DATABASE.JSON`);
  console.log(`   3. Execute: npm run seed`);
  
} catch (error) {
  console.error('❌ Erro ao processar arquivo:', error.message);
  console.error('\n🔍 Detalhes do erro:');
  console.error(error);
  
  // Tentar identificar o problema
  console.log('\n🔧 Diagnóstico:');
  const content = fs.readFileSync(DATABASE_PATH, 'utf-8');
  console.log(`   - Tamanho do arquivo: ${content.length} caracteres`);
  console.log(`   - Primeira linha: ${content.substring(0, 100)}...`);
  console.log(`   - Últimas linhas: ...${content.substring(content.length - 100)}`);
  
  process.exit(1);
}