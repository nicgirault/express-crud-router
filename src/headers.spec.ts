import { _setExposeHeaders, setGetListHeaders } from './headers'

describe('headers', () => {
  describe('_setExposeHeaders', () => {
    it('does silently pass unknown header types', () => {
      const response1: any = {
        getHeader: jest.fn().mockReturnValue(3),
      }
      _setExposeHeaders(response1)

      const response2: any = {
        getHeader: jest.fn().mockReturnValue(['some', 'headers']),
      }
      _setExposeHeaders(response2)
    })

    it('sets Access-Control-Expose-Headers header', () => {
      const response: any = {
        getHeader: jest.fn().mockReturnValue(''),
        header: jest.fn(),
      }
      _setExposeHeaders(response)
      expect(response.header).toHaveBeenCalled()
      expect(response.header.mock.calls[0][0]).toEqual(
        'Access-Control-Expose-Headers'
      )
      expect(response.header.mock.calls[0][1]).toContain('Content-Range')
      expect(response.header.mock.calls[0][1]).toContain('X-Total-Count')
    })
  })

  describe('setGetListHeaders', () => {
    const response: any = {
      getHeader: jest.fn().mockReturnValue(''),
      header: jest.fn(),
    }
    setGetListHeaders(response, 10, 1000, 50)
    expect(response.header).toHaveBeenCalledTimes(3)
    expect(response.header).toHaveBeenCalledWith(
      'Access-Control-Expose-Headers',
      'Content-Range, X-Total-Count'
    )
    expect(response.header).toHaveBeenCalledWith('Content-Range', '10-60/1000')
    expect(response.header).toHaveBeenCalledWith('X-Total-Count', '1000')
  })
})
