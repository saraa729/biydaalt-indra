import { newsService } from "../services/news.service.js";

function handleError(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = message === "Invalid id" ? 400 : 400;
  return res.status(status).json({ message });
}

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }
  return id;
}

function parseBoolean(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw new Error("Invalid boolean value.");
}

export const newsController = {
  async list(req: any, res: any) {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const news = await newsService.listNews(search);
      return res.json(news);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const news = await newsService.getNewsById(id);

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.json(news);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: any, res: any) {
    try {
      const authorId = req.user?.id;
      if (!authorId) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const news = await newsService.createNews({
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.imageUrl,
        isPublished: parseBoolean(req.body.isPublished),
        authorId,
      });

      return res.status(201).json(news);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const news = await newsService.updateNews(id, {
        title: req.body.title,
        content: req.body.content,
        imageUrl: req.body.imageUrl,
        isPublished: parseBoolean(req.body.isPublished),
      });

      if (!news) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.json(news);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async remove(req: any, res: any) {
    try {
      const id = parseId(req.params.id);
      const deleted = await newsService.deleteNews(id);

      if (!deleted) {
        return res.status(404).json({ message: "News not found" });
      }

      return res.json({ deleted });
    } catch (error) {
      return handleError(res, error);
    }
  },
};
