import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../entities/Usuario";
import { UsuarioRepository } from "../repositories/UsuarioRepository";

interface DadosCadastro {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

interface DadosLogin {
  email: string;
  senha: string;
}

interface DadosAtualizacaoPerfil {
  nome: string;
  cpf: string;
}

interface RespostaLogin {
  usuario: Usuario;
  token: string;
}

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
  }

  async cadastrar(dados: DadosCadastro): Promise<Usuario> {
    // 1. Verificar se os dados foram enviados corretamente.
    // Essa validação precisa acontecer antes de acessar os campos.
    if (
      !dados ||
      typeof dados.nome !== "string" ||
      typeof dados.email !== "string" ||
      typeof dados.cpf !== "string" ||
      typeof dados.senha !== "string"
    ) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    // 2. Normalizar os dados recebidos.
    const nome = dados.nome.trim();
    const email = dados.email.trim().toLowerCase();
    const cpf = dados.cpf.replace(/\D/g, "");
    const senha = dados.senha;

    // 3. Validar os campos obrigatórios.
    if (!nome || !email || !cpf || !senha) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    // 4. Validar o tamanho do nome.
    if (nome.length > 120) {
      throw new Error("O nome deve ter no máximo 120 caracteres.");
    }

    // 5. Validar o formato do e-mail.
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      throw new Error("Informe um e-mail válido.");
    }

    // 6. Validar a quantidade de dígitos do CPF.
    if (cpf.length !== 11) {
      throw new Error("O CPF deve conter 11 dígitos.");
    }

    // 7. Validar a força da senha.
    const senhaForte =
      senha.length >= 8 &&
      /[A-Z]/.test(senha) &&
      /[a-z]/.test(senha) &&
      /[0-9]/.test(senha) &&
      /[^A-Za-z0-9]/.test(senha);

    if (!senhaForte) {
      throw new Error(
        "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.",
      );
    }

    // 8. Verificar se o e-mail já está cadastrado.
    const usuarioComEmail = await this.usuarioRepository.buscarPorEmail(email);

    if (usuarioComEmail) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    // 9. Verificar se o CPF já está cadastrado.
    const usuarioComCpf = await this.usuarioRepository.buscarPorCpf(cpf);

    if (usuarioComCpf) {
      throw new Error("Este CPF já está cadastrado.");
    }

    // 10. Gerar o hash da senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    // 11. Salvar o usuário no banco de dados.
    const usuarioCriado = await this.usuarioRepository.criar({
      nome,
      email,
      cpf,
      senhaHash,
    });

    // 12. Retornar os dados sem expor a senha.
    return usuarioCriado;
  }

  async login(dados: DadosLogin): Promise<RespostaLogin> {
    // 1. Validar os dados recebidos.
    if (
      !dados ||
      typeof dados.email !== "string" ||
      typeof dados.senha !== "string" ||
      !dados.email.trim() ||
      !dados.senha
    ) {
      throw new Error("E-mail e senha são obrigatórios.");
    }

    // 2. Normalizar o e-mail.
    const email = dados.email.trim().toLowerCase();

    // 3. Validar o formato do e-mail.
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      throw new Error("Informe um e-mail válido.");
    }

    // 4. Buscar o usuário e o hash da senha.
    const credenciais =
      await this.usuarioRepository.buscarCredenciaisPorEmail(email);

    if (!credenciais) {
      throw new Error("E-mail ou senha inválidos.");
    }

    // 5. Comparar a senha informada com o hash armazenado.
    const senhaCorreta = await bcrypt.compare(
      dados.senha,
      credenciais.senhaHash,
    );

    if (!senhaCorreta) {
      throw new Error("E-mail ou senha inválidos.");
    }

    // 6. Verificar se a chave JWT está configurada.
    const chaveSecreta = process.env.JWT_SECRET;

    if (!chaveSecreta) {
      throw new Error("Configuração de autenticação indisponível.");
    }

    // 7. Gerar o token JWT.
    const token = jwt.sign(
      {
        sub: String(credenciais.usuario.id),
      },
      chaveSecreta,
      {
        expiresIn: "1h",
      },
    );

    // 8. Retornar o usuário e o token.
    return {
      usuario: credenciais.usuario,
      token,
    };
  }

  async consultarPerfil(usuarioId: number): Promise<Usuario> {
    // 1. Validar o identificador do usuário.
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      throw new Error("Identificador de usuário inválido.");
    }

    // 2. Buscar o usuário.
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    // 3. Retornar os dados sem a senha.
    return usuario;
  }

  async atualizarPerfil(
    usuarioId: number,
    dados: DadosAtualizacaoPerfil,
  ): Promise<Usuario> {
    // 1. Validar os dados antes de acessar os campos.
    if (
      !dados ||
      typeof dados.nome !== "string" ||
      typeof dados.cpf !== "string"
    ) {
      throw new Error("Nome e CPF são obrigatórios.");
    }

    // 2. Normalizar os dados.
    const nome = dados.nome.trim();
    const cpf = dados.cpf.replace(/\D/g, "");

    // 3. Validar os campos obrigatórios.
    if (!nome || !cpf) {
      throw new Error("Nome e CPF são obrigatórios.");
    }

    // 4. Validar o tamanho do nome.
    if (nome.length > 120) {
      throw new Error("O nome deve ter no máximo 120 caracteres.");
    }

    // 5. Validar a quantidade de dígitos do CPF.
    if (cpf.length !== 11) {
      throw new Error("O CPF deve conter 11 dígitos.");
    }

    // 6. Confirmar que o usuário existe.
    const usuarioAtual = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuarioAtual) {
      throw new Error("Usuário não encontrado.");
    }

    // 7. Impedir o uso de CPF pertencente a outro usuário.
    const usuarioComCpf = await this.usuarioRepository.buscarPorCpf(cpf);

    if (usuarioComCpf && usuarioComCpf.id !== usuarioId) {
      throw new Error("Este CPF já está cadastrado para outro usuário.");
    }

    // 8. Atualizar somente o nome e o CPF.
    return this.usuarioRepository.atualizarPerfil(usuarioId, {
      nome,
      cpf,
    });
  }
}
