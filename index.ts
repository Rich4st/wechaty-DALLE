import type { Message } from 'wechaty'
import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import QrTerminal from 'qrcode-terminal'
import type { WechatyInterface } from 'wechaty/impls'
import { Configuration, OpenAIApi } from 'openai'
import { FileBox } from 'file-box'

const bot: WechatyInterface = WechatyBuilder.build({
  name: 'puppet-wechat',
  puppetOptions: {
    uos: true,
  },
  puppet: 'wechaty-puppet-wechat',
})

const onScan = async (qrcode: any, status: ScanStatus) => {
  if (status === ScanStatus.Waiting && qrcode) {
    const QrCode = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('')

    log.info(`onScan: ${ScanStatus[status]}(${status}) - ${QrCode}`)

    QrTerminal.generate(qrcode, { small: true }) // show qrcode on console
  }
  else {
    log.info(`onScan: ${ScanStatus[status]}(${status})`)
  }
}

/* on login */
const onLogin = async (user: any) => {
  log.info(`${user} login`)
}

/* on logout */
const onLogout = async (user: any, reason: any) => {
  log.info(`${user} logout, reason: ${reason}`)
}

const configuration = new Configuration({
  apiKey: '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'
})

const openai = new OpenAIApi(configuration);

function main(prompt: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    await openai.createImage({
      prompt: prompt,
      n: 1,
      size: '512x512'
    }).then((r) => {
      if (r.data.data[0].url) {
        resolve(r.data.data[0].url)
      }
    }).catch((e) => {
      console.error(e)
      resolve('https://openailabsprodscus.blob.core.windows.net/private/user-G3b1Tbe2PYU88wZBBx5TG9ze/generations/generation-AE1pcfXz7S9JZ4OXL1lWtBJg/image.webp?st=2023-03-01T12%3A22%3A40Z&se=2023-03-01T14%3A20%3A40Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/webp&skoid=15f0b47b-a152-4599-9e98-9cb4a58269f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-03-01T12%3A22%3A39Z&ske=2023-03-08T12%3A22%3A39Z&sks=b&skv=2021-08-06&sig=jJtQbeDt%2BOb5w/Q0/y7%2BPJqYEdwZc9Y4eRHuEEV8VL0%3D')
    });

    reject('error')
  })
}

bot.on('scan', onScan)
  .on('login', onLogin)
  .on('logout', onLogout)
  .on('message', async (msg: Message) => {
    if (msg.self()) return

    const room = msg.room()

    const text = msg.text();

    if (text.startsWith('#')) {
      const image_url = await main(text)

      const file = FileBox.fromUrl(image_url)
      if (room) {
        await room.say(file)
      } else {
        await msg.say(file)
      }

    }

  })

/* start bot */
bot.start().then(async () => {
  console.log(`✨ Rich4$t is online now.`)
})
