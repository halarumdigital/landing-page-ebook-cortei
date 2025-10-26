import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

export const authRouter = Router();

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Usuário e senha são obrigatórios" 
      });
    }

    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Usuário ou senha inválidos" 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Usuário ou senha inválidos" 
      });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ 
      success: true, 
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao realizar login" 
    });
  }
});

// Logout
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err: any) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: "Erro ao fazer logout" 
      });
    }
    res.json({ success: true, message: "Logout realizado com sucesso" });
  });
});

// Check session
authRouter.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Não autenticado" 
    });
  }

  try {
    const user = await storage.getUserByUsername(req.session.username!);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Usuário não encontrado" 
      });
    }

    res.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erro ao verificar sessão" 
    });
  }
});

// Middleware to protect routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: "Acesso não autorizado" 
    });
  }
  next();
}
