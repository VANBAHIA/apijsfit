const cron = require('node-cron');
const gerarCobrancasJob = require('./gerarCobrancasRecorrentes');
const frequenciaJob = require('./frequenciaJob');
const pmx = require('@pm2/io'); // 🔧 Necessário para permitir comandos via PM2 Trigger

class JobScheduler {
  
  iniciar() {
    console.log('📅 [SCHEDULER] Iniciando agendamento de jobs...');
    
    // 🔹 Executa rotina de frequência automática
    frequenciaJob.registrarFaltasAutomaticas();

    // 🔹 Registra ação manual via PM2 Trigger
    pmx.action('executarManualmente', async (reply) => {
      console.log('🔧 [SCHEDULER] Execução manual solicitada via PM2 Trigger...');
      try {
        const resultado = await gerarCobrancasJob.executar();
        reply({ status: 'ok', mensagem: 'Job executado manualmente com sucesso!', resultado });
      } catch (error) {
        console.error('❌ [SCHEDULER] Erro ao executar job manualmente:', error);
        reply({ status: 'erro', mensagem: error.message });
      }
    });

    // 🔹 Job principal – gerar cobranças às 00:00 (meia-noite)
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ [SCHEDULER] Executando job de cobranças - ' + new Date().toISOString());
      
      try {
        await gerarCobrancasJob.executar();
      } catch (error) {
        console.error('❌ [SCHEDULER] Erro ao executar job automático:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // 🔹 Job secundário – atualizar contas vencidas às 01:00
    cron.schedule('0 1 * * *', async () => {
      console.log('⏰ [SCHEDULER] Atualizando contas vencidas...');
      
      const contaReceberService = require('../services/contaReceberService');
      try {
        await contaReceberService.atualizarStatusVencidas();
      } catch (error) {
        console.error('❌ [SCHEDULER] Erro ao atualizar vencidas:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    console.log('✅ [SCHEDULER] Jobs agendados com sucesso!');
  }

  // 🔹 Execução manual direta (sem PM2)
  async executarManualmente() {
    console.log('🔧 [SCHEDULER] Execução manual do job iniciada...');
    return await gerarCobrancasJob.executar();
  }

}

module.exports = new JobScheduler();
