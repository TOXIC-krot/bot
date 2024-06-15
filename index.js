const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors')

const token = '6895723811:AAG3wGUA6HjTEOGEfkyxvPcXmm8L3oY_esQ';
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

const bootstrap = () => {
    bot.setMyCommands([
        { command: "/start", description: "Start" },
        { command: "/kirish", description: "Kirish" },
    ])

    bot.on("message", async msg => {
        const chatId = msg.chat.id;
        const text = msg.text;


        if (text === "/start") {
            await bot.sendMessage(chatId, 'Assalomu alaykum "JOY BOR" platformasiga xush kelibsiz! \nBoshlash uchun "Kirish" tugmasini bosing.', {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "Kirish",
                            web_app: {
                                url: "https://jbor.uz",
                            },
                        }]
                    ],
                },
            });
        };

        if (text === '/kirish') {
            await bot.sendMessage(
                chatId, 'Kirish uchun, "Kirish" tugmasini bosing', {
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "Kirish",
                                web_app: { url: "https://jbor.uz" }
                            }]
                        ],
                    }
                }
            )
        }


        if (msg.web_app_data?.data) {
            try {
                const data = JSON.parse(msg.web_app_data?.data);

                await bot.sendMessage(
                    chatId,
                    "Bizga ishonch bildirganiz uchun raxmat, siz sotib olgan kurslarni royhati"
                );

                for (item of data) {
                    await bot.sendPhoto(chatId, item.Image)
                    await bot.sendMessage(chatId, `${item.title} - ${item.quantity}`)
                }

                await bot.sendMessage(
                    chatId,
                    `Umumiy narx - ${data.reduce((a, c) => a + c.price * c.quantity, 0).toLocaleString("en-US", {style:'currency', currency:'USD'})}`
                );
            } catch (error) {
                console.log(error);
            }
        };
    });

};

bootstrap();


app.post('/web-data', async(req, res) => {
            const { queryID, products } = req.body;

            try {
                await bot.answerWebAppQuery(queryID, {
                            type: "article",
                            id: queryID,
                            title: "Muvafaqiyatli xarid qilindingiz",
                            input_message_content: {
                                message_text: `Xaridingiz bilan tabriklayman, siz ${products.reduce((a, c) => a + c.price * c.quantity, 0).toLocaleString("en-US", {style:'currency', currency:'USD'})} qiymatga ega mahsulot sotib oldingiz, ${products.map(c => `${c.title} ${c.quantity}X`)
                .join(', ')}`,
            },
        });
        return res.status(200).json({})
    }catch(error){
        return res.status(500).json({})
    }
});

app.listen(process.env.PORT || 8001, () =>
    console.log('Server started')
);