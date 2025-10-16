const usuarioRepository = require('../repositories/UsuarioRepository');
const empresaRepository = require('../repositories/empresaRepository');
const licencaRepository = require('../repositories/licencaRepository');
const ApiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { aplicarTemplatePerfil } = require('../config/permissoesPadrao');

class UsuarioService {
  async criar(data) {
    // Validações básicas
    if (!data.nomeUsuario || !data.senha || !data.nome || !data.email) {
      throw new ApiError(400, 'Nome de usuário, senha, nome e email são obrigatórios');
    }

    if (!data.empresaId) {
      throw new ApiError(400, 'Empresa ID é obrigatório');
    }

    // Validar empresa
    const empresa = await empresaRepository.buscarPorId(data.empresaId);
    if (!empresa) {
      throw new ApiError(404, 'Empresa não encontrada');
    }

    if (empresa.situacao !== 'ATIVO') {
      throw new ApiError(400, 'Empresa não está ativa');
    }

    // Verificar licença ativa
    const licenca = await licencaRepository.buscarLicencaAtiva(data.empresaId);
    if (!licenca) {
      throw new ApiError(400, 'Empresa não possui licença ativa');
    }

    // Verificar limite de usuários
    const totalUsuarios = await usuarioRepository.contarPorEmpresa(data.empresaId);
    if (totalUsuarios >= licenca.maxUsuarios) {
      throw new ApiError(400, `Limite de usuários atingido (${licenca.maxUsuarios})`);
    }

    // Validar duplicidade de nome de usuário
    const nomeUsuarioExistente = await usuarioRepository.buscarPorNomeUsuario(data.nomeUsuario);
    if (nomeUsuarioExistente) {
      throw new ApiError(400, 'Nome de usuário já cadastrado');
    }

    // Validar duplicidade de email
    const emailExistente = await usuarioRepository.buscarPorEmail(data.email);
    if (emailExistente) {
      throw new ApiError(400, 'Email já cadastrado');
    }

    // Hash da senha
    data.senha = await bcrypt.hash(data.senha, 10);

    // Valores padrão
    data.perfil = data.perfil || 'USUARIO';
    data.situacao = data.situacao || 'ATIVO';

    // Aplicar template de permissões
    if (!data.permissoes || Object.keys(data.permissoes).length === 0) {
      data.permissoes = aplicarTemplatePerfil(data.perfil);
    }

    return await usuarioRepository.criar(data);
  }

  async login(nomeUsuario, senha) {
    // Buscar usuário
    const usuario = await usuarioRepository.buscarPorNomeUsuario(nomeUsuario);

    if (!usuario) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    // Verificar situação do usuário
    if (usuario.situacao !== 'ATIVO') {
      throw new ApiError(401, `Usuário ${usuario.situacao.toLowerCase()}`);
    }

    // Verificar situação da empresa
    if (usuario.empresa.situacao !== 'ATIVO') {
      throw new ApiError(401, 'Empresa não está ativa');
    }

    // Verificar licença ativa
    if (!usuario.empresa.licencas || usuario.empresa.licencas.length === 0) {
      throw new ApiError(401, 'Empresa sem licença ativa');
    }

    const licenca = usuario.empresa.licencas[0];
    
    if (licenca.situacao !== 'ATIVA') {
      throw new ApiError(401, `Licença ${licenca.situacao.toLowerCase()}`);
    }

    const agora = new Date();
    if (agora > licenca.dataExpiracao) {
      throw new ApiError(401, 'Licença expirada');
    }

    // Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    // Atualizar último acesso
    await usuarioRepository.atualizarUltimoAcesso(usuario.id);

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nomeUsuario: usuario.nomeUsuario,
        empresaId: usuario.empresaId,
        perfil: usuario.perfil,
        permissoes: usuario.permissoes
      },
      process.env.JWT_SECRET || 'secret-key-change-in-production',
      { expiresIn: '8h' }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nomeUsuario: usuario.nomeUsuario,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        permissoes: usuario.permissoes,
        empresa: {
          id: usuario.empresa.id,
          razaoSocial: usuario.empresa.razaoSocial,
          nomeFantasia: usuario.empresa.nomeFantasia
        },
        licenca: {
          tipo: licenca.tipo,
          dataExpiracao: licenca.dataExpiracao,
          funcionalidades: licenca.funcionalidades,
          diasRestantes: Math.ceil((licenca.dataExpiracao - agora) / (1000 * 60 * 60 * 24))
        }
      }
    };
  }

  async buscarTodos(filtros) {
    return await usuarioRepository.buscarTodos(filtros);
  }

  async buscarPorId(id) {
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    return usuario;
  }

  async atualizar(id, data) {
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Validar nome de usuário se estiver sendo alterado
    if (data.nomeUsuario && data.nomeUsuario !== usuario.nomeUsuario) {
      const nomeUsuarioExistente = await usuarioRepository.buscarPorNomeUsuario(data.nomeUsuario);
      if (nomeUsuarioExistente) {
        throw new ApiError(400, 'Nome de usuário já cadastrado');
      }
    }

    // Validar email se estiver sendo alterado
    if (data.email && data.email !== usuario.email) {
      const emailExistente = await usuarioRepository.buscarPorEmail(data.email);
      if (emailExistente) {
        throw new ApiError(400, 'Email já cadastrado');
      }
    }

    // Se mudou perfil, atualizar permissões
    if (data.perfil && data.perfil !== usuario.perfil) {
      data.permissoes = aplicarTemplatePerfil(data.perfil);
    }

    // Hash da senha se estiver sendo alterada
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }

    return await usuarioRepository.atualizar(id, data);
  }

  async alterarSenha(id, senhaAtual, novaSenha) {
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Obter usuário com senha hash
    const usuarioComSenha = await require('../config/database').usuario.findUnique({
      where: { id }
    });

    if (!usuarioComSenha) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuarioComSenha.senha);

    if (!senhaValida) {
      throw new ApiError(401, 'Senha atual incorreta');
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    return await usuarioRepository.atualizar(id, { senha: senhaHash });
  }

  async deletar(id) {
    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Não permitir deletar se for o único admin da empresa
    if (usuario.perfil === 'ADMIN') {
      const usuarios = await usuarioRepository.buscarTodos({
        empresaId: usuario.empresaId,
        perfil: 'ADMIN',
        situacao: 'ATIVO'
      });

      if (usuarios.usuarios.length === 1) {
        throw new ApiError(400, 'Não é possível deletar o único administrador da empresa');
      }
    }

    return await usuarioRepository.deletar(id);
  }

  async alterarSituacao(id, situacao) {
    const situacoesValidas = ['ATIVO', 'INATIVO', 'BLOQUEADO'];
    
    if (!situacoesValidas.includes(situacao)) {
      throw new ApiError(400, 'Situação inválida');
    }

    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuário não encontrado');
    }

    // Não permitir inativar se for o único admin da empresa
    if (usuario.perfil === 'ADMIN' && situacao !== 'ATIVO') {
      const usuarios = await usuarioRepository.buscarTodos({
        empresaId: usuario.empresaId,
        perfil: 'ADMIN',
        situacao: 'ATIVO'
      });

      if (usuarios.usuarios.length === 1) {
        throw new ApiError(400, 'Não é possível inativar o único administrador da empresa');
      }
    }

    return await usuarioRepository.atualizar(id, { situacao });
  }

  async validarToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret-key-change-in-production'
      );

      // Buscar usuário atualizado
      const usuario = await usuarioRepository.buscarPorId(decoded.id);

      if (!usuario || usuario.situacao !== 'ATIVO') {
        throw new ApiError(401, 'Token inválido');
      }

      return {
        valido: true,
        usuario: decoded
      };
    } catch (error) {
      throw new ApiError(401, 'Token inválido ou expirado');
    }
  }
}

module.exports = new UsuarioService();