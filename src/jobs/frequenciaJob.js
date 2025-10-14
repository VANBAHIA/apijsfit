const cron = require('node-cron');
const alunoRepository = require('../repositories/alunoRepository');
const frequenciaRepository = require('../repositories/frequenciaRepository');

class FrequenciaJob {
  /**
   * Registra faltas automáticas para alunos que não compareceram
   * Executa diariamente às 23:00
   */
  registrarFaltasAutomaticas() {
    return cron.schedule('0 23 * * *', async () => {
      try {
        console.log('🤖 Iniciando job de registro de faltas automáticas...');

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Buscar todos os alunos ativos
        const { alunos } = await alunoRepository.buscarTodos({ take: 1000 });

        let faltasRegistradas = 0;

        for (const aluno of alunos) {
          // Verificar se já tem frequência registrada hoje
          const frequenciaHoje = await frequenciaRepository.buscarPorAlunoEData(
            aluno.id,
            hoje
          );

          // Se não tem frequência, registrar falta
          if (!frequenciaHoje) {
            await frequenciaRepository.criar({
              alunoId: aluno.id,
              data: hoje,
              horarioInicio: hoje,
              presente: false,
              tipo: 'AUTOMATICA',
              observacao: 'Falta registrada automaticamente',
            });
            faltasRegistradas++;
          }
        }

        console.log(`✅ Job concluído: ${faltasRegistradas} faltas registradas`);
      } catch (error) {
        console.error('❌ Erro no job de faltas automáticas:', error);
      }
    });
  }
}

module.exports = new FrequenciaJob();