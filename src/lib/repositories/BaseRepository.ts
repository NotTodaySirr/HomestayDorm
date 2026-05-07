import prisma from '../db';

type BaseModel<T, CreateInput, UpdateInput> = {
  findUnique(args: { where: { id: string } }): Promise<T | null>;
  findMany(): Promise<T[]>;
  create(args: { data: CreateInput }): Promise<T>;
  update(args: { where: { id: string }; data: UpdateInput }): Promise<T>;
  delete(args: { where: { id: string } }): Promise<T>;
};

export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  Model extends BaseModel<T, CreateInput, UpdateInput>,
> {
  protected db = prisma;
  protected model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }
}
