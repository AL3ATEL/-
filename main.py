# main.py
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

BOT_TOKEN = os.environ['8220823694:AAFlNjmbPryjRhyHTF9ue8ykiOJmWNEorY0']

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('👋 البوت يعمل على Railway!')

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f'📝: {update.message.text}')

if __name__ == '__main__':
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    app.run_polling()
