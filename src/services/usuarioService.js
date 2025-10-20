const usuarioRepository = require('../repositories/usuarioRepository');
const empresaRepository = require('../repositories/empresaRepository');
const licencaRepository = require('../repositories/licencaRepository');
const ApiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { aplicarTemplatePerfil } = require('../config/permissoesPadrao');

class UsuarioService {
  async criar(data) {
    if (!data.nomeUsuario || !data.senha || !data.nome || !data.email) {
      throw new ApiError(400, 'Nome de usuário, senha, nome e email são obrigatórios');
    }

    if (!data.empresaId) {
      throw new ApiError(400, 'empresaId é obrigatório');
    }

    // Validar empresa
    const empresa = await empresaRepository.buscarPorId(data.empresaId);
    if (!empresa) throw new ApiError(404, 'Empresa não encontrada');
    if (empresa.situacao !== 'ATIVO') throw new ApiError(400, 'Empresa não está ativa');

    // Validar licença ativa
    const licenca = await licencaRepository.buscarLicencaAtiva(data.empresaId);
    if (!licenca) throw new ApiError(400, 'Empresa não possui licença ativa');

    // Validar limite de usuários
    const totalUsuarios = await usuarioRepository.contarPorEmpresa(data.empresaId);
    if (totalUsuarios >= licenca.maxUsuarios) {
      throw new ApiError(400, `Limite de usuários atingido (${licenca.maxUsuarios})`);
    }

    // Duplicidade de nome de usuário
    const nomeUsuarioExistente = await usuarioRepository.buscarPorNomeUsuario(data.nomeUsuario, data.empresaId);
    console.log(nomeUsuarioExistente);
    if (nomeUsuarioExistente) throw new ApiError(400, 'Nome de usuário já cadastrado');

    // Duplicidade de email
    const emailExistente = await usuarioRepository.buscarPorEmail(data.email);
    if (emailExistente) throw new ApiError(400, 'Email já cadastrado');

    // Hash da senha
    data.senha = await bcrypt.hash(data.senha, 10);

    // Valores padrão
    data.perfil = data.perfil || 'USUARIO';
    data.situacao = data.situacao || 'ATIVO';

    // Aplicar permissões padrão
    if (!data.permissoes || Object.keys(data.permissoes).length === 0) {
      data.permissoes = aplicarTemplatePerfil(data.perfil);
    }

    return await usuarioRepository.criar(data);
  }

  async login(nomeUsuario, senha, empresaId) {
    if (!empresaId) throw new ApiError(400, 'Empresa não selecionada');

    const usuario = await usuarioRepository.buscarPorNomeUsuario(nomeUsuario, empresaId);
    if (!usuario) throw new ApiError(401, 'Credenciais inválidas');

    // SUPER_ADMIN pode logar em qualquer empresa
    if (usuario.perfil !== 'SUPER_ADMIN' && usuario.empresaId !== empresaId) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    if (usuario.situacao !== 'ATIVO') {
      throw new ApiError(401, `Usuário ${usuario.situacao.toLowerCase()}`);
    }

    // Empresa alvo para validar
    const empresaParaValidar =
      usuario.perfil === 'SUPER_ADMIN'
        ? await empresaRepository.buscarPorId(empresaId)
        : usuario.empresa;

    if (!empresaParaValidar) throw new ApiError(401, 'Empresa não encontrada');
    if (empresaParaValidar.situacao !== 'ATIVO') throw new ApiError(401, 'Empresa não está ativa');

    // Validar licença
    let licenca = null;
    if (usuario.perfil === 'SUPER_ADMIN') {
      // Licença virtual vitalícia
      const dataExpiracao = new Date();
      dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 100);

      licenca = {
        tipo: 'VITALICIA',
        dataInicio: new Date(),
        dataExpiracao,
        maxUsuarios: 999999,
        maxAlunos: 999999,
        funcionalidades: ['TODAS'],
        observacoes: 'Licença virtual para SUPER_ADMIN',
        diasRestantes: 36500,
      };
    } else {
      if (!empresaParaValidar.licencas || empresaParaValidar.licencas.length === 0) {
        throw new ApiError(401, 'Empresa sem licença ativa');
      }

      licenca = empresaParaValidar.licencas[0];
      if (licenca.situacao !== 'ATIVA') throw new ApiError(401, `Licença ${licenca.situacao.toLowerCase()}`);
      if (new Date() > licenca.dataExpiracao) throw new ApiError(401, 'Licença expirada');
    }

    // Validar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) throw new ApiError(401, 'Credenciais inválidas');

    // Atualizar último acesso
    await usuarioRepository.atualizarUltimoAcesso(usuario.id);

    // Token usa empresa selecionada para SUPER_ADMIN
    const empresaIdToken = usuario.perfil === 'SUPER_ADMIN' ? empresaId : usuario.empresaId;

    const token = jwt.sign(
      {
        id: usuario.id,
        nomeUsuario: usuario.nomeUsuario,
        empresaId: empresaIdToken,
        perfil: usuario.perfil,
        permissoes: usuario.permissoes,
      },
      process.env.JWT_SECRET || 'secret-key-change-in-production',
      { expiresIn: '8h' }
    );

    const agora = new Date();
    const diasRestantes = Math.ceil((licenca.dataExpiracao - agora) / (1000 * 60 * 60 * 24));

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
          id: empresaParaValidar.id,
          razaoSocial: empresaParaValidar.razaoSocial,
          nomeFantasia: empresaParaValidar.nomeFantasia,
        },
        licenca: {
          tipo: licenca.tipo,
          dataExpiracao: licenca.dataExpiracao,
          funcionalidades: licenca.funcionalidades,
          diasRestantes: diasRestantes > 36500 ? '∞' : diasRestantes,
        },
      },
    };
  }

  async buscarTodos({ empresaId, perfil, situacao, skip = 0, take = 10 }) {
    if (perfil === 'SUPER_ADMIN') {

      if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
      return await usuarioRepository.buscarTodos();
    } else {
      if (!empresaId) throw new ApiError(400, 'empresaId é obrigatório');
      return await usuarioRepository.buscarTodos({ empresaId, perfil, situacao, skip, take });
    }
  }

  async buscarPorId(id) {
    let usuario;

    usuario = await usuarioRepository.buscarPorId(id);


    if (!usuario) throw new ApiError(404, 'Usuário não encontrado');
    return usuario;
  }


  async atualizar(id, data) {
  const usuario = await usuarioRepository.buscarPorId(id);

  if (!usuario) throw new ApiError(404, 'Usuário não encontrado');

  // ✅ Remover campos não alteráveis
  delete data.empresaId;
  
  // ✅ Se o nomeUsuario não foi alterado, remover do objeto data
  if (data.nomeUsuario === usuario.nomeUsuario) {
    delete data.nomeUsuario;
  }

  if (data.perfil && data.perfil !== usuario.perfil) {
    data.permissoes = aplicarTemplatePerfil(data.perfil);
  }

  if (data.senha) {
    data.senha = await bcrypt.hash(data.senha, 10);
  }

  return await usuarioRepository.atualizar(id, data);
}

  async alterarSenha(id, senhaAtual, novaSenha, empresaId, perfilUsuario) {
    const usuario =
      perfilUsuario === 'SUPER_ADMIN'
        ? await usuarioRepository.buscarPorId(id)
        : await usuarioRepository.buscarPorIdEmpresa(id, empresaId);

    if (!usuario) throw new ApiError(404, 'Usuário não encontrado');

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
    if (!senhaValida) throw new ApiError(401, 'Senha atual incorreta');

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    return await usuarioRepository.atualizar(id, { senha: senhaHash });
  }

  async deletar(id, empresaId, perfilUsuario) {
    const usuario =
      perfilUsuario === 'SUPER_ADMIN'
        ? await usuarioRepository.buscarPorId(id)
        : await usuarioRepository.buscarPorIdEmpresa(id, empresaId);

    if (!usuario) throw new ApiError(404, 'Usuário não encontrado');

    if (usuario.perfil === 'ADMIN') {
      const admins = await usuarioRepository.buscarTodos({
        empresaId: usuario.empresaId,
        perfil: 'ADMIN',
        situacao: 'ATIVO',
      });
      if (admins.usuarios.length === 1) {
        throw new ApiError(400, 'Não é possível deletar o único administrador da empresa');
      }
    }

    return await usuarioRepository.deletar(id);
  }

  async alterarSituacao(id, situacao, empresaId, perfilUsuario) {
    const validas = ['ATIVO', 'INATIVO', 'BLOQUEADO'];
    if (!validas.includes(situacao)) throw new ApiError(400, 'Situação inválida');

    const usuario =
      perfilUsuario === 'SUPER_ADMIN'
        ? await usuarioRepository.buscarPorId(id)
        : await usuarioRepository.buscarPorIdEmpresa(id, empresaId);

    if (!usuario) throw new ApiError(404, 'Usuário não encontrado');

    if (usuario.perfil === 'ADMIN' && situacao !== 'ATIVO') {
      const admins = await usuarioRepository.buscarTodos({
        empresaId: usuario.empresaId,
        perfil: 'ADMIN',
        situacao: 'ATIVO',
      });
      if (admins.usuarios.length === 1) {
        throw new ApiError(400, 'Não é possível inativar o único administrador da empresa');
      }
    }

    return await usuarioRepository.atualizar(id, { situacao });
  }

  async validarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-change-in-production');

      const usuario = await usuarioRepository.buscarPorId(decoded.id);
      if (!usuario || usuario.situacao !== 'ATIVO') throw new ApiError(401, 'Token inválido');

      return { valido: true, usuario: decoded };
    } catch (error) {
      throw new ApiError(401, 'Token inválido ou expirado');
    }
  }
}

module.exports = new UsuarioService();
