import { inject, injectable } from "tsyringe";
import { RouterToken } from "../Message/message.controller";
import { Request, Response, Router } from "express";
import { log } from "console";


@injectable()
export class MessageExtController {
  constructor(
    @inject(RouterToken) private readonly router: Router
  ) {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get('/all/:id', this.getExtendedData.bind(this))
  }

  async getExtendedData(req: Request, res: Response) {
    const msgId = req.params.id
    log(msgId)
  }

  getRoutes() {
    return this.router
  }
}