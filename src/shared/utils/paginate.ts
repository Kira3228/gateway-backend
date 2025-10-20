import { LimitOnUpdateNotSupportedError, QueryBuilder, SelectQueryBuilder } from "typeorm";
import { NotFoundError } from "../../Errors/error";

export const paginate = async <T>(qb: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 30,
  alias: string = `items`
) => {
  try {
    const skipAmount = (page - 1) * limit
    qb.skip(skipAmount).take(limit)

    const [items, totalCount] = await qb.getManyAndCount()

    if (!items) {
      throw new NotFoundError()
    }

    return {
      [alias]: items,
      totalCount,
      page,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 0,
      limit
    }
  }
  catch { }
}