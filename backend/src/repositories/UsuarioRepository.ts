import pool from "../config/database";
import { Usuario } from "../entities/Usuario";
import type { ResultSetHeader } from "mysql2";

interface UsuarioBanco {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  cpf: string;
  criado_em: Date;
  atualizado_em: Date;
}

interface DadosNovoUsuario {
  nome: string;
  email: string;
  cpf: string;
  senhaHash: string;
}

interface DadosAtualizacaoPerfil {
  nome: string;
  cpf: string;
}

export class UsuarioRepository {
  private converterParaEntidade(registro: UsuarioBanco): Usuario {
    return new Usuario(
      registro.id,
      registro.nome,
      registro.email,
      registro.cpf,
      registro.criado_em,
      registro.atualizado_em,
    );
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [linhas] = await pool.execute(
      `SELECT
        id,
        nome,
        email,
        cpf,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE email = ?`,
      [email],
    );

    const usuarios = linhas as UsuarioBanco[];

    if (usuarios.length === 0) {
      return null;
    }

    return this.converterParaEntidade(usuarios[0]);
  }

  async buscarCredenciaisPorEmail(
    email: string,
  ): Promise<{ usuario: Usuario; senhaHash: string } | null> {
    const [linhas] = await pool.execute(
      `SELECT
        id,
        nome,
        email,
        senha,
        cpf,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE email = ?`,
      [email],
    );

    const usuarios = linhas as UsuarioBanco[];

    if (usuarios.length === 0) {
      return null;
    }

    const registro = usuarios[0];

    if (!registro.senha) {
      return null;
    }

    return {
      usuario: this.converterParaEntidade(registro),
      senhaHash: registro.senha,
    };
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const [linhas] = await pool.execute(
      `SELECT
        id,
        nome,
        email,
        cpf,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE id = ?`,
      [id],
    );

    const usuarios = linhas as UsuarioBanco[];

    if (usuarios.length === 0) {
      return null;
    }

    return this.converterParaEntidade(usuarios[0]);
  }

  async buscarPorCpf(cpf: string): Promise<Usuario | null> {
    const [linhas] = await pool.execute(
      `SELECT
        id,
        nome,
        email,
        cpf,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE cpf = ?`,
      [cpf],
    );

    const usuarios = linhas as UsuarioBanco[];

    if (usuarios.length === 0) {
      return null;
    }

    return this.converterParaEntidade(usuarios[0]);
  }

  async criar(dados: DadosNovoUsuario): Promise<Usuario> {
    const [resultado] = await pool.execute<ResultSetHeader>(
      `INSERT INTO usuarios (
        nome,
        email,
        senha,
        cpf
      ) VALUES (?, ?, ?, ?)`,
      [dados.nome, dados.email, dados.senhaHash, dados.cpf],
    );

    const usuarioCriado = await this.buscarPorId(resultado.insertId);

    if (!usuarioCriado) {
      throw new Error("Não foi possível recuperar o usuário cadastrado.");
    }

    return usuarioCriado;
  }

  async atualizarPerfil(
    id: number,
    dados: DadosAtualizacaoPerfil,
  ): Promise<Usuario> {
    await pool.execute<ResultSetHeader>(
      `UPDATE usuarios
      SET nome = ?, cpf = ?
      WHERE id = ?`,
      [dados.nome, dados.cpf, id],
    );

    const usuarioAtualizado = await this.buscarPorId(id);

    if (!usuarioAtualizado) {
      throw new Error("Não foi possível recuperar o usuário atualizado.");
    }

    return usuarioAtualizado;
  }
}
