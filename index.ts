const fs = require('fs')
const path = require('path')
const nodeCrypto = require('crypto')
const { v4: uuidv4 } = require('uuid')

const hash = (str: string): string =>
  nodeCrypto.createHash('md5').update(str).digest('hex')

const readAdminText = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, 'admins.txt')
    fs.readFile(filePath, { encoding: 'utf-8' }, (err: Error, data: string) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })

interface IAdmin {
  email: string
  name: string
  bio: string
  facebook: string
  twitter: string
  website: string
  linkedin: string
  slug: string
  location: string
  role: string
  image: string
}

const parseAdminText = (text: string): Promise<IAdmin[]> => {
  const lines = text.split('\n')
  const columns = [
    'email',
    'name',
    'bio',
    'facebook',
    'twitter',
    'website',
    'linkedin',
    'slug',
    'location',
    'role',
    'image',
  ]
  const admins = []
  lines.forEach((line, idx) => {
    const columnIdx = idx % columns.length
    const column = columns[columnIdx]
    const isNewAdmin = columnIdx === 0
    const admin = isNewAdmin ? {} : admins[admins.length - 1]
    admin[column] = line

    if (isNewAdmin) {
      admins.push(admin)
    }
  })
  return Promise.resolve(admins as IAdmin[])
}

const withCleanedImage = (admins: IAdmin[]): Promise<IAdmin[]> =>
  Promise.resolve(
    admins.map(({ image, ...rest }) => ({ ...rest, image: `https:${image}` })),
  )

type IAdminWithCredentials = IAdmin & { proxy: string; password: string }

const withCredentials = (admins: IAdmin[]): Promise<IAdminWithCredentials[]> =>
  Promise.resolve(
    admins.map(
      (admin): IAdminWithCredentials => ({
        ...admin,
        proxy: `${hash(admin.email)}@camcabo.com`,
        password: uuidv4(),
      }),
    ),
  )

const writeAdminData = (admins: IAdminWithCredentials[]): Promise<void> =>
  new Promise((resolve, reject) =>
    fs.writeFile('output.json', JSON.stringify(admins), 'utf8', (err) => {
      if (err) {
        console.log('An error occured while writing JSON Object to File.')
        reject(err)
      }

      resolve()
    }),
  )

const readAdminData = (): Promise<IAdminWithCredentials[]> =>
  new Promise((resolve, reject) =>
    fs.readFile('output.json', { encoding: 'utf-8' }, (err, data: string) => {
      if (err) {
        return reject(err)
      }

      const admins = JSON.parse(data) as IAdminWithCredentials[]
      resolve(admins)
    }),
  )

const args = process.argv
const action = args[2]

if (!action) {
  throw Error('Usage: ts-node index.ts {write | list | get}')
} else if (action === 'write') {
  readAdminText()
    .then(parseAdminText)
    .then(withCleanedImage)
    .then(withCredentials)
    .then(writeAdminData)
    .then(() => console.log('Done.'))
} else if (action === 'list') {
  readAdminData().then((admins) =>
    admins.forEach((admin) => console.log(`${admin.name}\t${admin.proxy}`)),
  )
} else if (action === 'get') {
  const id = args[3]
  if (!id) {
    throw Error('Usage: ts-node index.ts get {ID}')
  }

  readAdminData()
    .then((admins) => admins.filter(({ proxy }) => proxy.startsWith(id)))
    .then((admins) => admins[0])
    .then((admin) => {
      if (!admin) {
        throw Error('Admin with specified ID not found')
      }
      console.log(
        [
          admin.name,
          admin.proxy,
          admin.password,
          `${admin.location} | ${admin.role}`,
          admin.website || admin.linkedin,
          admin.facebook,
          admin.twitter,
          admin.bio,
          admin.image,
        ].join('\n'),
      )
    })
} else {
  throw Error('Usage: ts-node index.ts {write | list | get}')
}
