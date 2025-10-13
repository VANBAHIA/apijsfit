const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const jobScheduler = require('../jobs/scheduler');

class JobController {
  
  executarGeracaoCobrancas = asyncHandler(async (req, res) => {
    const resultado = await jobScheduler.executarManualmente();
    
    res.status(200).json(
      new ApiResponse(200, resultado, 'Job executado com sucesso')
    );
  });
}

module.exports = new JobController();