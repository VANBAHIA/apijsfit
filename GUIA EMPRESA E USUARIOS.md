f# 📚 Exemplos de Uso da API - Sistema de Gestão

## 🏢 Empresas

### Criar Empresa
```bash
POST /api/empresas
Content-Type: application/json

{
  "razaoSocial": "Academia Fitness LTDA",
  "nomeFantasia": "Fitness Academia",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "endereco": {
    "logradouro": "Rua das Flores",
    "numero": "100",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567"
  },
  "contatos": [
    {
      "tipo": "EMAIL",
      "valor": "contato@academia.com.br",
      "principal": true
    },
    {
      "tipo": "TELEFONE",
      "valor": "(11) 3333-4444",
      "principal": true
    }
  ],
  "responsavel": "João Silva",
  "email": "joao@academia.com.br",
  "site": "https://www.academia.com.br"
}
```

### Listar Empresas
```bash
GET /api/empresas?page=1&limit=10&situacao=ATIVO
```

### Buscar Empresa por ID
```bash
GET /api/empresas/{id}
```

### Atualizar Empresa
```bash
PUT /api/empresas/{id}
Content-Type: application/json

{
  "nomeFantasia": "Novo Nome Fantasia",
  "responsavel": "Maria Santos"
}
```

### Alterar Situação
```bash
PATCH /api/empresas/{id}/situacao
Content-Type: application/json

{
  "situacao": "BLOQUEADO"
}
```

---

## 🔑 Licenças

### Gerar Chave de Licença
```bash
GET /api/licencas/gerar-chave
```

**Resposta:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Chave gerada com sucesso",
  "data": {
    "chave": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }
}
```

### Criar Licença
```bash
POST /api/licencas
Content-Type: application/json

{
  "empresaId": "60d5ec49f1b2c8b5a4e3d2c1",
  "tipo": "ANUAL",
  "maxUsuarios": 10,
  "maxAlunos": 500,
  "funcionalidades": [
    "ALUNOS",
    "FINANCEIRO",
    "TREINOS",
    "AVALIACOES",
    "RELATORIOS"
  ],
  "observacoes": "Licença para academia completa"
}
```

**Tipos de Licença:**
- `TRIAL` - 30 dias
- `MENSAL` - 1 mês
- `TRIMESTRAL` - 3 meses
- `SEMESTRAL` - 6 meses
- `ANUAL` - 1 ano
- `VITALICIA` - 100 anos

### Validar Licença
```bash
POST /api/licencas/validar
Content-Type: application/json

{
  "chave": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
}
```

**Resposta - Licença Válida:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Validação realizada",
  "data": {
    "valida": true,
    "licenca": {
      "id": "...",
      "tipo": "ANUAL",
      "dataExpiracao": "2025-10-12T00:00:00.000Z",
      "funcionalidades": ["ALUNOS", "FINANCEIRO"]
    },
    "diasRestantes": 365
  }
}
```

**Resposta - Licença Inválida:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Validação realizada",
  "data": {
    "valida": false,
    "motivo": "Licença expirada"
  }
}
```

### Renovar Licença
```bash
PATCH /api/licencas/{id}/renovar
Content-Type: application/json

{
  "tipo": "ANUAL"
}
```

### Cancelar Licença
```bash
PATCH /api/licencas/{id}/cancelar
Content-Type: application/json

{
  "motivo": "Cliente solicitou cancelamento"
}
```

### Suspender Licença
```bash
PATCH /api/licencas/{id}/suspender
Content-Type: application/json

{
  "motivo": "Pagamento em atraso"
}
```

### Reativar Licença
```bash
PATCH /api/licencas/{id}/reativar
```

---

## 👤 Usuários do Sistema

### Criar Usuário
```bash
POST /api/usuarios
Content-Type: application/json

{
  "empresaId": "60d5ec49f1b2c8b5a4e3d2c1",
  "nomeUsuario": "joao.silva",
  "nome": "João Silva",
  "email": "joao@academia.com.br",
  "senha": "senha123",
  "perfil": "GERENTE",
  "permissoes": ["ALUNOS", "FINANCEIRO", "RELATORIOS"],
  "telefone": "(11) 99999-8888"
}
```

**Perfis Disponíveis:**
- `ADMIN` - Acesso total
- `GERENTE` - Gestão operacional
- `INSTRUTOR` - Treinos e avaliações
- `USUARIO` - Acesso básico

**Permissões:**
- `ALUNOS` - Gestão de alunos
- `FINANCEIRO` - Gestão financeira
- `TREINOS` - Gestão de treinos
- `AVALIACOES` - Avaliações físicas
- `RELATORIOS` - Relatórios gerenciais
- `AGENDA` - Gestão de agenda
- `TODAS` - Todas as permissões (Admin)

### Login
```bash
POST /api/usuarios/login
Content-Type: application/json

{
  "nomeUsuario": "admin",
  "senha": "admin123"
}
```

**Resposta:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "...",
      "nomeUsuario": "admin",
      "nome": "Administrador",
      "email": "admin@academia.com.br",
      "perfil": "ADMIN",
      "permissoes": ["TODAS"],
      "empresa": {
        "id": "...",
        "razaoSocial": "Academia Fitness LTDA",
        "nomeFantasia": "Fitness Academia"
      },
      "licenca": {
        "tipo": "ANUAL",
        "dataExpiracao": "2025-10-12T00:00:00.000Z",
        "funcionalidades": ["ALUNOS", "FINANCEIRO", "TREINOS"],
        "diasRestantes": 365
      }
    }
  }
}
```

### Validar Token
```bash
POST /api/usuarios/validar-token
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Listar Usuários
```bash
GET /api/usuarios?empresaId={id}&page=1&limit=10&perfil=ADMIN&situacao=ATIVO
```

### Buscar Usuário por ID
```bash
GET /api/usuarios/{id}
```

### Atualizar Usuário
```bash
PUT /api/usuarios/{id}
Content-Type: application/json

{
  "nome": "João Silva Santos",
  "email": "joao.santos@academia.com.br",
  "telefone": "(11) 98888-7777",
  "perfil": "ADMIN"
}
```

### Alterar Senha
```bash
PATCH /api/usuarios/{id}/senha
Content-Type: application/json

{
  "senhaAtual": "senha123",
  "novaSenha": "novaSenha456"
}
```

### Alterar Situação
```bash
PATCH /api/usuarios/{id}/situacao
Content-Type: application/json

{
  "situacao": "INATIVO"
}
```

**Situações:**
- `ATIVO` - Usuário ativo
- `INATIVO` - Usuário inativo
- `BLOQUEADO` - Usuário bloqueado

---

## 🔐 Usando Autenticação nas Requisições

Após fazer login, use o token JWT no header das requisições protegidas:

```bash
GET /api/alunos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Exemplo com Middleware de Autenticação

```javascript
// Proteger rota com autenticação
const { verificarAutenticacao } = require('./middlewares/auth');

router.get('/alunos', verificarAutenticacao, alunoController.listarTodos);
```

### Exemplo com Verificação de Perfil

```javascript
// Apenas ADMIN e GERENTE podem acessar
const { verificarAutenticacao, verificarPerfil } = require('./middlewares/auth');

router.delete(
  '/alunos/:id',
  verificarAutenticacao,
  verificarPerfil('ADMIN', 'GERENTE'),
  alunoController.deletar
);
```

### Exemplo com Verificação de Permissão

```javascript
// Precisa ter permissão FINANCEIRO
const { verificarAutenticacao, verificarPermissao } = require('./middlewares/auth');

router.get(
  '/relatorios/financeiro',
  verificarAutenticacao,
  verificarPermissao('FINANCEIRO'),
  relatorioController.financeiro
);
```

### Exemplo com Verificação de Licença

```javascript
// Verifica se empresa tem licença ativa
const { verificarAutenticacao, verificarLicenca, verificarFuncionalidade } = require('./middlewares/auth');

router.get(
  '/treinos',
  verificarAutenticacao,
  verificarLicenca,
  verificarFuncionalidade('TREINOS'),
  treinoController.listar
);
```

---

## 📊 Estrutura de Resposta Padrão

### Sucesso
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { }
}
```

### Erro
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Mensagem de erro",
  "error": "Detalhes do erro"
}
```

---

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install uuid
```

### 2. Executar Seed (Dados Iniciais)
```bash
node scripts/seed.js
```

### 3. Iniciar Servidor
```bash
npm run dev
```

### 4. Testar Login
```bash
curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "nomeUsuario": "admin",
    "senha": "admin123"
  }'
```

---

## 📝 Notas Importantes

1. **Tokens JWT** expiram em 8 horas
2. **Licenças TRIAL** duram 30 dias
3. **Usuários ADMIN** não podem ser deletados se forem os únicos da empresa
4. **Licenças EXPIRADAS** bloqueiam automaticamente o acesso ao sistema
5. **Empresas BLOQUEADAS** impedem login de seus usuários
6. **Chaves de Licença** são geradas como UUID v4
7. **Senhas** são criptografadas com bcrypt (salt rounds: 10)

---

## ⚙️ Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="sua_connection_string_mongodb"
JWT_SECRET=seu_secret_jwt_aqui_muito_seguro_2024
```
