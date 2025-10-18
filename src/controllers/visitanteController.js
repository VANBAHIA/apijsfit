// src/controllers/visitanteController.js

const visitanteService = require('../services/visitanteService');

class VisitanteController {

    async criar(req, res) {
        try {
            const empresaId = req.empresaId;
           
            const visitante = await visitanteService.criar({ ...req.body, empresaId });
            res.status(201).json(visitante);
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async listarTodos(req, res) {
        try {
            const empresaId = req.empresaId;
            const resultado = await visitanteService.listarTodos({ ...req.query, empresaId });
            res.status(200).json(resultado);
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
       
            const empresaId = req.empresaId;
            const visitante = await visitanteService.atualizar(req.params.id, { ...req.body, empresaId });
            res.status(200).json(visitante);
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    }


    /**
     * Buscar visitante por ID
     */
    async buscarPorId(req, res) {
        try {
            const visitante = await visitanteService.buscarPorId(req.params.id);
            res.status(200).json(visitante);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }


    /**
     * Deletar visitante
     */
    async deletar(req, res) {
        try {
            const resultado = await visitanteService.deletar(req.params.id);
            res.status(200).json(resultado);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }

    /**
     * Relatório de visitantes por período
     */
    async relatorioPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            const relatorio = await visitanteService.relatorioPorPeriodo(dataInicio, dataFim);
            res.status(200).json(relatorio);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                error: error.message
            });
        }
    }
}

module.exports = new VisitanteController();