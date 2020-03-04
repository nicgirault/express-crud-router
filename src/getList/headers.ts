import { Response } from 'express'

export const _setExposeHeaders = (res: Response) => {
  const rawValue = res.getHeader('Access-Control-Expose-Headers') || ''
  if (typeof rawValue !== 'string') {
    return
  }

  const headers = new Set(
    rawValue
      .split(',')
      .map(header => header.trim())
      .filter(header => Boolean(header))
  )

  headers.add('Content-Range')
  headers.add('X-Total-Count')
  res.header('Access-Control-Expose-Headers', [...headers].join(', '))
}

export const setGetListHeaders = (
  res: Response,
  offset: number,
  total: number,
  rowsCount: number
) => {
  _setExposeHeaders(res)
  res.header('Content-Range', `${offset}-${offset + rowsCount}/${total}`)
  res.header('X-Total-Count', `${total}`)
}
