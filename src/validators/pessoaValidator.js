const { body, param } = require('express-validator');

const pessoaValidator = {
  criar: [
    body('codigo')
      .optional()  // ← Adicionar .optional()
      .isString()
      .withMessage('Código deve ser uma string'),
    body('tipo').isIn(['FISICA', 'JURIDICA']).withMessage('Tipo deve ser FISICA ou JURIDICA'),
    body('nome1').notEmpty().withMessage('Nome é obrigatório'),
    body('doc1').optional().isLength({ min: 11, max: 14 }).withMessage('CPF deve ter 11 dígitos, ou 14 para CNPJ'),
    body('enderecos').optional().isArray().withMessage('Endereços deve ser um array'),
    body('contatos').optional().isArray().withMessage('Contatos deve ser um array'),
  ],

  atualizar: [
    param('id').isMongoId().withMessage('ID inválido'),
    body('codigo').optional().notEmpty().withMessage('Código não pode ser vazio'),
    body('tipo').optional().isIn(['FISICA', 'JURIDICA']).withMessage('Tipo inválido'),
    body('nome1').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  ],

  buscarPorId: [
    param('id').isMongoId().withMessage('ID inválido'),
  ],

  deletar: [
    param('id').isMongoId().withMessage('ID inválido'),
  ],
};

module.exports = pessoaValidator;