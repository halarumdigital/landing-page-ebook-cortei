import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const ebookPath = path.join(process.cwd(), "server", "assets", "7-Dicas-Infaliveis.pdf");
      
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

  const httpServer = createServer(app);

  return httpServer;
}
