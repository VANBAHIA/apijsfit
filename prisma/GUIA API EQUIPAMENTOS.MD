# Guia: Implementar Vínculo Exercício-Equipamento (Many-to-Many)

## 📋 Visão Geral
Implementaremos um relacionamento **muitos-para-muitos** entre Exercícios e Equipamentos, permitindo:
- ✅ Um exercício em vários equipamentos
- ✅ Um equipamento com vários exercícios
- ✅ Manter histórico de disponibilidade

---

## 🗄️ 1. Atualizar Schema Prisma

### Arquivo: `prisma/schema.prisma`

```prisma
// Modelo de junção (tabela de relacionamento)
model ExercicioEquipamento {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  exercicioId String      @db.ObjectId
  exercicio   Exercicio   @relation("ExercicioEquipamentos", fields: [exercicioId], references: [id], onDelete: Cascade)
  equipamentoId String    @db.ObjectId
  equipamento Equipamento @relation("EquipamentoExercicios", fields: [equipamentoId], references: [id], onDelete: Cascade)
  
  // Metadados opcionais
  descricaoUso String?    // Ex: "Usar com cuidado - ajustar altura"
  disponivel   Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // Índices para performance
  @@unique([exercicioId, equipamentoId]) // Evita duplicatas
  @@index([exercicioId])
  @@index([equipamentoId])
  @@map("exercicio_equipamentos")
}

// Atualizar modelo Exercicio
model Exercicio {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  nome       String
  descricao  String?
  musculos   String[]
  empresaId  String   @db.ObjectId
  empresa    Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  grupoId    String?  @db.ObjectId
  grupo      GrupoExercicio? @relation(fields: [grupoId], references: [id], onDelete: SetNull)
  imagemUrl  String?
  
  // ✅ NOVO: Relacionamento com equipamentos
  equipamentos ExercicioEquipamento[] @relation("ExercicioEquipamentos")
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([empresaId])
  @@index([grupoId])
  @@map("exercicios")
}

// Atualizar modelo Equipamento
model Equipamento {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  codigo    String
  nome      String
  empresaId String   @db.ObjectId
  empresa   Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  
  // ✅ NOVO: Relacionamento com exercícios
  exercicios ExercicioEquipamento[] @relation("EquipamentoExercicios")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([codigo, empresaId])
  @@index([empresaId])
  @@index([codigo])
  @@map("equipamentos")
}
```

### Executar migração:
```bash
npx prisma migrate dev --name add_exercicio_equipamento_relation
```

---

## 📁 2. Criar Repository

### Arquivo: `src/repositories/exercicioEquipamentoRepository.js`

```javascript
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
```

---

## 🔧 3. Criar Service

### Arquivo: `src/services/exercicioEquipamentoService.js`

```javascript
const exercicioEquipamentoRepository = require('../repositories/exercicioEquipamentoRepository');
const exercicioRepository = require('../repositories/exercicioRepository');
const equipamentoRepository = require('../repositories/equipamentoRepository');
const ApiError = require('../utils/apiError');

class ExercicioEquipamentoService {
  /**
   * Vincular um exercício a um equipamento
   */
  async vincularExercicioEquipamento(exercicioId, equipamentoId, empresaId, descricaoUso = null) {
    // 1. Validar se exercício existe e pertence à empresa
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado nesta empresa');
    }

    // 2. Validar se equipamento existe e pertence à empresa
    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) {
      throw new ApiError(404, 'Equipamento não encontrado nesta empresa');
    }

    // 3. Verificar se já existe vínculo
    const vinculoExistente = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (vinculoExistente) {
      throw new ApiError(400, 'Este exercício já está vinculado a este equipamento');
    }

    // 4. Criar vínculo
    return await exercicioEquipamentoRepository.vincular(
      exercicioId,
      equipamentoId,
      descricaoUso
    );
  }

  /**
   * Listar equipamentos de um exercício com suas informações completas
   */
  async obterEquipamentosDoExercicio(exercicioId, empresaId) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado');
    }

    return await exercicioEquipamentoRepository.buscarEquipamentosPorExercicio(
      exercicioId,
      empresaId
    );
  }

  /**
   * Listar exercícios de um equipamento
   */
  async obterExerciciosDoEquipamento(equipamentoId, empresaId) {
    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) {
      throw new ApiError(404, 'Equipamento não encontrado');
    }

    return await exercicioEquipamentoRepository.buscarExerciciosPorEquipamento(
      equipamentoId,
      empresaId
    );
  }

  /**
   * Desvincular exercício de equipamento
   */
  async desvincularExercicioEquipamento(exercicioId, equipamentoId, empresaId) {
    // Validar que ambos existem
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) throw new ApiError(404, 'Exercício não encontrado');

    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) throw new ApiError(404, 'Equipamento não encontrado');

    // Verificar se vínculo existe
    const vinculo = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (!vinculo) {
      throw new ApiError(404, 'Vínculo não encontrado');
    }

    return await exercicioEquipamentoRepository.desvincular(exercicioId, equipamentoId);
  }

  /**
   * Atualizar metadados do vínculo (ex: descrição de uso, disponibilidade)
   */
  async atualizarVinculo(exercicioId, equipamentoId, empresaId, dados) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) throw new ApiError(404, 'Exercício não encontrado');

    const equipamento = await equipamentoRepository.buscarPorId(equipamentoId, empresaId);
    if (!equipamento) throw new ApiError(404, 'Equipamento não encontrado');

    const vinculo = await exercicioEquipamentoRepository.buscarVinculo(
      exercicioId,
      equipamentoId
    );
    if (!vinculo) {
      throw new ApiError(404, 'Vínculo não encontrado');
    }

    return await exercicioEquipamentoRepository.atualizar(exercicioId, equipamentoId, dados);
  }

  /**
   * Buscar informações completas do exercício com seus equipamentos
   */
  async obterExercicioComEquipamentos(exercicioId, empresaId) {
    const exercicio = await exercicioRepository.buscarPorId(exercicioId, empresaId);
    if (!exercicio) {
      throw new ApiError(404, 'Exercício não encontrado');
    }

    const equipamentos = await exercicioEquipamentoRepository.buscarEquipamentosPorExercicio(
      exercicioId,
      empresaId
    );

    return {
      exercicio,
      equipamentos: equipamentos.map(e => ({
        id: e.equipamento.id,
        codigo: e.equipamento.codigo,
        nome: e.equipamento.nome,
        descricaoUso: e.descricaoUso,
        disponivel: e.disponivel,
        vinculoId: e.id
      }))
    };
  }
}

module.exports = new ExercicioEquipamentoService();
```

---

## 🛣️ 4. Criar Rotas

### Arquivo: `src/routes/exercicioEquipamentoRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const exercicioEquipamentoController = require('../controllers/exercicioEquipamentoController');
const { verificarAutenticacao } = require('../middlewares/auth');
const { setEmpresaContext } = require('../middlewares/empresaContext');

/**
 * @route   POST /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Vincular exercício a equipamento
 */
router.post(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.vincular
);

/**
 * @route   GET /api/exercicios/:exercicioId/equipamentos
 * @desc    Listar equipamentos de um exercício
 */
router.get(
  '/:exercicioId/equipamentos',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.listarEquipamentosDoExercicio
);

/**
 * @route   GET /api/exercicios/:exercicioId/completo
 * @desc    Obter exercício com todos seus equipamentos
 */
router.get(
  '/:exercicioId/completo',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.obterExercicioCompleto
);

/**
 * @route   DELETE /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Desvincular exercício de equipamento
 */
router.delete(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.desvincular
);

/**
 * @route   PATCH /api/exercicios/:exercicioId/equipamentos/:equipamentoId
 * @desc    Atualizar vínculo (descrição, disponibilidade)
 */
router.patch(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.atualizarVinculo
);

/**
 * ROTAS INVERSAS - Por Equipamento
 */

/**
 * @route   GET /api/equipamentos/:equipamentoId/exercicios
 * @desc    Listar exercícios de um equipamento
 */
router.get(
  '/equipamentos/:equipamentoId/exercicios',
  verificarAutenticacao,
  setEmpresaContext,
  exercicioEquipamentoController.listarExerciciosDoEquipamento
);

module.exports = router;
```

---

## 🎮 5. Criar Controller

### Arquivo: `src/controllers/exercicioEquipamentoController.js`

```javascript
const exercicioEquipamentoService = require('../services/exercicioEquipamentoService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class ExercicioEquipamentoController {
  /**
   * Vincular exercício a equipamento
   */
  vincular = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const { descricaoUso } = req.body;
    const empresaId = req.empresaId;

    const resultado = await exercicioEquipamentoService.vincularExercicioEquipamento(
      exercicioId,
      equipamentoId,
      empresaId,
      descricaoUso
    );

    res.status(201).json(
      new ApiResponse(201, resultado, 'Exercício vinculado ao equipamento com sucesso')
    );
  });

  /**
   * Listar equipamentos de um exercício
   */
  listarEquipamentosDoExercicio = asyncHandler(async (req, res) => {
    const { exercicioId } = req.params;
    const empresaId = req.empresaId;

    const equipamentos = await exercicioEquipamentoService.obterEquipamentosDoExercicio(
      exercicioId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, equipamentos, 'Equipamentos do exercício listados com sucesso')
    );
  });

  /**
   * Obter exercício completo com equipamentos
   */
  obterExercicioCompleto = asyncHandler(async (req, res) => {
    const { exercicioId } = req.params;
    const empresaId = req.empresaId;

    const resultado = await exercicioEquipamentoService.obterExercicioComEquipamentos(
      exercicioId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, resultado, 'Exercício com equipamentos obtido com sucesso')
    );
  });

  /**
   * Listar exercícios de um equipamento
   */
  listarExerciciosDoEquipamento = asyncHandler(async (req, res) => {
    const { equipamentoId } = req.params;
    const empresaId = req.empresaId;

    const exercicios = await exercicioEquipamentoService.obterExerciciosDoEquipamento(
      equipamentoId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, exercicios, 'Exercícios do equipamento listados com sucesso')
    );
  });

  /**
   * Desvincular exercício de equipamento
   */
  desvincular = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const empresaId = req.empresaId;

    await exercicioEquipamentoService.desvincularExercicioEquipamento(
      exercicioId,
      equipamentoId,
      empresaId
    );

    res.status(200).json(
      new ApiResponse(200, null, 'Exercício desvinculado do equipamento com sucesso')
    );
  });

  /**
   * Atualizar vínculo
   */
  atualizarVinculo = asyncHandler(async (req, res) => {
    const { exercicioId, equipamentoId } = req.params;
    const { descricaoUso, disponivel } = req.body;
    const empresaId = req.empresaId;

    const dados = {};
    if (descricaoUso !== undefined) dados.descricaoUso = descricaoUso;
    if (disponivel !== undefined) dados.disponivel = disponivel;

    const resultado = await exercicioEquipamentoService.atualizarVinculo(
      exercicioId,
      equipamentoId,
      empresaId,
      dados
    );

    res.status(200).json(
      new ApiResponse(200, resultado, 'Vínculo atualizado com sucesso')
    );
  });
}

module.exports = new ExercicioEquipamentoController();
```

---

## 📝 6. Registrar Rotas no Index

### Arquivo: `src/routes/index.js`

```javascript
// ... imports existentes ...
const exercicioEquipamentoRoutes = require('./exercicioEquipamentoRoutes');

// ... outros routes ...

// Registrar rotas de exercício-equipamento
router.use('/exercicios', exercicioEquipamentoRoutes);

// ... resto do arquivo ...
```

---

## 📚 7. Exemplos de Uso via API

### Vincular Exercício a Equipamento
```bash
POST /api/exercicios/EXC001/equipamentos/EQ001
Content-Type: application/json
Authorization: Bearer {token}

{
  "descricaoUso": "Usar com atenção às mãos"
}
```

**Resposta:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Exercício vinculado ao equipamento com sucesso",
  "data": {
    "id": "VINC001",
    "exercicioId": "EXC001",
    "equipamentoId": "EQ001",
    "descricaoUso": "Usar com atenção às mãos",
    "disponivel": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

### Listar Equipamentos de um Exercício
```bash
GET /api/exercicios/EXC001/equipamentos
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Equipamentos do exercício listados com sucesso",
  "data": [
    {
      "id": "VINC001",
      "exercicioId": "EXC001",
      "equipamentoId": "EQ001",
      "descricaoUso": "Usar com atenção às mãos",
      "disponivel": true,
      "equipamento": {
        "id": "EQ001",
        "codigo": "EQ00001",
        "nome": "Haltere 10kg"
      }
    },
    {
      "id": "VINC002",
      "exercicioId": "EXC001",
      "equipamentoId": "EQ002",
      "descricaoUso": null,
      "disponivel": true,
      "equipamento": {
        "id": "EQ002",
        "codigo": "EQ00002",
        "nome": "Barra Reta"
      }
    }
  ]
}
```

---

### Obter Exercício Completo
```bash
GET /api/exercicios/EXC001/completo
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "statusCode": 200,
  "success": true,
  "data": {
    "exercicio": {
      "id": "EXC001",
      "nome": "Rosca Direta",
      "descricao": "Exercício para bíceps",
      "musculos": ["Bíceps", "Braquial"],
      "imagemUrl": "https://...",
      "createdAt": "2025-01-15T08:00:00Z"
    },
    "equipamentos": [
      {
        "id": "EQ001",
        "codigo": "EQ00001",
        "nome": "Haltere 10kg",
        "descricaoUso": "Usar com atenção às mãos",
        "disponivel": true,
        "vinculoId": "VINC001"
      },
      {
        "id": "EQ002",
        "codigo": "EQ00002",
        "nome": "Barra Reta",
        "descricaoUso": null,
        "disponivel": true,
        "vinculoId": "VINC002"
      }
    ]
  }
}
```

---

### Listar Exercícios de um Equipamento
```bash
GET /api/equipamentos/EQ001/exercicios
Authorization: Bearer {token}
```

---

### Desvincular
```bash
DELETE /api/exercicios/EXC001/equipamentos/EQ001
Authorization: Bearer {token}
```

---

## ✅ Checklist de Implementação

- [ ] Atualizar schema Prisma
- [ ] Executar migração
- [ ] Criar Repository
- [ ] Criar Service
- [ ] Criar Controller
- [ ] Criar Rotas
- [ ] Registrar rotas no index
- [ ] Testar endpoints com Postman/Insomnia
- [ ] Adicionar validações de permissões
- [ ] Atualizar documentação da API

---

## 🔐 Implementar Permissões (Opcional)

Adicionar ao `src/config/permissoesPadrao.js`:

```javascript
// Em TEMPLATES_PERFIS > ADMIN > modulos
exercicioEquipamentos: {
  acessar: true,
  vincular: true,
  desvincular: true,
  editar: true
}
```

Aplicar middleware nas rotas:
```javascript
router.post(
  '/:exercicioId/equipamentos/:equipamentoId',
  verificarAutenticacao,
  setEmpresaContext,
  verificarPermissaoModulo('exercicioEquipamentos', 'vincular'),
  exercicioEquipamentoController.vincular
);
```

---

## 🧹 Melhorias Futuras

1. **Bulk Operations**: Vincular múltiplos equipamentos de uma vez
2. **Soft Delete**: Ao invés de deletar, marcar como desativado
3. **Histórico**: Manter log de quando foi vinculado/desvinculado
4. **Cache**: Redis para queries frequentes
5. **Query Otimizada**: Incluir equipamentos ao buscar exercício automaticamente