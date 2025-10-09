const express = require('express');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// الموقع الذي تريد مراقبته - غير هذا الرابط!
const WEBSITE_URL = "https://gartic.io/49r1Q8"; 
// غير الرابط لموقعك

class WebsiteMonitor {
    constructor() {
        this.screenshotCount = 0;
    }

    async captureScreenshot() {
        try {
            console.log(`📸 جاري التقاط صورة #${++this.screenshotCount}...`);
            
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            
            // اذهب للموقع وانتظر حتى التحميل
            await page.goto(WEBSITE_URL, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // أنتظر 2 ثانية إضافية للتأكد من تحميل كل شيء
            await new Promise(resolve => setTimeout(resolve, 2000));

            // أنشئ اسم ملف بالوقت
            const timestamp = new Date().toLocaleString('ar-SA').replace(/[/:, ]/g, '-');
            const filename = `screenshot-${timestamp}.png`;
            
            // التقط الصورة
            await page.screenshot({ 
                path: `/tmp/${filename}`,
                fullPage: true,
                quality: 80
            });

            await browser.close();

            console.log(`✅ تم التقاط الصورة بنجاح: ${filename}`);
            console.log(`⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`);
            console.log('─────────────────────────────────────');

            return filename;

        } catch (error) {
            console.log('❌ خطأ في التقاط الصورة:', error.message);
            return null;
        }
    }

    startMonitoring() {
        console.log('🚀 بدء مراقبة الموقع...');
        console.log(`🌐 الموقع: ${WEBSITE_URL}`);
        console.log('⏰ سيتم التقاط صورة كل 5 ثواني');
        console.log('─────────────────────────────────────');

        // التقط صورة فورية عند البدء
        this.captureScreenshot();

        // جدولة التقاط صورة كل 5 ثواني
        cron.schedule('*/5 * * * * *', () => {
            this.captureScreenshot();
        });
    }
}

// إنشاء المونيتور
const monitor = new WebsiteMonitor();

// صفحة الرئيسية لتأكد من أن السكربت شغال
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>مراقب الموقع</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .status { color: green; font-size: 24px; }
                .info { margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>🚀 سكربت مراقبة الموقع شغال!</h1>
            <div class="status">✅ الحالة: نشط</div>
            <div class="info">🌐 الموقع: ${WEBSITE_URL}</div>
            <div class="info">⏰ يتم التقاط صورة كل 5 ثواني</div>
            <div class="info">📸 عدد الصور الملتقطة: ${monitor.screenshotCount}</div>
            <p>تابع السجلات في لوحة تحكم Railway لترى الصور الملتقطة</p>
        </body>
        </html>
    `);
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`🖥️  السيرفر شغال على البورت ${port}`);
    console.log(`🔗 يمكنك زيارة: http://localhost:${port}`);
    console.log('─────────────────────────────────────');
    
    // بدء المراقبة
    monitor.startMonitoring();
});
