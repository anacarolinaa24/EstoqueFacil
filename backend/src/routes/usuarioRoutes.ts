import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";
import { autenticacaoMiddleware } from "../middlewares/autenticacaoMiddleware";

const usuarioRoutes = Router();

const usuarioController = new UsuarioController();

// Cadastro público
usuarioRoutes.post("/cadastro", usuarioController.cadastrar);

// Login público
usuarioRoutes.post("/login", usuarioController.login);

// Consultar o próprio perfil — exige autenticação
usuarioRoutes.get(
  "/perfil",
  autenticacaoMiddleware,
  usuarioController.consultarPerfil,
);

// Atualizar o próprio perfil — exige autenticação
usuarioRoutes.put(
  "/perfil",
  autenticacaoMiddleware,
  usuarioController.atualizarPerfil,
);

export default usuarioRoutes;
