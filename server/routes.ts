import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authRouter, requireAuth } from "./auth";
import { upload, pdfUpload } from "./upload";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files - MUST be before other routes
  // In production (dist/), go up one level. In dev, go up one level from server/
  const uploadPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', 'upload')
    : path.join(process.cwd(), 'upload');

  console.log(`[routes] Serving uploads from: ${uploadPath}`);
  app.use('/upload', express.static(uploadPath));

  // Auth routes
  app.use("/api/auth", authRouter);

  // Users route (protected)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPassword = users.map(({ password_hash, ...user }) => user);
      res.json({
        success: true,
        users: usersWithoutPassword,
        total: usersWithoutPassword.length
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar usuários"
      });
    }
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const { username, password, name, email, role } = req.body;

      // Validação
      if (!username || typeof username !== 'string' || username.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Nome de usuário deve ter pelo menos 3 caracteres"
        });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Senha deve ter pelo menos 6 caracteres"
        });
      }

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Nome é obrigatório"
        });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: "Email inválido"
        });
      }

      if (!role || typeof role !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Função é obrigatória"
        });
      }

      // Verificar se username já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Nome de usuário já está em uso"
        });
      }

      const user = await storage.createUser({ username, password, name, email, role });

      res.json({
        success: true,
        message: "Usuário criado com sucesso",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao criar usuário"
      });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, password, name, email, role } = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuário inválido"
        });
      }

      const updateData: any = {};

      if (username !== undefined) {
        if (typeof username !== 'string' || username.length < 3) {
          return res.status(400).json({
            success: false,
            message: "Nome de usuário deve ter pelo menos 3 caracteres"
          });
        }

        // Verificar se username já existe em outro usuário
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({
            success: false,
            message: "Nome de usuário já está em uso"
          });
        }

        updateData.username = username;
      }

      if (password !== undefined) {
        if (typeof password !== 'string' || password.length < 6) {
          return res.status(400).json({
            success: false,
            message: "Senha deve ter pelo menos 6 caracteres"
          });
        }
        updateData.password = password;
      }

      if (name !== undefined) {
        if (typeof name !== 'string') {
          return res.status(400).json({
            success: false,
            message: "Nome inválido"
          });
        }
        updateData.name = name;
      }

      if (email !== undefined) {
        if (typeof email !== 'string' || !email.includes('@')) {
          return res.status(400).json({
            success: false,
            message: "Email inválido"
          });
        }
        updateData.email = email;
      }

      if (role !== undefined) {
        if (typeof role !== 'string') {
          return res.status(400).json({
            success: false,
            message: "Função inválida"
          });
        }
        updateData.role = role;
      }

      await storage.updateUser(userId, updateData);

      res.json({
        success: true,
        message: "Usuário atualizado com sucesso"
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao atualizar usuário"
      });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      
      res.json({ 
        success: true, 
        message: "Lead cadastrado com sucesso",
        leadId: lead.id 
      });
    } catch (error: any) {
      console.error("Error creating lead:", error);
      
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          success: false, 
          message: "Dados inválidos",
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: "Erro ao processar sua solicitação" 
      });
    }
  });

  app.get("/api/ebook/download", async (req, res) => {
    try {
      // Buscar caminho do ebook no banco de dados
      const settings = await storage.getSiteSettings();

      const rootPath = process.env.NODE_ENV === 'production'
        ? path.join(__dirname, '..')
        : process.cwd();

      let ebookPath: string;
      if (settings?.ebook_path) {
        // Se existe ebook cadastrado, usar do banco
        ebookPath = path.join(rootPath, settings.ebook_path.replace(/^\//, ''));
      } else {
        // Fallback para o arquivo padrão
        ebookPath = process.env.NODE_ENV === 'production'
          ? path.join(__dirname, "assets", "7-Dicas-Infaliveis.pdf")
          : path.join(process.cwd(), "server", "assets", "7-Dicas-Infaliveis.pdf");
      }

      if (!fs.existsSync(ebookPath)) {
        return res.status(404).json({
          success: false,
          message: "E-book não encontrado"
        });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=7-Dicas-Infaliveis-para-Lotar-sua-Agenda.pdf");

      const fileStream = fs.createReadStream(ebookPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading ebook:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao baixar o e-book"
      });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json({
        success: true,
        leads,
        total: leads.length
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar leads"
      });
    }
  });

  // Site Settings routes (protected)
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar configurações"
      });
    }
  });

  app.post("/api/settings/logo", requireAuth, upload.single('logo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum arquivo enviado"
        });
      }

      const logoPath = `/upload/${req.file.filename}`;
      await storage.updateLogoPath(logoPath);

      res.json({
        success: true,
        message: "Logo atualizada com sucesso",
        logoPath
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao fazer upload da logo"
      });
    }
  });

  app.post("/api/settings/favicon", requireAuth, upload.single('favicon'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum arquivo enviado"
        });
      }

      const faviconPath = `/upload/${req.file.filename}`;
      await storage.updateFaviconPath(faviconPath);

      res.json({
        success: true,
        message: "Favicon atualizado com sucesso",
        faviconPath
      });
    } catch (error: any) {
      console.error("Error uploading favicon:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao fazer upload do favicon"
      });
    }
  });

  app.post("/api/settings/title", requireAuth, async (req, res) => {
    try {
      const { siteTitle } = req.body;

      if (!siteTitle || typeof siteTitle !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Título do site é obrigatório"
        });
      }

      if (siteTitle.length > 255) {
        return res.status(400).json({
          success: false,
          message: "Título do site deve ter no máximo 255 caracteres"
        });
      }

      await storage.updateSiteTitle(siteTitle);

      res.json({
        success: true,
        message: "Título do site atualizado com sucesso",
        siteTitle
      });
    } catch (error: any) {
      console.error("Error updating site title:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao atualizar título do site"
      });
    }
  });

  app.post("/api/settings/landing-texts", requireAuth, async (req, res) => {
    try {
      const { hero_title, hero_subtitle, hero_text_1, hero_text_2 } = req.body;

      // Validação
      if (!hero_title || typeof hero_title !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Título principal é obrigatório"
        });
      }

      if (!hero_subtitle || typeof hero_subtitle !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Subtítulo é obrigatório"
        });
      }

      // hero_text_1 e hero_text_2 são opcionais
      await storage.updateLandingTexts({
        hero_title,
        hero_subtitle,
        hero_text_1: hero_text_1 || '',
        hero_text_2: hero_text_2 || ''
      });

      res.json({
        success: true,
        message: "Textos da landing page atualizados com sucesso"
      });
    } catch (error: any) {
      console.error("Error updating landing texts:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao atualizar textos da landing page"
      });
    }
  });

  // Upload de e-book PDF
  app.post("/api/settings/ebook", requireAuth, pdfUpload.single('ebook'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum arquivo foi enviado"
        });
      }

      const ebookPath = `/upload/${req.file.filename}`;
      await storage.updateEbookPath(ebookPath);

      res.json({
        success: true,
        message: "E-book atualizado com sucesso",
        path: ebookPath
      });
    } catch (error: any) {
      console.error("Error uploading ebook:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao fazer upload do e-book"
      });
    }
  });

  // Scripts de terceiros (Meta Pixel, Google Analytics, Google Tag Manager)
  app.post("/api/settings/scripts", requireAuth, async (req, res) => {
    try {
      const { meta_pixel, google_analytics, google_tag_manager } = req.body;

      const updateData: any = {};

      if (meta_pixel !== undefined) {
        updateData.meta_pixel = meta_pixel;
      }

      if (google_analytics !== undefined) {
        updateData.google_analytics = google_analytics;
      }

      if (google_tag_manager !== undefined) {
        updateData.google_tag_manager = google_tag_manager;
      }

      await storage.updateScripts(updateData);

      res.json({
        success: true,
        message: "Scripts atualizados com sucesso"
      });
    } catch (error: any) {
      console.error("Error updating scripts:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Erro ao atualizar scripts"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
