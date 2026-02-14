import { Request, Response } from "express"
import { format, fromRequest, getStatusCode, handleError, isSuccessful } from "express-ext"
import { validate } from "xvalidators"
import { getResource } from "../resources"
import { User, UserFilter, userModel, UserService } from "./user"

export class UserController {
  constructor(protected service: UserService) {
    this.search = this.search.bind(this)
    this.load = this.load.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.patch = this.patch.bind(this)
    this.delete = this.delete.bind(this)
  }
  async search(req: Request, res: Response) {
    const filter = fromRequest<UserFilter>(req, ["fields"])
    format(filter, ["dateOfBirth"])
    const { limit, page, fields } = filter
    try {
      const result = await this.service.search(filter, limit, page, fields)
      res.status(200).json(result)
    } catch (err) {
      handleError(err, res)
    }
  }
  async load(req: Request, res: Response) {
    const id = req.params.id as string
    try {
      const user = await this.service.load(id)
      const status = user ? 200 : 404
      res.status(status).json(user)
    } catch (err) {
      handleError(err, res)
    }
  }
  async create(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    const errors = validate<User>(user, userModel, resource)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    try {
      const result = await this.service.create(user)
      const status = isSuccessful(result) ? 201 : 409
      res.status(status).json(result).end()
    } catch (err) {
      handleError(err, res)
    }
  }
  async update(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    user.id = req.params.id as string
    const errors = validate<User>(user, userModel, resource)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    try {
      const result = await this.service.update(user)
      const status = isSuccessful(result) ? 200 : 404
      res.status(status).json(result).end()
    } catch (err) {
      handleError(err, res)
    }
  }
  async patch(req: Request, res: Response) {
    const resource = getResource(req)
    const user = req.body as User
    user.id = req.params.id as string
    const errors = validate<User>(user, userModel, resource, false, true)
    if (errors.length > 0) {
      return res.status(getStatusCode(errors)).json(errors).end()
    }
    try {
      const result = await this.service.patch(user)
      const status = isSuccessful(result) ? 200 : 404
      res.status(status).json(result).end()
    } catch (err) {
      handleError(err, res)
    }
  }
  async delete(req: Request, res: Response) {
    const id = req.params.id as string
    try {
      const count = await this.service.delete(id)
      const status = count > 0 ? 200 : 410
      res.status(status).json(count).end()
    } catch (err) {
      handleError(err, res)
    }
  }
}
