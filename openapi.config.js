import { generateService } from '@umijs/openapi'
import { resolve } from 'path'

generateService({
  requestLibPath: "import request from '@/axioss/request'",
  schemaPath: resolve('./api-doc.json'),
  serversPath: './src',
})
