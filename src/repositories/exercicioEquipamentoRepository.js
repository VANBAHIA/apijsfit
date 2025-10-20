const prisma = require('../config/database');

class ExercicioEquipamentoRepository {
  // Vincular exercício a equipamento
  async vincular(exercicioId, equipamentoId, descricaoUso = null) {
    return await prisma.exercicioEquipamento.create({
      data: {
        exercicioId,
        equipamentoId,
        descricaoUso,
        disponivel: true
      }
    });
  }

  // Buscar vínculo existente
  async buscarVinculo(exercicioId, equipamentoId) {
    return await prisma.exercicioEquipamento.findUnique({
      where: {
        exercicioId_equipamentoId: {
          exercicioId,
          equipamentoId
        }
      }
    });
  }

  // Listar todos os equipamentos de um exercício
  async buscarEquipamentosPorExercicio(exercicioId, empresaId) {
    return await prisma.exercicioEquipamento.findMany({
      where: {
        exercicioId,
        equipamento: { empresaId } // Validar empresa
      },
      include: {
        equipamento: {
          select: {
            id: true,
            codigo: true,
            nome: true
          }
        }
      }
    });
  }

  // Listar todos os exercícios de um equipamento
  async buscarExerciciosPorEquipamento(equipamentoId, empresaId) {
    return await prisma.exercicioEquipamento.findMany({
      where: {
        equipamentoId,
        exercicio: { empresaId } // Validar empresa
      },
      include: {
        exercicio: {
          select: {
            id: true,
            nome: true,
            musculos: true,
            imagemUrl: true
          }
        }
      }
    });
  }

  // Desvincular exercício de equipamento
  async desvincular(exercicioId, equipamentoId) {
    return await prisma.exercicioEquipamento.delete({
      where: {
        exercicioId_equipamentoId: {
          exercicioId,
          equipamentoId
        }
      }
    });
  }

  // Atualizar metadados do vínculo
  async atualizar(exercicioId, equipamentoId, dados) {
    return await prisma.exercicioEquipamento.update({
      where: {
        exercicioId_equipamentoId: {
          exercicioId,
          equipamentoId
        }
      },
      data: dados
    });
  }

  // Contar quantos equipamentos um exercício usa
  async contarEquipamentos(exercicioId) {
    return await prisma.exercicioEquipamento.count({
      where: { exercicioId }
    });
  }

  // Contar quantos exercícios um equipamento tem
  async contarExercicios(equipamentoId) {
    return await prisma.exercicioEquipamento.count({
      where: { equipamentoId }
    });
  }

  // Deletar todos os vínculos de um exercício (quando deletar exercício)
  async deletarPorExercicio(exercicioId) {
    return await prisma.exercicioEquipamento.deleteMany({
      where: { exercicioId }
    });
  }

  // Deletar todos os vínculos de um equipamento (quando deletar equipamento)
  async deletarPorEquipamento(equipamentoId) {
    return await prisma.exercicioEquipamento.deleteMany({
      where: { equipamentoId }
    });
  }
}

module.exports = new ExercicioEquipamentoRepository();