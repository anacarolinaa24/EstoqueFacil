import { Request, Response } from "express";
import { UsuarioService } from "../services/UsuarioService";
import type { RequisicaoAutenticada } from "../middlewares/autenticacaoMiddleware";

export class UsuarioController {
  private usuarioService: UsuarioService;

  constructor() {
    this.usuarioService = new UsuarioService();
  }

  cadastrar = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = await this.usuarioService.cadastrar(req.body);

      res.status(201).json({
        mensagem: "Usuário cadastrado com sucesso.",
        usuario,
      });
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        const errosDeValidacao = [
          "Todos os campos são obrigatórios.",
          "Informe um e-mail válido.",
          "O CPF deve conter 11 dígitos.",
          "Este e-mail já está cadastrado.",
          "Este CPF já está cadastrado.",
        ];

        const erroDeSenha = erro.message.startsWith(
          "A senha deve ter pelo menos",
        );

        if (errosDeValidacao.includes(erro.message) || erroDeSenha) {
          res.status(400).json({ mensagem: erro.message });
          return;
        }
      }

      console.error("Erro ao cadastrar usuário:", erro);

      res.status(500).json({
        mensagem: "Erro interno ao cadastrar usuário.",
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const resultado = await this.usuarioService.login(req.body);

      res.status(200).json({
        mensagem: "Login realizado com sucesso.",
        usuario: resultado.usuario,
        token: resultado.token,
      });
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        if (erro.message === "E-mail ou senha inválidos.") {
          res.status(401).json({ mensagem: erro.message });
          return;
        }

        const errosDeValidacao = [
          "E-mail e senha são obrigatórios.",
          "Informe um e-mail válido.",
        ];

        if (errosDeValidacao.includes(erro.message)) {
          res.status(400).json({ mensagem: erro.message });
          return;
        }

        if (erro.message === "Configuração de autenticação indisponível.") {
          res.status(500).json({ mensagem: erro.message });
          return;
        }
      }

      console.error("Erro ao realizar login:", erro);

      res.status(500).json({
        mensagem: "Erro interno ao realizar login.",
      });
    }
  };

  consultarPerfil = async (
    req: RequisicaoAutenticada,
    res: Response,
  ): Promise<void> => {
    try {
      if (!req.usuarioId) {
        res.status(401).json({
          mensagem: "Usuário não autenticado.",
        });
        return;
      }

      const usuario = await this.usuarioService.consultarPerfil(req.usuarioId);

      res.status(200).json({
        mensagem: "Perfil consultado com sucesso.",
        usuario,
      });
    } catch (erro: unknown) {
      if (erro instanceof Error && erro.message === "Usuário não encontrado.") {
        res.status(404).json({ mensagem: erro.message });
        return;
      }

      console.error("Erro ao consultar perfil:", erro);

      res.status(500).json({
        mensagem: "Erro interno ao consultar perfil.",
      });
    }
  };

  atualizarPerfil = async (
    req: RequisicaoAutenticada,
    res: Response,
  ): Promise<void> => {
    try {
      if (!req.usuarioId) {
        res.status(401).json({
          mensagem: "Usuário não autenticado.",
        });
        return;
      }

      const usuario = await this.usuarioService.atualizarPerfil(
        req.usuarioId,
        req.body,
      );

      res.status(200).json({
        mensagem: "Perfil atualizado com sucesso.",
        usuario,
      });
    } catch (erro: unknown) {
      if (erro instanceof Error) {
        const errosDeValidacao = [
          "Nome e CPF são obrigatórios.",
          "O CPF deve conter 11 dígitos.",
          "O nome deve ter no máximo 120 caracteres.",
          "Usuário não encontrado.",
          "Este CPF já está cadastrado para outro usuário.",
          "Identificador de usuário inválido.",
        ];

        if (errosDeValidacao.includes(erro.message)) {
          const status = erro.message === "Usuário não encontrado." ? 404 : 400;

          res.status(status).json({ mensagem: erro.message });
          return;
        }
      }

      console.error("Erro ao atualizar perfil:", erro);

      res.status(500).json({
        mensagem: "Erro interno ao atualizar perfil.",
      });
    }
  };
}
