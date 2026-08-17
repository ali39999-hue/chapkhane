---
name: payload-collection
description: الگوی استاندارد ساخت Collection در Payload CMS به همراه Access Control مناسب و Hook.
---

# Payload Collection Pattern

برای ساخت Collection در Payload CMS:
- **Access Control:** حتماً روی همه Collectionها به صورت صریح تعریف شود (`read`, `create`, `update`, `delete`). به صورت پیش‌فرض، دسترسی را محدود در نظر بگیرید (فقط Admin).
- کاربران باید فقط بتوانند رکوردهای متعلق به خودشان را بخوانند/ویرایش کنند مگر اینکه ادمین باشند.
- **Hooks:** برای منطق‌های کسب‌وکار مثل ثبت `AuditLog`، محاسبه مجدد، یا ارسال نوتیفیکیشن‌ها از `beforeChange` و `afterChange` استفاده کنید.
- فیلدها باید انگلیسی باشند، اما `label`ها و متون رابط کاربری به زبان فارسی و خوانا تنظیم شوند.
