# Workflow: Deploy to Staging

مراحل دیپلوی:
1. اجرای کامل و موفقیت‌آمیز جریان `/verify`.
2. اعمال دیتابیس مایگریشن‌ها (`Migrations`) روی محیط Staging.
3. اجرای بیلد Docker و انتشار کانتینرها.
4. تست سالم بودن محیط Staging با اجرای Smoke Tests.
