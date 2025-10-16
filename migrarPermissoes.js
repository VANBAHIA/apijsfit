const { PrismaClient } = require('@prisma/client');
const { aplicarTemplatePerfil } = require('./src/config/permissoesPadrao');

const prisma = new PrismaClient();

async function migrarPermissoes() {
  console.log('🔄 Iniciando migração de permissões...');

  try {
    const usuarios = await prisma.usuario.findMany();
    console.log(`📋 Encontrados ${usuarios.length} usuários`);

    for (const usuario of usuarios) {
      const permissoes = aplicarTemplatePerfil(usuario.perfil);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { permissoes }
      });

      console.log(`✅ Atualizado: ${usuario.nome} (${usuario.perfil})`);
    }

    console.log('✨ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrarPermissoes();