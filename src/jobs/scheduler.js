const cron = require('node-cron');
const gerarCobrancasJob = require('./gerarCobrancasRecorrentes');

class JobScheduler {
  
  iniciar() {
    console.log('📅 [SCHEDULER] Iniciando agendamento de jobs...');

    // Executar todo dia às 00:00 (meia-noite)
    cron.schedule('0 0 * * *', async () => {
      console.log('⏰ [SCHEDULER] Executando job de cobranças - ' + new Date().toISOString());
      
      try {
        await gerarCobrancasJob.executar();
      } catch (error) {
        console.error('❌ [SCHEDULER] Erro ao executar job:', error);
        // Aqui você pode enviar email/notificação de erro
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Job para atualizar status de contas vencidas (às 01:00)
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

  // Método para executar job manualmente (útil para testes)
  async executarManualmente() {
    console.log('🔧 [SCHEDULER] Execução manual do job...');
    return await gerarCobrancasJob.executar();
  }
}

module.exports = new JobScheduler();