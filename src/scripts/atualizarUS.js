// scripts/atualizarPermissoes.js
const { PrismaClient } = require('@prisma/client');
const { aplicarTemplatePerfil } = require('../config/permissoesPadrao');

const prisma = new PrismaClient();

async function atualizar() {
  console.log('🔄 Iniciando atualização de permissões...\n');

  try {
    const usuarios = await prisma.usuario.findMany();

    console.log(`📋 Total de usuários encontrados: ${usuarios.length}\n`);

    for (const usuario of usuarios) {
      console.log('='.repeat(60));
      console.log(`👤 Usuário: ${usuario.nome}`);
      console.log(`📧 Email: ${usuario.email}`);
      console.log(`🎭 Perfil: ${usuario.perfil}`);
      console.log(`🆔 ID: ${usuario.id}`);
      
      console.log('\n📌 PERMISSÕES ANTIGAS:');
      console.log(JSON.stringify(usuario.permissoes, null, 2));
      
      // Aplicar novo template
      const novasPermissoes = aplicarTemplatePerfil(usuario.perfil);
      
      console.log('\n✨ PERMISSÕES NOVAS:');
      console.log(JSON.stringify(novasPermissoes, null, 2));
      
      // Atualizar no banco
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { permissoes: novasPermissoes }
      });
      
      console.log('\n✅ Usuário atualizado com sucesso!');
      console.log('='.repeat(60));
      console.log('\n');
    }

    console.log('🎉 Atualização concluída com sucesso!');
    console.log(`✅ ${usuarios.length} usuário(s) atualizado(s)`);

  } catch (error) {
    console.error('❌ ERRO ao atualizar permissões:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizar();