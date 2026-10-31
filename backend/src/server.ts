import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database";

import { CategoriaRepository } from "./repositories/CategoriaRepository";
import { FornecedorRepository } from "./repositories/FornecedorRepository";
import { ProdutoRepository } from "./repositories/ProdutoRepository";
import { MovimentacaoRepository } from "./repositories/MovimentacaoRepository";
import { UsuarioRepository } from "./repositories/UsuarioRepository";

import usuarioRoutes from "./routes/usuarioRoutes";

import {
  autenticacaoMiddleware,
  type RequisicaoAutenticada,
} from "./middlewares/autenticacaoMiddleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Configurações principais
app.use(express.json());
app.use(cors());

// Rota inicial
app.get("/", (req, res) => {
  res.status(200).json({
    mensagem: "EstoqueFácil: backend funcionando!",
  });
});

// Rotas de cadastro e login
app.use("/usuarios", usuarioRoutes);

// Rota protegida temporária para testar o JWT
app.get(
  "/teste-protegido",
  autenticacaoMiddleware,
  (req: RequisicaoAutenticada, res) => {
    res.status(200).json({
      mensagem: "Acesso autorizado! Token JWT válido.",
      usuarioId: req.usuarioId,
    });
  },
);

// Testar conexão com o banco de dados
app.get("/teste-banco", async (req, res) => {
  try {
    const [resultado] = await pool.query("SELECT DATABASE() AS banco");

    res.status(200).json({
      mensagem: "Conexão com o banco realizada com sucesso!",
      resultado,
    });
  } catch (erro) {
    console.error("Erro ao conectar ao banco:", erro);

    res.status(500).json({
      mensagem: "Não foi possível conectar ao banco de dados.",
    });
  }
});

// Instâncias dos repositórios
const categoriaRepository = new CategoriaRepository();
const fornecedorRepository = new FornecedorRepository();
const produtoRepository = new ProdutoRepository();
const movimentacaoRepository = new MovimentacaoRepository();
const usuarioRepository = new UsuarioRepository();

// Listar categorias — rota temporária de teste
app.get("/teste-categorias", async (req, res) => {
  try {
    const categorias = await categoriaRepository.listarTodos();

    res.status(200).json(categorias);
  } catch (erro) {
    console.error("Erro ao listar categorias:", erro);

    res.status(500).json({
      mensagem: "Erro ao listar categorias.",
    });
  }
});

// Listar fornecedores — rota temporária de teste
app.get("/teste-fornecedores", async (req, res) => {
  try {
    const fornecedores = await fornecedorRepository.listarTodos();

    res.status(200).json(fornecedores);
  } catch (erro) {
    console.error("Erro ao listar fornecedores:", erro);

    res.status(500).json({
      mensagem: "Erro ao listar fornecedores.",
    });
  }
});

// Listar produtos — rota temporária de teste
app.get("/teste-produtos", async (req, res) => {
  try {
    const produtos = await produtoRepository.listarTodos();

    res.status(200).json(produtos);
  } catch (erro) {
    console.error("Erro ao listar produtos:", erro);

    res.status(500).json({
      mensagem: "Erro ao listar produtos.",
    });
  }
});

// Listar movimentações — rota temporária de teste
app.get("/teste-movimentacoes", async (req, res) => {
  try {
    const movimentacoes = await movimentacaoRepository.listarTodos();

    res.status(200).json(movimentacoes);
  } catch (erro) {
    console.error("Erro ao listar movimentações:", erro);

    res.status(500).json({
      mensagem: "Erro ao listar movimentações.",
    });
  }
});

// Buscar usuário por ID — rota temporária de teste
app.get("/teste-usuario/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensagem: "Informe um ID de usuário válido.",
      });
      return;
    }

    const usuario = await usuarioRepository.buscarPorId(id);

    if (!usuario) {
      res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
      return;
    }

    res.status(200).json(usuario);
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);

    res.status(500).json({
      mensagem: "Erro ao buscar usuário.",
    });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor EstoqueFácil rodando na porta ${PORT}`);
});
